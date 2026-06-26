<template>
    <div class="consumptions-page consumptions-page--standalone">
        <BaseLoader v-if="isPageLoading" />

        <template v-else>
            <section class="consumptions-page__hero">
                <div class="consumptions-page__hero-copy">
                    <span class="consumptions-page__eyebrow">الاستهلاكات</span>
                    <h2 class="consumptions-page__hero-title">متابعة استهلاك مزارع المستخدمين</h2>
                    <p class="consumptions-page__hero-text">
                        اختر صاحب المزرعة أولًا، وبعدها اختر المزرعة، ثم اختر السنة علشان
                        تشوف إجماليات الري والتسميد والرش بشكل مرتب وواضح، وكمان تقدر
                        تحمل تقرير سنة أو تقرير شهر PDF.
                    </p>
                </div>

                <div class="consumptions-page__hero-filter consumptions-page__hero-filter--double">
                    <div class="consumptions-page__field-wrap">
                        <label class="consumptions-page__field-label">اختر صاحب المزرعة</label>

                        <div class="consumptions-page__select-wrap">
                            <BaseIcon name="solar:user-outline" class="consumptions-page__select-icon" />

                            <select v-model="selectedUserId"
                                class="consumptions-page__select consumptions-page__select--fancy">
                                <option value="">اختر صاحب المزرعة</option>
                                <option v-for="user in usersOptions" :key="user.id" :value="String(user.id)">
                                    {{ user.name }}
                                </option>
                            </select>
                        </div>

                        <div v-if="!usersOptions.length" class="consumptions-page__mini-empty">
                            لا يوجد أصحاب مزارع متاحين
                        </div>
                    </div>

                    <div class="consumptions-page__field-wrap">
                        <label class="consumptions-page__field-label">اختر المزرعة</label>

                        <div v-if="selectedUserId && farmsOptions.length"
                            class="consumptions-page__cards-grid consumptions-page__cards-grid--farms">
                            <button v-for="farm in farmsOptions" :key="farm.id" type="button"
                                class="consumptions-page__entity-card consumptions-page__entity-card--farm" :class="{
                                    'consumptions-page__entity-card--active':
                                        String(selectedFarmId) === String(farm.id),
                                }" @click="selectedFarmId = String(farm.id)">
                                <div
                                    class="consumptions-page__entity-card-icon consumptions-page__entity-card-icon--farm">
                                    <BaseIcon name="mdi:sprout" />
                                </div>

                                <div class="consumptions-page__entity-card-copy">
                                    <strong>{{ farm.name }}</strong>
                                    <span>مزرعة</span>
                                </div>

                                <div class="consumptions-page__entity-card-check">
                                    <BaseIcon :name="String(selectedFarmId) === String(farm.id)
                                        ? 'solar:check-circle-bold'
                                        : 'solar:alt-arrow-left-outline'
                                        " />
                                </div>
                            </button>
                        </div>

                        <div v-else-if="!selectedUserId" class="consumptions-page__mini-empty">
                            اختار صاحب المزرعة الأول
                        </div>

                        <div v-else class="consumptions-page__mini-empty">
                            لا توجد مزارع لهذا المستخدم
                        </div>
                    </div>
                </div>
            </section>

            <section v-if="selectedUserId && selectedFarmId && availableYears.length" class="consumptions-page__years">
                <div class="consumptions-page__years-head consumptions-page__years-head--actions">
                    <div>
                        <h3 class="consumptions-page__section-title">كل السنوات</h3>
                        <p class="consumptions-page__section-subtitle">
                            اختار السنة اللي عايز تعرض إجمالياتها أو تحمل تقريرها
                        </p>
                    </div>

                    <button type="button"
                        class="consumptions-page__download-button consumptions-page__download-button--year"
                        @click="downloadYearReport">
                        <BaseIcon name="solar:download-outline" />
                        تحميل تقرير السنة
                    </button>
                </div>

                <div class="consumptions-page__years-list">
                    <button v-for="year in availableYears" :key="year" type="button"
                        class="consumptions-page__year-chip" :class="{
                            'consumptions-page__year-chip--active': selectedYear === year,
                        }" @click="selectedYear = year">
                        {{ year }}
                    </button>
                </div>
            </section>

            <section v-if="!selectedUserId" class="consumptions-page__empty-state">
                <div class="consumptions-page__empty-icon">
                    <BaseIcon name="solar:users-group-rounded-outline" />
                </div>
                <h3 class="consumptions-page__empty-title">اختر صاحب المزرعة</h3>
                <p class="consumptions-page__empty-text">اختر المستخدم أولًا علشان نجيب مزارعه</p>
            </section>

            <section v-else-if="selectedUserId && !selectedFarmId" class="consumptions-page__empty-state">
                <div class="consumptions-page__empty-icon">
                    <BaseIcon name="mdi:sprout" />
                </div>
                <h3 class="consumptions-page__empty-title">اختر المزرعة</h3>
                <p class="consumptions-page__empty-text">اختر المزرعة لعرض الإجماليات</p>
            </section>

            <section v-else-if="selectedUserId && selectedFarmId && !availableYears.length"
                class="consumptions-page__empty-state">
                <div class="consumptions-page__empty-icon">
                    <BaseIcon name="solar:calendar-mark-outline" />
                </div>
                <h3 class="consumptions-page__empty-title">لا توجد بيانات</h3>
                <p class="consumptions-page__empty-text">
                    لا توجد تقارير أو استهلاكات متاحة لهذه المزرعة حاليًا
                </p>
            </section>

            <template v-else>
                <section class="consumptions-page__stats">
                    <!-- Irrigation total -->
                    <article class="consumptions-page__stat-card">
                        <div class="consumptions-page__stat-icon">
                            <BaseIcon name="solar:waterdrops-outline" />
                        </div>
                        <div class="consumptions-page__stat-copy">
                            <p class="consumptions-page__stat-label">إجمالي مياه الري</p>
                            <h3 class="consumptions-page__stat-value">
                                {{ formatNumber(yearlyActualTotals.irrigationLiters) }}
                                <span>لتر</span>
                            </h3>
                            <p class="consumptions-page__stat-planned">{{ formatNumber(yearlyTotals.irrigationLiters) }} لتر</p>
                        </div>
                    </article>

                    <!-- Fertilization total -->
                    <article class="consumptions-page__stat-card consumptions-page__stat-card--clickable"
                        @click="toggleExpandedCard('fertilization')">
                        <div class="consumptions-page__stat-arrow">
                            <BaseIcon :name="expandedCard === 'fertilization'
                                ? 'solar:alt-arrow-up-outline'
                                : 'solar:alt-arrow-down-outline'
                                " />
                        </div>
                        <div class="consumptions-page__stat-copy">
                            <p class="consumptions-page__stat-label">إجمالي التسميد</p>
                            <h3 class="consumptions-page__stat-value">
                                {{ formatNumber(yearlyActualTotals.fertilizationKg) }}
                                <span>كجم</span>
                            </h3>
                            <p class="consumptions-page__stat-planned">{{ formatNumber(yearlyTotals.fertilizationKg) }} كجم</p>
                            <p class="consumptions-page__stat-hint">اضغط لعرض أنواع الأسمدة المستخدمة</p>
                        </div>
                        <div class="consumptions-page__stat-icon">
                            <BaseIcon name="solar:leaf-outline" />
                        </div>
                    </article>

                    <!-- Spraying total -->
                    <article class="consumptions-page__stat-card consumptions-page__stat-card--clickable"
                        @click="toggleExpandedCard('spraying')">
                        <div class="consumptions-page__stat-arrow">
                            <BaseIcon :name="expandedCard === 'spraying'
                                ? 'solar:alt-arrow-up-outline'
                                : 'solar:alt-arrow-down-outline'
                                " />
                        </div>
                        <div class="consumptions-page__stat-copy">
                            <p class="consumptions-page__stat-label">إجمالي الرش</p>
                            <h3 class="consumptions-page__stat-value">
                                {{ formatNumber(yearlyActualTotals.sprayingKg) }}
                                <span>كجم</span>
                            </h3>
                            <p class="consumptions-page__stat-planned">{{ formatNumber(yearlyTotals.sprayingKg) }} كجم</p>
                            <p class="consumptions-page__stat-hint">اضغط لعرض الأصناف المستخدمة</p>
                        </div>
                        <div class="consumptions-page__stat-icon">
                            <BaseIcon name="solar:magic-stick-3-outline" />
                        </div>
                    </article>
                </section>

                <section v-if="expandedCard === 'fertilization'" class="consumptions-page__details-box">
                    <div class="consumptions-page__details-head">
                        <h3 class="consumptions-page__section-title">تفاصيل الأسمدة المستخدمة</h3>
                        <p class="consumptions-page__section-subtitle">
                            إجمالي كل صنف تم استخدامه خلال سنة {{ selectedYear }}
                        </p>
                    </div>

                    <div v-if="yearlyFertilizationMerged.length" class="consumptions-page__details-list">
                        <div v-for="item in yearlyFertilizationMerged" :key="`fert-${item.name}`"
                            class="consumptions-page__details-item">
                            <div class="consumptions-page__details-item-copy">
                                <strong>{{ item.name }}</strong>
                                <span>إجمالي خلال السنة</span>
                            </div>
                            <div class="consumptions-page__details-item-vals">
                                <span class="consumptions-page__details-item-value">{{ formatNumber(item.actual) }} كجم</span>
                                <span class="consumptions-page__details-item-planned">{{ formatNumber(item.planned) }} كجم</span>
                            </div>
                        </div>
                    </div>

                    <div v-else class="consumptions-page__details-empty">
                        لا توجد أصناف تسميد مسجلة في السنة دي
                    </div>
                </section>

                <section v-if="expandedCard === 'spraying'" class="consumptions-page__details-box">
                    <div class="consumptions-page__details-head">
                        <h3 class="consumptions-page__section-title">تفاصيل أصناف الرش المستخدمة</h3>
                        <p class="consumptions-page__section-subtitle">
                            إجمالي كل صنف تم استخدامه خلال سنة {{ selectedYear }}
                        </p>
                    </div>

                    <div v-if="yearlySprayingMerged.length" class="consumptions-page__details-list">
                        <div v-for="item in yearlySprayingMerged" :key="`spray-${item.name}`"
                            class="consumptions-page__details-item">
                            <div class="consumptions-page__details-item-copy">
                                <strong>{{ item.name }}</strong>
                                <span>إجمالي خلال السنة</span>
                            </div>
                            <div class="consumptions-page__details-item-vals">
                                <span class="consumptions-page__details-item-value">{{ formatNumber(item.actual) }} كجم</span>
                                <span class="consumptions-page__details-item-planned">{{ formatNumber(item.planned) }} كجم</span>
                            </div>
                        </div>
                    </div>

                    <div v-else class="consumptions-page__details-empty">
                        لا توجد أصناف رش مسجلة في السنة دي
                    </div>
                </section>

                <section class="consumptions-page__months">
                    <div class="consumptions-page__months-head">
                        <h3 class="consumptions-page__section-title">إجماليات سنة {{ selectedYear }}</h3>
                        <p class="consumptions-page__section-subtitle">ملخص الاستهلاك الشهري للمزرعة المختارة</p>
                    </div>

                    <div class="consumptions-page__months-grid">
                        <article v-for="month in monthlyBreakdown" :key="month.monthKey"
                            class="consumptions-page__month-card">

                            <!-- Month Header -->
                            <div class="consumptions-page__month-head">
                                <h4 class="consumptions-page__month-title">{{ month.monthLabel }}</h4>
                                <span v-if="month.weeksCount > 0" class="consumptions-page__month-badge">
                                    {{ month.weeksCount }} أسبوع
                                </span>
                            </div>

                            <!-- Core metric tiles: actual as main, planned as strikethrough -->
                            <div class="consumptions-page__month-metrics">
                                <div v-if="month.irrigationLiters > 0 || month.actualIrrigationLiters > 0" class="consumptions-page__metric">
                                    <span class="consumptions-page__metric-label">مياه الري</span>
                                    <strong class="consumptions-page__metric-value">
                                        {{ formatNumber(month.actualIrrigationLiters) }} لتر
                                    </strong>
                                    <span class="consumptions-page__metric-planned">
                                        {{ formatNumber(month.irrigationLiters) }} لتر
                                    </span>
                                </div>

                                <button v-if="month.fertilizationKg > 0 || month.actualFertilizationKg > 0"
                                    type="button"
                                    class="consumptions-page__metric consumptions-page__metric--clickable"
                                    @click="toggleMonthExpanded(month.monthKey, 'fertilization')">
                                    <span class="consumptions-page__metric-label">التسميد</span>
                                    <strong class="consumptions-page__metric-value">
                                        {{ formatNumber(month.actualFertilizationKg) }} كجم
                                    </strong>
                                    <span class="consumptions-page__metric-planned">
                                        {{ formatNumber(month.fertilizationKg) }} كجم
                                    </span>
                                    <small class="consumptions-page__metric-hint">اضغط لعرض التفاصيل</small>
                                </button>

                                <button v-if="month.sprayingKg > 0 || month.actualSprayingKg > 0"
                                    type="button"
                                    class="consumptions-page__metric consumptions-page__metric--clickable"
                                    @click="toggleMonthExpanded(month.monthKey, 'spraying')">
                                    <span class="consumptions-page__metric-label">الرش</span>
                                    <strong class="consumptions-page__metric-value">
                                        {{ formatNumber(month.actualSprayingKg) }} كجم
                                    </strong>
                                    <span class="consumptions-page__metric-planned">
                                        {{ formatNumber(month.sprayingKg) }} كجم
                                    </span>
                                    <small class="consumptions-page__metric-hint">اضغط لعرض التفاصيل</small>
                                </button>
                            </div>

                            <!-- ═══ Comparison Bars (outside metric tiles) ═══ -->
                            <div class="consumptions-page__comparison">

                                <!-- Irrigation bar -->
                                <div v-if="month.irrigationLiters > 0 || month.actualIrrigationLiters > 0" class="consumptions-page__comparison-row">
                                    <div class="consumptions-page__comparison-label">
                                        <BaseIcon name="solar:waterdrops-outline" class="consumptions-page__comparison-icon consumptions-page__comparison-icon--irr" />
                                        <span>الري</span>
                                    </div>
                                    <div class="consumptions-page__comparison-bar-wrap">
                                        <div class="consumptions-page__comparison-bar-track">
                                            <!-- Actual fill -->
                                            <div
                                                class="consumptions-page__comparison-bar-fill consumptions-page__comparison-bar-fill--actual"
                                                :style="{ width: month.irrigationLiters > 0 ? Math.min(100, (month.actualIrrigationLiters / month.irrigationLiters) * 100) + '%' : (month.actualIrrigationLiters > 0 ? '100%' : '0%') }"
                                            />
                                            <!-- Planned-to-date marker (current month only) -->
                                            <div
                                                v-if="month.isCurrentMonth && month.plannedToDateIrrigationLiters !== null && month.irrigationLiters > 0"
                                                class="consumptions-page__comparison-bar-marker"
                                                :style="{ left: (100 - Math.min(100, (month.plannedToDateIrrigationLiters / month.irrigationLiters) * 100)) + '%' }"
                                            />
                                        </div>
                                        <div class="consumptions-page__comparison-vals">
                                            <span class="consumptions-page__comparison-val consumptions-page__comparison-val--actual">
                                                {{ formatNumber(month.actualIrrigationLiters) }} لتر
                                            </span>
                                            <span v-if="month.isCurrentMonth && month.plannedToDateIrrigationLiters !== null" class="consumptions-page__comparison-val consumptions-page__comparison-val--ptd">
                                                مخطط لحد اليوم: {{ formatNumber(month.plannedToDateIrrigationLiters) }} لتر
                                            </span>
                                            <span class="consumptions-page__comparison-val consumptions-page__comparison-val--planned">
                                                {{ formatNumber(month.irrigationLiters) }} لتر
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Fertilization bar -->
                                <div v-if="month.fertilizationKg > 0 || month.actualFertilizationKg > 0" class="consumptions-page__comparison-row">
                                    <div class="consumptions-page__comparison-label">
                                        <BaseIcon name="solar:leaf-outline" class="consumptions-page__comparison-icon consumptions-page__comparison-icon--fert" />
                                        <span>التسميد</span>
                                    </div>
                                    <div class="consumptions-page__comparison-bar-wrap">
                                        <div class="consumptions-page__comparison-bar-track">
                                            <div
                                                class="consumptions-page__comparison-bar-fill consumptions-page__comparison-bar-fill--actual"
                                                :style="{ width: month.fertilizationKg > 0 ? Math.min(100, (month.actualFertilizationKg / month.fertilizationKg) * 100) + '%' : (month.actualFertilizationKg > 0 ? '100%' : '0%') }"
                                            />
                                            <div
                                                v-if="month.isCurrentMonth && month.plannedToDateFertilizationKg !== null && month.fertilizationKg > 0"
                                                class="consumptions-page__comparison-bar-marker"
                                                :style="{ left: (100 - Math.min(100, (month.plannedToDateFertilizationKg / month.fertilizationKg) * 100)) + '%' }"
                                            />
                                        </div>
                                        <div class="consumptions-page__comparison-vals">
                                            <span class="consumptions-page__comparison-val consumptions-page__comparison-val--actual">
                                                {{ formatNumber(month.actualFertilizationKg) }} كجم
                                            </span>
                                            <span v-if="month.isCurrentMonth && month.plannedToDateFertilizationKg !== null" class="consumptions-page__comparison-val consumptions-page__comparison-val--ptd">
                                                مخطط لحد اليوم: {{ formatNumber(month.plannedToDateFertilizationKg) }} كجم
                                            </span>
                                            <span class="consumptions-page__comparison-val consumptions-page__comparison-val--planned">
                                                {{ formatNumber(month.fertilizationKg) }} كجم
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Spraying bar -->
                                <div v-if="month.sprayingKg > 0 || month.actualSprayingKg > 0" class="consumptions-page__comparison-row">
                                    <div class="consumptions-page__comparison-label">
                                        <BaseIcon name="solar:magic-stick-3-outline" class="consumptions-page__comparison-icon consumptions-page__comparison-icon--spray" />
                                        <span>الرش</span>
                                    </div>
                                    <div class="consumptions-page__comparison-bar-wrap">
                                        <div class="consumptions-page__comparison-bar-track">
                                            <div
                                                class="consumptions-page__comparison-bar-fill consumptions-page__comparison-bar-fill--actual"
                                                :style="{ width: month.sprayingKg > 0 ? Math.min(100, (month.actualSprayingKg / month.sprayingKg) * 100) + '%' : (month.actualSprayingKg > 0 ? '100%' : '0%') }"
                                            />
                                            <div
                                                v-if="month.isCurrentMonth && month.plannedToDateSprayingKg !== null && month.sprayingKg > 0"
                                                class="consumptions-page__comparison-bar-marker"
                                                :style="{ left: (100 - Math.min(100, (month.plannedToDateSprayingKg / month.sprayingKg) * 100)) + '%' }"
                                            />
                                        </div>
                                        <div class="consumptions-page__comparison-vals">
                                            <span class="consumptions-page__comparison-val consumptions-page__comparison-val--actual">
                                                {{ formatNumber(month.actualSprayingKg) }} كجم
                                            </span>
                                            <span v-if="month.isCurrentMonth && month.plannedToDateSprayingKg !== null" class="consumptions-page__comparison-val consumptions-page__comparison-val--ptd">
                                                مخطط لحد اليوم: {{ formatNumber(month.plannedToDateSprayingKg) }} كجم
                                            </span>
                                            <span class="consumptions-page__comparison-val consumptions-page__comparison-val--planned">
                                                {{ formatNumber(month.sprayingKg) }} كجم
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Legend -->
                                <div class="consumptions-page__comparison-legend">
                                    <span class="consumptions-page__comparison-legend-item consumptions-page__comparison-legend-item--actual">
                                        <span class="consumptions-page__comparison-legend-dot" />
                                        منفذ فعلاً
                                    </span>
                                    <span v-if="month.isCurrentMonth" class="consumptions-page__comparison-legend-item consumptions-page__comparison-legend-item--ptd">
                                        <span class="consumptions-page__comparison-legend-dash" />
                                        مخطط لحد اليوم
                                    </span>
                                    <span class="consumptions-page__comparison-legend-item consumptions-page__comparison-legend-item--planned">
                                        <span class="consumptions-page__comparison-legend-dot consumptions-page__comparison-legend-dot--planned" />
                                        مخطط الشهر
                                    </span>
                                </div>
                            </div>

                            <!-- Download action -->
                            <div class="consumptions-page__month-actions">
                                <button type="button" class="consumptions-page__download-button"
                                    @click="downloadMonthReport(month)">
                                    <BaseIcon name="solar:download-outline" />
                                    تحميل تقرير الشهر
                                </button>
                            </div>

                            <!-- Fertilization details dropdown -->
                            <div v-if="monthExpandedMap[month.monthKey] === 'fertilization'"
                                class="consumptions-page__month-details">
                                <h5 class="consumptions-page__month-details-title">
                                    تفاصيل التسميد في {{ month.monthLabel }}
                                </h5>

                                <div v-if="mergeProducts(month.actualFertilizationProducts, month.fertilizationProducts, month.plannedToDateFertilizationProducts, month.isCurrentMonth).length"
                                    class="consumptions-page__details-list">
                                    <div v-for="item in mergeProducts(month.actualFertilizationProducts, month.fertilizationProducts, month.plannedToDateFertilizationProducts, month.isCurrentMonth)"
                                        :key="`${month.monthKey}-fert-${item.name}`"
                                        class="consumptions-page__details-item">
                                        <div class="consumptions-page__details-item-copy">
                                            <strong>{{ item.name }}</strong>
                                            <span>خلال الشهر</span>
                                        </div>
                                        <div class="consumptions-page__details-item-vals">
                                            <span class="consumptions-page__details-item-value">{{ formatNumber(item.actual) }} كجم</span>
                                            <!-- Current month: show ptd instead of full planned -->
                                            <span v-if="month.isCurrentMonth" class="consumptions-page__details-item-ptd">
                                                مخطط لحد اليوم: {{ formatNumber(item.ptd) }} كجم
                                            </span>
                                            <span v-else class="consumptions-page__details-item-planned">
                                                {{ formatNumber(item.planned) }} كجم
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div v-else class="consumptions-page__details-empty">
                                    لا توجد أصناف تسميد في الشهر ده
                                </div>
                            </div>

                            <!-- Spraying details dropdown -->
                            <div v-if="monthExpandedMap[month.monthKey] === 'spraying'"
                                class="consumptions-page__month-details">
                                <h5 class="consumptions-page__month-details-title">
                                    تفاصيل الرش في {{ month.monthLabel }}
                                </h5>

                                <div v-if="mergeProducts(month.actualSprayingProducts, month.sprayingProducts, month.plannedToDateSprayingProducts, month.isCurrentMonth).length"
                                    class="consumptions-page__details-list">
                                    <div v-for="item in mergeProducts(month.actualSprayingProducts, month.sprayingProducts, month.plannedToDateSprayingProducts, month.isCurrentMonth)"
                                        :key="`${month.monthKey}-spray-${item.name}`"
                                        class="consumptions-page__details-item">
                                        <div class="consumptions-page__details-item-copy">
                                            <strong>{{ item.name }}</strong>
                                            <span>خلال الشهر</span>
                                        </div>
                                        <div class="consumptions-page__details-item-vals">
                                            <span class="consumptions-page__details-item-value">{{ formatNumber(item.actual) }} كجم</span>
                                            <span v-if="month.isCurrentMonth" class="consumptions-page__details-item-ptd">
                                                مخطط لحد اليوم: {{ formatNumber(item.ptd) }} كجم
                                            </span>
                                            <span v-else class="consumptions-page__details-item-planned">
                                                {{ formatNumber(item.planned) }} كجم
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div v-else class="consumptions-page__details-empty">
                                    لا توجد أصناف رش في الشهر ده
                                </div>
                            </div>
                        </article>
                    </div>
                </section>
            </template>
        </template>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import html2pdf from "html2pdf.js";
import { useUsersStore } from "@/stores/users.store";
import { useFarmsStore } from "@/stores/farms.store";
import { useReportsStore } from "@/stores/reports.store";
import FertilizerTypesServices from "@/services/fertilizerTypes.services";
import PesticideTypesServices from "@/services/pesticideTypes.services";
import TasksServices from "@/services/tasks.services";

const { locale } = useI18n();

const usersStore = useUsersStore();
const farmsStore = useFarmsStore();
const reportsStore = useReportsStore();

const { records: usersRecords, uiFlags: usersUiFlags } = storeToRefs(usersStore);
const { records: farmsRecords, uiFlags: farmsUiFlags } = storeToRefs(farmsStore);
const { records: reportsRecords, uiFlags: reportsUiFlags } = storeToRefs(reportsStore);

const selectedUserId = ref("");
const selectedFarmId = ref("");
const selectedYear = ref("");
const expandedCard = ref("");
const monthExpandedMap = ref({});
const fertilizerTypesRecords = ref([]);
const pesticideTypesRecords = ref([]);
const tasksRecords = ref([]);
const isTasksLoading = ref(false);

const isPageLoading = computed(() => {
    return (
        usersUiFlags.value?.isFetchingList ||
        farmsUiFlags.value?.isFetchingList ||
        reportsUiFlags.value?.isFetchingList ||
        isTasksLoading.value
    );
});

const usersOptions = computed(() => {
    return (usersRecords.value || [])
        .filter((user) => {
            const role = String(
                user?.role || user?.user_type || user?.type || user?.account_type || ""
            ).toLowerCase();

            const roleName = String(user?.role_name || user?.roleLabel || "").toLowerCase();

            const isAdmin =
                role === "admin" ||
                roleName === "admin" ||
                user?.is_admin === true ||
                user?.isAdmin === true;

            const isAdminAssistant =
                role === "admin_assistant" ||
                roleName === "admin_assistant" ||
                role.includes("admin_assistant");

            return !isAdmin && !isAdminAssistant;
        })
        .map((user) => ({
            id: user.id,
            name: user.name || user.full_name || user.username || `مستخدم ${user.id}`,
        }));
});

const farmsOptions = computed(() => {
    return (farmsRecords.value || []).map((farm) => ({
        id: farm.id,
        name: farm.name || farm.farm_name || `مزرعة ${farm.id}`,
    }));
});

const selectedUserName = computed(() => {
    return (
        usersOptions.value.find((user) => String(user.id) === String(selectedUserId.value))?.name ||
        "-"
    );
});

const selectedFarmName = computed(() => {
    return (
        farmsOptions.value.find((farm) => String(farm.id) === String(selectedFarmId.value))?.name ||
        "-"
    );
});

const roundNumber = (value) => Number(Number(value || 0).toFixed(2));
const formatNumber = (value) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(value || 0));

const reportDate = (report) => report?.report_weeks?.[0]?.date || null;

const numberOfTreesFor = (report) => {
    return Number(
        report?.palm_type?.number_of_trees ||
        report?.farm?.palm_type?.number_of_trees ||
        report?.number_of_trees ||
        0
    );
};

const normalizeProductName = (value) => {
    return String(value || "").trim().replace(/\s+/g, " ");
};

const addToMap = (map, name, amount) => {
    const cleanName = normalizeProductName(name);
    const cleanAmount = Number(amount || 0);
    if (!cleanName || !cleanAmount) return;
    if (!map[cleanName]) map[cleanName] = 0;
    map[cleanName] += cleanAmount;
};

const mapToSortedArray = (map) => {
    return Object.entries(map)
        .map(([name, total]) => ({ name, total: roundNumber(total) }))
        .sort((a, b) => b.total - a.total);
};

const getFertilizerTypeName = (fertilization) => {
    const matched = (fertilizerTypesRecords.value || []).find(
        (item) => item.id === fertilization?.fertilizer_type_id
    );

    return normalizeProductName(
        matched?.name ||
        fertilization?.type_of_fertilization ||
        fertilization?.name ||
        fertilization?.fertilizer_name ||
        fertilization?.fertilization_name ||
        fertilization?.product_name ||
        fertilization?.title ||
        fertilization?.fertilizer?.name ||
        fertilization?.material?.name ||
        ""
    );
};

const getPesticideTypeName = (day, item = null) => {
    const pesticideTypeId = item?.pesticide_type_id || day?.pesticide_type_id;
    const matched = (pesticideTypesRecords.value || []).find(
        (record) => record.id === pesticideTypeId
    );

    return normalizeProductName(
        matched?.name ||
        item?.name ||
        item?.spray_name ||
        item?.product_name ||
        item?.title ||
        day?.spraying ||
        day?.spray_name ||
        day?.spraying_name ||
        day?.product_name ||
        day?.spray_product_name ||
        ""
    );
};

const fetchTypesLookups = async () => {
    const [fertilizerTypesResponse, pesticideTypesResponse] = await Promise.all([
        FertilizerTypesServices.get(),
        PesticideTypesServices.get(),
    ]);

    fertilizerTypesRecords.value = fertilizerTypesResponse?.data || [];
    pesticideTypesRecords.value = pesticideTypesResponse?.data || [];
};

const extractFertilizationEntries = (day, treesCount) => {
    const result = [];

    for (const item of day?.fertilizations || []) {
        const name = getFertilizerTypeName(item);
        const quantityPerPalm =
            Number(item?.fertilizer_quantity_per_palm_tree || 0) ||
            Number(item?.quantity_per_palm_tree || 0) ||
            Number(item?.quantity || 0);

        const totalKg = (quantityPerPalm * treesCount) / 1000;

        if (name && totalKg > 0) {
            result.push({ name, totalKg });
        }
    }

    return result;
};

const extractSprayingEntries = (day, treesCount) => {
    const result = [];
    const name = getPesticideTypeName(day);
    const totalKg = (Number(day?.amount_of_spray || 0) * Number(treesCount || 0)) / 1000;

    if (name && totalKg > 0) {
        result.push({ name, totalKg });
    }

    const sprayingItems = Array.isArray(day?.spraying_items) ? day.spraying_items : [];

    for (const item of sprayingItems) {
        const itemName = getPesticideTypeName(day, item);
        const quantityPerPalm =
            Number(item?.quantity_per_palm_tree || 0) ||
            Number(item?.amount_per_palm_tree || 0) ||
            Number(item?.quantity || 0);

        const itemTotalKg = (quantityPerPalm * treesCount) / 1000;

        if (itemName && itemTotalKg > 0) {
            result.push({ name: itemName, totalKg: itemTotalKg });
        }
    }

    return result;
};

const hasRealTaskForDay = (day) => {
    const hasFertilization =
        Array.isArray(day?.fertilizations) &&
        day.fertilizations.some(
            (fertilization) =>
                !!fertilization?.fertilizer_type_id ||
                (String(fertilization?.type_of_fertilization || "").trim() !== "" &&
                    String(fertilization?.type_of_fertilization || "") !== "0") ||
                Number(fertilization?.fertilizer_quantity_per_palm_tree || 0) > 0
        );

    const irrigationPerTree = Number(day?.irrigation_amount_per_palm_tree || 0);
    const sprayAmount = Number(day?.amount_of_spray || 0);
    const hasSprayingName =
        !!day?.pesticide_type_id || String(day?.spraying || "").trim() !== "";

    return hasFertilization || irrigationPerTree > 0 || sprayAmount > 0 || hasSprayingName;
};

const availableYears = computed(() => {
    const reportYears = (reportsRecords.value || [])
        .map((report) => {
            const date = reportDate(report);
            if (!date) return null;
            return new Date(date).getFullYear();
        })
        .filter(Boolean);

    const taskYears = (tasksRecords.value || [])
        .map((task) => {
            const dateStr = task.date?.slice(0, 10);
            if (!dateStr) return null;
            return new Date(dateStr).getFullYear();
        })
        .filter(Boolean);

    return [...new Set([...reportYears, ...taskYears])].sort((a, b) => b - a);
});

const filteredReportsByYear = computed(() => {
    if (!selectedYear.value) return [];

    return (reportsRecords.value || []).filter((report) => {
        const date = reportDate(report);
        if (!date) return false;
        return new Date(date).getFullYear() === Number(selectedYear.value);
    });
});

const monthlyBreakdown = computed(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    const grouped = {};

    // ── Planned data from reports ──
    for (const report of filteredReportsByYear.value) {
        const date = reportDate(report);
        if (!date) continue;

        const dateObject = new Date(date);
        const monthIndex = dateObject.getMonth();
        const year = dateObject.getFullYear();
        const monthKey = `${year}-${monthIndex + 1}`;

        if (!grouped[monthKey]) {
            grouped[monthKey] = {
                monthKey,
                monthIndex,
                monthNumber: monthIndex + 1,
                year,
                isCurrentMonth: year === currentYear && monthIndex === currentMonth,
                monthLabel: new Intl.DateTimeFormat(locale.value || "ar", {
                    month: "long",
                    year: "numeric",
                }).format(dateObject),
                weeksCount: 0,
                // Planned (from reports)
                irrigationLiters: 0,
                fertilizationKg: 0,
                sprayingKg: 0,
                fertilizationProductsMap: {},
                sprayingProductsMap: {},
                // Actual (from tasks)
                actualIrrigationLiters: 0,
                actualFertilizationKg: 0,
                actualSprayingKg: 0,
                actualFertilizationProductsMap: {},
                actualSprayingProductsMap: {},
                // Planned-to-date (current month only)
                plannedToDateIrrigationLiters: null,
                plannedToDateFertilizationKg: null,
                plannedToDateSprayingKg: null,
                plannedToDateFertilizationProductsMap: {},
                plannedToDateSprayingProductsMap: {},
            };
        }

        const treesCount = numberOfTreesFor(report);
        const weeks = report?.report_weeks || [];
        grouped[monthKey].weeksCount += weeks.length;

        for (const week of weeks) {
            for (const day of week?.days || []) {
                if (!hasRealTaskForDay(day)) continue;

                grouped[monthKey].irrigationLiters +=
                    Number(day?.irrigation_amount_per_palm_tree || 0) * treesCount;

                const fertEntries = extractFertilizationEntries(day, treesCount);
                for (const item of fertEntries) {
                    grouped[monthKey].fertilizationKg += item.totalKg;
                    addToMap(grouped[monthKey].fertilizationProductsMap, item.name, item.totalKg);
                }

                const sprayEntries = extractSprayingEntries(day, treesCount);
                for (const item of sprayEntries) {
                    grouped[monthKey].sprayingKg += item.totalKg;
                    addToMap(grouped[monthKey].sprayingProductsMap, item.name, item.totalKg);
                }
            }
        }
    }

    // ── Merge actual data from tasks ──
    const actualData = actualMonthlyData.value;
    for (const monthKey of Object.keys(actualData)) {
        if (grouped[monthKey]) {
            // Month already exists from reports: merge actual
            grouped[monthKey].actualIrrigationLiters = actualData[monthKey].irrigationLiters;
            grouped[monthKey].actualFertilizationKg = actualData[monthKey].fertilizationKg;
            grouped[monthKey].actualSprayingKg = actualData[monthKey].sprayingKg;
            grouped[monthKey].actualFertilizationProductsMap = actualData[monthKey].fertilizationProductsMap || {};
            grouped[monthKey].actualSprayingProductsMap = actualData[monthKey].sprayingProductsMap || {};
        } else {
            // Month only exists in tasks (no report): create entry
            const parts = monthKey.split("-");
            const year = Number(parts[0]);
            const monthNumber = Number(parts[1]);
            const monthIndex = monthNumber - 1;
            const dateObject = new Date(year, monthIndex, 1);
            grouped[monthKey] = {
                monthKey,
                monthIndex,
                monthNumber,
                year,
                isCurrentMonth: year === currentYear && monthIndex === currentMonth,
                monthLabel: new Intl.DateTimeFormat(locale.value || "ar", {
                    month: "long",
                    year: "numeric",
                }).format(dateObject),
                weeksCount: 0,
                irrigationLiters: 0,
                fertilizationKg: 0,
                sprayingKg: 0,
                fertilizationProductsMap: {},
                sprayingProductsMap: {},
                actualIrrigationLiters: actualData[monthKey].irrigationLiters,
                actualFertilizationKg: actualData[monthKey].fertilizationKg,
                actualSprayingKg: actualData[monthKey].sprayingKg,
                actualFertilizationProductsMap: actualData[monthKey].fertilizationProductsMap || {},
                actualSprayingProductsMap: actualData[monthKey].sprayingProductsMap || {},
                plannedToDateIrrigationLiters: null,
                plannedToDateFertilizationKg: null,
                plannedToDateSprayingKg: null,
                plannedToDateFertilizationProductsMap: {},
                plannedToDateSprayingProductsMap: {},
            };
        }
    }

    // ── Merge planned-to-date for current month ──
    const ptd = plannedToDateMonthData.value;
    for (const monthKey of Object.keys(ptd)) {
        if (grouped[monthKey]) {
            grouped[monthKey].plannedToDateIrrigationLiters = ptd[monthKey].irrigationLiters;
            grouped[monthKey].plannedToDateFertilizationKg = ptd[monthKey].fertilizationKg;
            grouped[monthKey].plannedToDateSprayingKg = ptd[monthKey].sprayingKg;
            grouped[monthKey].plannedToDateFertilizationProductsMap = ptd[monthKey].fertilizationProductsMap || {};
            grouped[monthKey].plannedToDateSprayingProductsMap = ptd[monthKey].sprayingProductsMap || {};
        }
    }

    return Object.values(grouped)
        .map((item) => ({
            ...item,
            irrigationLiters: roundNumber(item.irrigationLiters),
            fertilizationKg: roundNumber(item.fertilizationKg),
            sprayingKg: roundNumber(item.sprayingKg),
            fertilizationProducts: mapToSortedArray(item.fertilizationProductsMap),
            sprayingProducts: mapToSortedArray(item.sprayingProductsMap),
            actualFertilizationProducts: mapToSortedArray(item.actualFertilizationProductsMap || {}),
            actualSprayingProducts: mapToSortedArray(item.actualSprayingProductsMap || {}),
            plannedToDateFertilizationProducts: mapToSortedArray(item.plannedToDateFertilizationProductsMap || {}),
            plannedToDateSprayingProducts: mapToSortedArray(item.plannedToDateSprayingProductsMap || {}),
        }))
        // ── Filter out completely empty months ──
        .filter((item) => {
            const hasPlanned =
                item.irrigationLiters > 0 ||
                item.fertilizationKg > 0 ||
                item.sprayingKg > 0;
            const hasActual =
                item.actualIrrigationLiters > 0 ||
                item.actualFertilizationKg > 0 ||
                item.actualSprayingKg > 0;
            return hasPlanned || hasActual;
        })
        .sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.monthIndex - a.monthIndex;
        });
});

const yearlyTotals = computed(() => {
    return monthlyBreakdown.value.reduce(
        (sum, month) => {
            sum.irrigationLiters += Number(month.irrigationLiters || 0);
            sum.fertilizationKg += Number(month.fertilizationKg || 0);
            sum.sprayingKg += Number(month.sprayingKg || 0);
            return sum;
        },
        { irrigationLiters: 0, fertilizationKg: 0, sprayingKg: 0 }
    );
});

const yearlyActualTotals = computed(() => {
    return monthlyBreakdown.value.reduce(
        (sum, month) => {
            sum.irrigationLiters += Number(month.actualIrrigationLiters || 0);
            sum.fertilizationKg += Number(month.actualFertilizationKg || 0);
            sum.sprayingKg += Number(month.actualSprayingKg || 0);
            return sum;
        },
        { irrigationLiters: 0, fertilizationKg: 0, sprayingKg: 0 }
    );
});

// ─── Merge planned + actual products into a unified list for display ────────
const mergeProducts = (actualProducts, plannedProducts, ptdProducts, isCurrentMonth) => {
    const map = {};
    for (const item of actualProducts || []) {
        if (!map[item.name]) map[item.name] = { name: item.name, actual: 0, planned: 0, ptd: 0 };
        map[item.name].actual = roundNumber(item.total);
    }
    for (const item of plannedProducts || []) {
        if (!map[item.name]) map[item.name] = { name: item.name, actual: 0, planned: 0, ptd: 0 };
        map[item.name].planned = roundNumber(item.total);
    }
    if (isCurrentMonth) {
        for (const item of ptdProducts || []) {
            if (!map[item.name]) map[item.name] = { name: item.name, actual: 0, planned: 0, ptd: 0 };
            map[item.name].ptd = roundNumber(item.total);
        }
    }
    return Object.values(map).sort((a, b) => b.actual - a.actual || b.planned - a.planned);
};

// ─── Yearly merged product lists (planned + actual) ────────────────────────
const yearlyFertilizationMerged = computed(() => {
    const plannedMap = {};
    const actualMap = {};
    for (const month of monthlyBreakdown.value) {
        for (const item of month.fertilizationProducts || []) addToMap(plannedMap, item.name, item.total);
        for (const item of month.actualFertilizationProducts || []) addToMap(actualMap, item.name, item.total);
    }
    return mergeProducts(mapToSortedArray(actualMap), mapToSortedArray(plannedMap), [], false);
});

const yearlySprayingMerged = computed(() => {
    const plannedMap = {};
    const actualMap = {};
    for (const month of monthlyBreakdown.value) {
        for (const item of month.sprayingProducts || []) addToMap(plannedMap, item.name, item.total);
        for (const item of month.actualSprayingProducts || []) addToMap(actualMap, item.name, item.total);
    }
    return mergeProducts(mapToSortedArray(actualMap), mapToSortedArray(plannedMap), [], false);
});

// Keep for compatibility
const fertilizationProducts = computed(() => mapToSortedArray(
    monthlyBreakdown.value.reduce((map, month) => {
        for (const item of month.fertilizationProducts) addToMap(map, item.name, item.total);
        return map;
    }, {})
));

const sprayingProducts = computed(() => mapToSortedArray(
    monthlyBreakdown.value.reduce((map, month) => {
        for (const item of month.sprayingProducts) addToMap(map, item.name, item.total);
        return map;
    }, {})
));

const toggleExpandedCard = (cardName) => {
    expandedCard.value = expandedCard.value === cardName ? "" : cardName;
};

const toggleMonthExpanded = (monthKey, type) => {
    monthExpandedMap.value = {
        ...monthExpandedMap.value,
        [monthKey]: monthExpandedMap.value[monthKey] === type ? "" : type,
    };
};

const fetchUsers = async () => {
    await usersStore.fetchRecords({ page: 1, per_page: 1000 });
};

const fetchUserFarms = async (userId) => {
    if (!userId) return;
    await farmsStore.fetchRecords({ owner_id: userId, page: 1, per_page: 1000 });
};

const fetchFarmReports = async (farmId) => {
    if (!farmId) return;
    await reportsStore.fetchRecords({ farm_id: farmId });
};

const fetchFarmTasks = async (farmId) => {
    if (!farmId) return;
    isTasksLoading.value = true;
    try {
        const response = await TasksServices.get({ farm_id: farmId, per_page: 10000 });
        tasksRecords.value = response?.data?.data || response?.data || [];
    } catch (error) {
        console.error("Failed to fetch tasks:", error);
        tasksRecords.value = [];
    } finally {
        isTasksLoading.value = false;
    }
};

// ─── Actual monthly data from completed tasks ──────────────────────────────
const actualMonthlyData = computed(() => {
    const grouped = {};

    for (const task of tasksRecords.value || []) {
        if (!task.is_completed) continue;
        const dateStr = task.date?.slice(0, 10);
        if (!dateStr) continue;

        const dateObj = new Date(dateStr);
        const year = dateObj.getFullYear();
        const monthIndex = dateObj.getMonth();
        const monthKey = `${year}-${monthIndex + 1}`;

        if (!grouped[monthKey]) {
            grouped[monthKey] = {
                irrigationLiters: 0,
                fertilizationKg: 0,
                sprayingKg: 0,
                fertilizationProductsMap: {},
                sprayingProductsMap: {},
            };
        }

        const qd = task.quantitative_data || {};
        const palmType = task.palm_type || {};
        const treesCount = Number(palmType?.number_of_trees || task.trees_count || 0);

        if (task.task_type === "irrigation") {
            const amountPerPalm = Number(qd.irrigation_amount_per_palm_tree || 0);
            grouped[monthKey].irrigationLiters += amountPerPalm * treesCount;
        } else if (task.task_type === "spraying") {
            const amountPerPalm = Number(qd.amount_of_spray || 0);
            const totalKg = (amountPerPalm * treesCount) / 1000;
            grouped[monthKey].sprayingKg += totalKg;
            const productName = normalizeProductName(qd.pesticide_type_name || qd.spraying || "");
            if (productName && totalKg > 0) addToMap(grouped[monthKey].sprayingProductsMap, productName, totalKg);
        } else if (task.task_type === "fertilization") {
            const amountPerPalm = Number(qd.fertilizer_quantity_per_palm_tree || 0);
            const totalKg = (amountPerPalm * treesCount) / 1000;
            grouped[monthKey].fertilizationKg += totalKg;
            const productName = normalizeProductName(qd.fertilizer_type_name || qd.type_of_fertilization || "");
            if (productName && totalKg > 0) addToMap(grouped[monthKey].fertilizationProductsMap, productName, totalKg);
        }
    }

    // Round totals
    for (const key of Object.keys(grouped)) {
        grouped[key].irrigationLiters = roundNumber(grouped[key].irrigationLiters);
        grouped[key].fertilizationKg = roundNumber(grouped[key].fertilizationKg);
        grouped[key].sprayingKg = roundNumber(grouped[key].sprayingKg);
    }

    return grouped;
});

// ─── Planned-to-date for current month ────────────────────────────────────
const plannedToDateMonthData = computed(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const todayDate = now.toISOString().slice(0, 10);
    const currentMonthKey = `${currentYear}-${currentMonth + 1}`;

    if (!selectedYear.value) return {};

    const result = {
        irrigationLiters: 0,
        fertilizationKg: 0,
        sprayingKg: 0,
        fertilizationProductsMap: {},
        sprayingProductsMap: {},
    };

    for (const report of filteredReportsByYear.value) {
        const dateForReport = reportDate(report);
        if (!dateForReport) continue;
        const reportDateObj = new Date(dateForReport);
        if (
            reportDateObj.getFullYear() !== currentYear ||
            reportDateObj.getMonth() !== currentMonth
        )
            continue;

        const treesCount = numberOfTreesFor(report);
        const weeks = report?.report_weeks || [];

        for (const week of weeks) {
            for (const day of week?.days || []) {
                if (!hasRealTaskForDay(day)) continue;
                const dayDate = day?.date?.slice(0, 10) || "";
                if (dayDate > todayDate) continue;

                result.irrigationLiters +=
                    Number(day?.irrigation_amount_per_palm_tree || 0) * treesCount;

                const fertEntries = extractFertilizationEntries(day, treesCount);
                for (const item of fertEntries) {
                    result.fertilizationKg += item.totalKg;
                    addToMap(result.fertilizationProductsMap, item.name, item.totalKg);
                }

                const sprayEntries = extractSprayingEntries(day, treesCount);
                for (const item of sprayEntries) {
                    result.sprayingKg += item.totalKg;
                    addToMap(result.sprayingProductsMap, item.name, item.totalKg);
                }
            }
        }
    }

    return {
        [currentMonthKey]: {
            irrigationLiters: roundNumber(result.irrigationLiters),
            fertilizationKg: roundNumber(result.fertilizationKg),
            sprayingKg: roundNumber(result.sprayingKg),
            fertilizationProductsMap: result.fertilizationProductsMap,
            sprayingProductsMap: result.sprayingProductsMap,
        },
    };
});

const escapeHtml = (value) => {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
};

const pdfBaseStyles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: Arial, sans-serif;
    direction: rtl;
    color: #0f172a;
    background: #ffffff;
  }

  .report-page {
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
    padding: 12px;
    background: #ffffff;
    overflow: visible;
  }

  .report-header {
    margin-bottom: 20px;
    padding: 18px;
    border: 1px solid #dbe3ef;
    border-radius: 16px;
    background:
      radial-gradient(circle at top right, rgba(34, 197, 94, 0.10), transparent 32%),
      radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 34%),
      linear-gradient(180deg, #ffffff, #f8fbff);
  }

  .report-eyebrow {
    margin: 0 0 8px;
    font-size: 13px;
    font-weight: 800;
    color: #2563eb;
  }

  .report-title {
    margin: 0 0 10px;
    font-size: 28px;
    font-weight: 800;
    color: #0f172a;
  }

  .report-subtitle {
    margin: 0;
    color: #475569;
    line-height: 1.9;
    font-size: 14px;
  }

  .report-section {
    margin-top: 20px;
    padding: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 18px;
    background: #ffffff;
    page-break-inside: avoid;
    break-inside: avoid;
    overflow: visible;
  }

  .report-section h3 {
    margin: 0 0 12px;
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 14px;
  }

  .summary-card {
    border: 1px solid #dbe3ef;
    border-radius: 16px;
    padding: 14px;
    background: #f8fbff;
    min-width: 0;
  }

  .summary-card .summary-label {
    display: block;
    color: #64748b;
    font-size: 13px;
    font-weight: 700;
  }

  .summary-card strong {
    display: block;
    margin-top: 8px;
    font-size: 24px;
    color: #0f172a;
    word-break: break-word;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
    table-layout: fixed;
  }

  th, td {
    border: 1px solid #dbe3ef;
    padding: 10px 8px;
    text-align: right;
    vertical-align: top;
    font-size: 13px;
    word-break: break-word;
  }

  th {
    background: #eff6ff;
    font-weight: 800;
  }

  .empty-row {
    text-align: center;
    color: #64748b;
    background: #f8fafc;
  }
`;

const renderTableRows = (rows, columnsCount) => {
    if (!rows.length) {
        return `<tr><td class="empty-row" colspan="${columnsCount}">لا توجد بيانات</td></tr>`;
    }

    return rows
        .map(
            (row) => `
        <tr>
          ${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}
        </tr>
      `
        )
        .join("");
};

const buildDocumentHtml = ({ title, subtitle, content }) => {
    return `
    <div class="report-page">
      <style>${pdfBaseStyles}</style>

      <div class="report-header">
        <div class="report-eyebrow">الاستهلاكات</div>
        <h1 class="report-title">${escapeHtml(title)}</h1>
        <p class="report-subtitle">${subtitle}</p>
      </div>

      ${content}
    </div>
  `;
};

const createPdfElement = (htmlString) => {
    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-100000px";
    wrapper.style.top = "0";
    wrapper.style.width = "720px";
    wrapper.style.maxWidth = "720px";
    wrapper.style.background = "#ffffff";
    wrapper.style.padding = "0";
    wrapper.style.overflow = "visible";
    wrapper.innerHTML = htmlString;
    document.body.appendChild(wrapper);
    return wrapper;
};

const downloadPdfFile = async (htmlString, fileName) => {
    let wrapper = null;

    try {
        wrapper = createPdfElement(htmlString);
        const target = wrapper.querySelector(".report-page");

        await html2pdf()
            .set({
                margin: [6, 6, 6, 6],
                filename: fileName,
                image: { type: "jpeg", quality: 1 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: "#ffffff",
                    scrollX: 0,
                    scrollY: 0,
                },
                jsPDF: {
                    unit: "mm",
                    format: "a4",
                    orientation: "portrait",
                },
                pagebreak: {
                    mode: ["css", "legacy"],
                },
            })
            .from(target)
            .save();
    } catch (error) {
        console.error(error);
        alert("حصلت مشكلة أثناء إنشاء ملف PDF.");
    } finally {
        if (wrapper?.parentNode) {
            wrapper.parentNode.removeChild(wrapper);
        }
    }
};

const buildMonthReportHtml = (month) => {
    const fertilizationRows = month.fertilizationProducts.map((item) => [
        item.name,
        `${formatNumber(item.total)} كجم`,
    ]);

    const sprayingRows = month.sprayingProducts.map((item) => [
        item.name,
        `${formatNumber(item.total)} كجم`,
    ]);

    const subtitle = `
    المستخدم: ${escapeHtml(selectedUserName.value)}<br>
    المزرعة: ${escapeHtml(selectedFarmName.value)}<br>
    الشهر: ${escapeHtml(month.monthLabel)}<br>
    عدد الأسابيع: ${escapeHtml(month.weeksCount)}<br>
    تاريخ إنشاء التقرير: ${escapeHtml(new Date().toLocaleString("ar-EG"))}
  `;

    const content = `
    <div class="report-section">
      <h3>ملخص الشهر</h3>
      <div class="summary-grid">
        <div class="summary-card">
          <span class="summary-label">مياه الري</span>
          <strong>${escapeHtml(formatNumber(month.irrigationLiters))} لتر</strong>
        </div>
        <div class="summary-card">
          <span class="summary-label">التسميد</span>
          <strong>${escapeHtml(formatNumber(month.fertilizationKg))} كجم</strong>
        </div>
        <div class="summary-card">
          <span class="summary-label">الرش</span>
          <strong>${escapeHtml(formatNumber(month.sprayingKg))} كجم</strong>
        </div>
      </div>
    </div>

    <div class="report-section">
      <h3>أصناف التسميد خلال الشهر</h3>
      <table>
        <thead>
          <tr>
            <th>الصنف</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${renderTableRows(fertilizationRows, 2)}
        </tbody>
      </table>
    </div>

    <div class="report-section">
      <h3>أصناف الرش خلال الشهر</h3>
      <table>
        <thead>
          <tr>
            <th>الصنف</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${renderTableRows(sprayingRows, 2)}
        </tbody>
      </table>
    </div>
  `;

    return buildDocumentHtml({
        title: `تقرير استهلاكات ${month.monthLabel}`,
        subtitle,
        content,
    });
};

const buildYearReportHtml = () => {
    const monthsRows = monthlyBreakdown.value.map((month) => [
        month.monthLabel,
        `${month.weeksCount}`,
        `${formatNumber(month.irrigationLiters)} لتر`,
        `${formatNumber(month.fertilizationKg)} كجم`,
        `${formatNumber(month.sprayingKg)} كجم`,
    ]);

    const fertilizationRows = fertilizationProducts.value.map((item) => [
        item.name,
        `${formatNumber(item.total)} كجم`,
    ]);

    const sprayingRows = sprayingProducts.value.map((item) => [
        item.name,
        `${formatNumber(item.total)} كجم`,
    ]);

    const subtitle = `
    المستخدم: ${escapeHtml(selectedUserName.value)}<br>
    المزرعة: ${escapeHtml(selectedFarmName.value)}<br>
    السنة: ${escapeHtml(selectedYear.value)}<br>
    تاريخ إنشاء التقرير: ${escapeHtml(new Date().toLocaleString("ar-EG"))}
  `;

    const content = `
    <div class="report-section">
      <h3>الملخص العام</h3>
      <div class="summary-grid">
        <div class="summary-card">
          <span class="summary-label">مياه الري</span>
          <strong>${escapeHtml(formatNumber(yearlyTotals.value.irrigationLiters))} لتر</strong>
        </div>
        <div class="summary-card">
          <span class="summary-label">التسميد</span>
          <strong>${escapeHtml(formatNumber(yearlyTotals.value.fertilizationKg))} كجم</strong>
        </div>
        <div class="summary-card">
          <span class="summary-label">الرش</span>
          <strong>${escapeHtml(formatNumber(yearlyTotals.value.sprayingKg))} كجم</strong>
        </div>
      </div>
    </div>

    <div class="report-section">
      <h3>تفاصيل الشهور</h3>
      <table>
        <thead>
          <tr>
            <th>الشهر</th>
            <th>عدد الأسابيع</th>
            <th>الري</th>
            <th>التسميد</th>
            <th>الرش</th>
          </tr>
        </thead>
        <tbody>
          ${renderTableRows(monthsRows, 5)}
        </tbody>
      </table>
    </div>

    <div class="report-section">
      <h3>أصناف التسميد خلال السنة</h3>
      <table>
        <thead>
          <tr>
            <th>الصنف</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${renderTableRows(fertilizationRows, 2)}
        </tbody>
      </table>
    </div>

    <div class="report-section">
      <h3>أصناف الرش خلال السنة</h3>
      <table>
        <thead>
          <tr>
            <th>الصنف</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${renderTableRows(sprayingRows, 2)}
        </tbody>
      </table>
    </div>
  `;

    return buildDocumentHtml({
        title: `تقرير استهلاكات السنة ${selectedYear.value}`,
        subtitle,
        content,
    });
};

const downloadYearReport = async () => {
    if (!selectedYear.value || !monthlyBreakdown.value.length) return;

    await downloadPdfFile(
        buildYearReportHtml(),
        `year-report-${selectedYear.value}-user-${selectedUserId.value}-farm-${selectedFarmId.value}.pdf`
    );
};

const downloadMonthReport = async (month) => {
    await downloadPdfFile(
        buildMonthReportHtml(month),
        `month-report-${month.year}-${month.monthNumber}-user-${selectedUserId.value}-farm-${selectedFarmId.value}.pdf`
    );
};

watch(selectedUserId, async (userId) => {
    selectedFarmId.value = "";
    selectedYear.value = "";
    expandedCard.value = "";
    monthExpandedMap.value = {};
    reportsStore.records = [];
    tasksRecords.value = [];

    if (!userId) {
        farmsStore.records = [];
        return;
    }

    await fetchUserFarms(userId);
});

watch(selectedFarmId, async (farmId) => {
    selectedYear.value = "";
    expandedCard.value = "";
    monthExpandedMap.value = {};

    if (!farmId) {
        reportsStore.records = [];
        tasksRecords.value = [];
        return;
    }

    await Promise.all([fetchFarmReports(farmId), fetchFarmTasks(farmId)]);

    if (availableYears.value.length) {
        selectedYear.value = availableYears.value[0];
    }
});

watch(selectedYear, () => {
    expandedCard.value = "";
    monthExpandedMap.value = {};
});

onMounted(async () => {
    await Promise.all([fetchUsers(), fetchTypesLookups()]);
});
</script>

<style scoped lang="scss">
.consumptions-page {
    display: flex;
    flex-direction: column;
    gap: 18px;

    &--standalone {
        padding-top: 8px;
    }

    &__hero {
        display: grid;
        grid-template-columns: minmax(320px, 1fr) minmax(340px, 1.45fr);
        gap: 18px;
        padding: 22px;
        border-radius: 28px;
        border: 1px solid rgba(59, 130, 246, 0.12);
        background:
            radial-gradient(circle at top right, rgba(34, 197, 94, 0.12), transparent 30%),
            radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 32%),
            linear-gradient(180deg, #ffffff, #f7fbff);
    }

    &__hero-copy {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 100%;
    }

    &__eyebrow {
        display: inline-flex;
        margin-bottom: 10px;
        font-size: 13px;
        font-weight: 800;
        color: #2563eb;
    }

    &__hero-title {
        margin: 0 0 10px;
        font-size: 30px;
        line-height: 1.35;
        font-weight: 800;
        color: #0f172a;
    }

    &__hero-text {
        margin: 0;
        font-size: 15px;
        line-height: 2;
        color: #475569;
    }

    &__hero-filter {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 22px 18px;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.86);
        border: 1px solid rgba(148, 163, 184, 0.18);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
    }

    &__field-wrap {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    &__field-label {
        font-size: 14px;
        font-weight: 800;
        color: #0f172a;
    }

    &__select {
        width: 100%;
        min-height: 48px;
        padding: 0 14px;
        border-radius: 14px;
        border: 1px solid #dbe3ef;
        background: #fff;
        font-size: 15px;
        color: #0f172a;
        outline: none;
    }

    &__select:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
    }

    &__select:disabled {
        cursor: not-allowed;
        background: #f8fafc;
        color: #94a3b8;
    }

    &__cards-grid {
        display: grid;
        gap: 12px;
    }


    &__cards-grid--farms {
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }

    &__entity-card {
        position: relative;
        display: flex;
        align-items: center;
        gap: 14px;
        width: 100%;
        min-height: 82px;
        padding: 16px;
        border-radius: 20px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 251, 255, 0.96));
        text-align: right;
        cursor: pointer;
        transition: 0.22s ease;
        box-shadow:
            0 10px 30px rgba(15, 23, 42, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.75);
    }

    &__entity-card:hover {
        transform: translateY(-2px);
        border-color: rgba(37, 99, 235, 0.26);
        box-shadow:
            0 18px 34px rgba(37, 99, 235, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.85);
    }

    &__entity-card--active {
        border-color: transparent;
        background:
            radial-gradient(circle at top right, rgba(34, 197, 94, 0.16), transparent 36%),
            radial-gradient(circle at bottom left, rgba(37, 99, 235, 0.16), transparent 36%),
            linear-gradient(135deg, rgba(37, 99, 235, 0.10), rgba(34, 197, 94, 0.08)),
            #ffffff;
        box-shadow:
            0 16px 34px rgba(37, 99, 235, 0.12),
            0 6px 18px rgba(34, 197, 94, 0.08);
    }

    &__entity-card-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        height: 52px;
        border-radius: 16px;
        flex-shrink: 0;
        font-size: 24px;
        color: #2563eb;
        background: rgba(37, 99, 235, 0.1);
    }

    &__entity-card-icon--farm {
        color: #16a34a;
        background: rgba(34, 197, 94, 0.12);
    }

    &__entity-card-copy {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
        flex: 1;
    }

    &__entity-card-copy strong {
        font-size: 15px;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.5;
        word-break: break-word;
    }

    &__entity-card-copy span {
        font-size: 12px;
        font-weight: 700;
        color: #64748b;
    }

    &__entity-card-check {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 22px;
        color: #94a3b8;
    }

    &__entity-card--active .consumptions-page__entity-card-check {
        color: #2563eb;
    }

    &__mini-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 92px;
        padding: 16px;
        border-radius: 18px;
        border: 1px dashed rgba(148, 163, 184, 0.35);
        background: rgba(248, 250, 252, 0.75);
        color: #64748b;
        font-size: 14px;
        font-weight: 700;
        text-align: center;
    }

    &__years,
    &__months,
    &__details-box {
        padding: 22px;
        border-radius: 24px;
        background: #fff;
        border: 1px solid rgba(148, 163, 184, 0.16);
    }

    &__years-head,
    &__months-head,
    &__details-head {
        margin-bottom: 16px;
    }

    &__years-head--actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
    }

    &__section-title {
        margin: 0 0 6px;
        font-size: 20px;
        font-weight: 800;
        color: #0f172a;
    }

    &__section-subtitle {
        margin: 0;
        font-size: 14px;
        color: #64748b;
    }

    &__years-list {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
    }

    &__year-chip {
        border: 1px solid #dbe3ef;
        background: #fff;
        color: #0f172a;
        border-radius: 999px;
        padding: 10px 18px;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        transition: 0.2s ease;
    }

    &__year-chip:hover {
        transform: translateY(-1px);
        border-color: #93c5fd;
    }

    &__year-chip--active {
        background: linear-gradient(135deg, #2563eb, #22c55e);
        color: #fff;
        border-color: transparent;
    }

    &__download-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 42px;
        padding: 0 16px;
        border: none;
        border-radius: 12px;
        background: linear-gradient(135deg, #2563eb, #22c55e);
        color: #fff;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        transition: 0.2s ease;
    }

    &__download-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 24px rgba(37, 99, 235, 0.18);
    }

    &__download-button--year {
        white-space: nowrap;
    }

    &__stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
    }

    &__stat-card {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 20px;
        border-radius: 22px;
        background: #fff;
        border: 1px solid rgba(148, 163, 184, 0.16);
    }

    &__stat-card--clickable {
        cursor: pointer;
        transition: 0.2s ease;
    }

    &__stat-card--clickable:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06);
    }

    &__stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        height: 52px;
        border-radius: 16px;
        font-size: 24px;
        color: #2563eb;
        background: rgba(37, 99, 235, 0.08);
        flex-shrink: 0;
    }

    &__stat-copy {
        min-width: 0;
        flex: 1;
    }

    &__stat-label {
        margin: 0 0 6px;
        font-size: 13px;
        font-weight: 700;
        color: #64748b;
    }

    &__stat-value {
        margin: 0;
        font-size: 24px;
        font-weight: 800;
        line-height: 1.3;
        color: #0f172a;
    }

    &__stat-value span {
        font-size: 14px;
        color: #64748b;
        margin-inline-start: 4px;
    }

    &__stat-planned {
        margin: 4px 0 0;
        font-size: 12px;
        font-weight: 600;
        color: #94a3b8;
        text-decoration: line-through;
    }

    &__stat-hint {
        margin: 8px 0 0;
        font-size: 12px;
        color: #2563eb;
        font-weight: 800;
    }

    &__stat-arrow {
        flex-shrink: 0;
        font-size: 22px;
        color: #64748b;
    }

    &__details-list {
        display: grid;
        gap: 12px;
    }

    &__details-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 14px 16px;
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 16px;
        background: #f8fbff;
    }

    &__details-item-copy {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    &__details-item-copy strong {
        font-size: 15px;
        color: #0f172a;
    }

    &__details-item-copy span {
        font-size: 12px;
        color: #64748b;
    }

    &__details-item-vals {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 3px;
        flex-shrink: 0;
    }

    &__details-item-value {
        font-size: 16px;
        font-weight: 800;
        color: #2563eb;
        white-space: nowrap;
    }

    &__details-item-planned {
        font-size: 11px;
        font-weight: 600;
        color: #94a3b8;
        text-decoration: line-through;
        white-space: nowrap;
    }

    &__details-item-ptd {
        font-size: 11px;
        font-weight: 700;
        color: #d97706;
        white-space: nowrap;
    }

    &__details-empty {
        padding: 18px;
        border-radius: 16px;
        background: #f8fafc;
        color: #64748b;
        text-align: center;
        border: 1px dashed rgba(148, 163, 184, 0.35);
    }

    &__months-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
    }

    &__month-card {
        padding: 18px;
        border-radius: 20px;
        background: linear-gradient(180deg, #ffffff, #f8fbff);
        border: 1px solid rgba(148, 163, 184, 0.16);
    }

    &__month-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
    }

    &__month-title {
        margin: 0;
        font-size: 18px;
        font-weight: 800;
        color: #0f172a;
    }

    &__month-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        padding: 8px 12px;
        background: rgba(37, 99, 235, 0.08);
        color: #2563eb;
        font-size: 12px;
        font-weight: 800;
    }

    &__month-metrics {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
    }

    &__metric {
        padding: 14px;
        border-radius: 16px;
        background: #fff;
        border: 1px solid rgba(226, 232, 240, 0.95);
        text-align: start;
    }

    &__metric--clickable {
        cursor: pointer;
        transition: 0.2s ease;
        width: 100%;
    }

    &__metric--clickable:hover {
        transform: translateY(-1px);
        border-color: #93c5fd;
        box-shadow: 0 12px 24px rgba(15, 23, 42, 0.04);
    }

    &__metric-label {
        display: block;
        margin-bottom: 8px;
        font-size: 13px;
        font-weight: 700;
        color: #64748b;
    }

    &__metric-value {
        display: block;
        font-size: 16px;
        font-weight: 800;
        color: #0f172a;
    }

    &__metric-planned {
        display: block;
        font-size: 11px;
        font-weight: 600;
        color: #94a3b8;
        text-decoration: line-through;
        margin-top: 3px;
    }

    &__metric-hint {
        display: block;
        margin-top: 8px;
        font-size: 12px;
        color: #2563eb;
        font-weight: 800;
    }

    &__month-actions {
        display: flex;
        justify-content: flex-start;
        margin-top: 14px;
    }

    &__month-details {
        margin-top: 14px;
        padding-top: 14px;
        border-top: 1px dashed rgba(148, 163, 184, 0.35);
    }

    &__month-details-title {
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 800;
        color: #0f172a;
    }

    // ─── Comparison Bars ──────────────────────────────────────────────────
    &__comparison {
        margin-top: 16px;
        padding: 14px 16px;
        border-radius: 16px;
        background: rgba(248, 250, 252, 0.8);
        border: 1px solid rgba(226, 232, 240, 0.8);
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    &__comparison-row {
        display: grid;
        grid-template-columns: 72px 1fr;
        align-items: center;
        gap: 10px;
    }

    &__comparison-label {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        font-weight: 700;
        color: #475569;
    }

    &__comparison-icon {
        font-size: 15px;
        flex-shrink: 0;
    }

    &__comparison-icon--irr { color: #2563eb; }
    &__comparison-icon--fert { color: #16a34a; }
    &__comparison-icon--spray { color: #9333ea; }

    &__comparison-bar-wrap {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    &__comparison-bar-track {
        position: relative;
        height: 10px;
        border-radius: 999px;
        background: rgba(226, 232, 240, 0.9);
        overflow: visible;
    }

    &__comparison-bar-fill {
        position: absolute;
        inset-block: 0;
        inset-inline-start: 0;
        border-radius: 999px;
        transition: width 0.55s cubic-bezier(0.22, 1, 0.36, 1);
    }

    &__comparison-bar-fill--actual {
        background: linear-gradient(90deg, #22c55e, #16a34a);
    }

    &__comparison-bar-marker {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 18px;
        border-radius: 2px;
        background: #f59e0b;
        box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.25);
        z-index: 2;
    }

    &__comparison-vals {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
    }

    &__comparison-val {
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
    }

    &__comparison-val--actual {
        color: #16a34a;
    }

    &__comparison-val--ptd {
        color: #d97706;
    }

    &__comparison-val--planned {
        color: #94a3b8;
    }

    &__comparison-legend {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-top: 4px;
        padding-top: 10px;
        border-top: 1px dashed rgba(148, 163, 184, 0.3);
    }

    &__comparison-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        font-weight: 700;
    }

    &__comparison-legend-item--actual { color: #16a34a; }
    &__comparison-legend-item--ptd { color: #d97706; }
    &__comparison-legend-item--planned { color: #94a3b8; }

    &__comparison-legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #22c55e;
        display: inline-block;
    }

    &__comparison-legend-dot--planned {
        background: transparent;
        border: 2px solid #94a3b8;
    }

    &__comparison-legend-dash {
        width: 12px;
        height: 3px;
        border-radius: 2px;
        background: #f59e0b;
        display: inline-block;
    }

    &__empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        text-align: center;
        min-height: 320px;
        padding: 24px;
        border-radius: 24px;
        background: #fff;
        border: 1px dashed rgba(148, 163, 184, 0.35);
    }

    &__empty-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 72px;
        height: 72px;
        border-radius: 999px;
        font-size: 34px;
        color: #2563eb;
        background: rgba(37, 99, 235, 0.08);
    }

    &__empty-title {
        margin: 0;
        font-size: 24px;
        font-weight: 800;
        color: #0f172a;
    }

    &__empty-text {
        margin: 0;
        font-size: 15px;
        color: #64748b;
    }


    &__select-wrap {
        position: relative;
        display: flex;
        align-items: center;
    }

    &__select-icon {
        position: absolute;
        inset-inline-start: 14px;
        font-size: 20px;
        color: #2563eb;
        pointer-events: none;
        z-index: 2;
    }

    &__select--fancy {
        min-height: 56px;
        padding-inline-start: 46px;
        padding-inline-end: 14px;
        border-radius: 18px;
        border: 1px solid rgba(148, 163, 184, 0.24);
        background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 251, 255, 0.96));
        box-shadow:
            0 10px 24px rgba(15, 23, 42, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.75);
        font-size: 15px;
        font-weight: 700;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        transition: 0.22s ease;
    }

    &__select--fancy:hover {
        border-color: rgba(37, 99, 235, 0.28);
        box-shadow:
            0 14px 28px rgba(37, 99, 235, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.82);
    }

    &__select--fancy:focus {
        border-color: #2563eb;
        box-shadow:
            0 0 0 4px rgba(37, 99, 235, 0.08),
            0 14px 30px rgba(37, 99, 235, 0.08);
    }
}

@media (max-width: 1200px) {
    .consumptions-page {
        &__stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        &__months-grid {
            grid-template-columns: 1fr;
        }
    }
}

@media (max-width: 900px) {
    .consumptions-page {
        &__hero {
            grid-template-columns: 1fr;
        }

        &__years-head--actions {
            flex-direction: column;
            align-items: stretch;
        }
    }
}

@media (max-width: 640px) {
    .consumptions-page {
        &__stats {
            grid-template-columns: 1fr;
        }

        &__month-metrics {
            grid-template-columns: 1fr;
        }

        &__hero-title {
            font-size: 24px;
        }

        &__section-title {
            font-size: 18px;
        }

        &__stat-value {
            font-size: 20px;
        }

        &__details-item {
            flex-direction: column;
            align-items: flex-start;
        }

        &__details-item-value {
            white-space: normal;
        }

        &__month-actions {
            justify-content: stretch;
        }

        &__download-button {
            width: 100%;
        }


        &__entity-card {
            min-height: 74px;
            padding: 14px;
            border-radius: 18px;
        }

        &__entity-card-icon {
            width: 46px;
            height: 46px;
            font-size: 21px;
        }
    }
}
</style>