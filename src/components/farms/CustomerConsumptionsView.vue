<template>
  <BasePageWrapper
    titleKey="الاستهلاكات"
    subtitleKey="متابعة إجماليات الاستهلاك حسب المزرعة والسنة"
    iconName="solar:waterdrops-outline"
  >
    <div class="consumptions-page">
      <BaseLoader v-if="isPageLoading" />

      <template v-else>
        <section class="consumptions-page__hero">
          <div class="consumptions-page__hero-copy">
            <span class="consumptions-page__eyebrow">الاستهلاكات</span>
            <h2 class="consumptions-page__hero-title">متابعة استهلاك المزرعة</h2>
            <p class="consumptions-page__hero-text">
              اختر المزرعة أولًا، وبعدها اختار السنة علشان تشوف إجماليات الري
              والتسميد والرش بشكل مرتب وواضح.
            </p>
          </div>

          <div class="consumptions-page__hero-filter">
            <label class="consumptions-page__field-label">اختر المزرعة</label>

            <select v-model="selectedFarmId" class="consumptions-page__select">
              <option value="">اختر المزرعة</option>
              <option
                v-for="farm in farmsOptions"
                :key="farm.id"
                :value="String(farm.id)"
              >
                {{ farm.name }}
              </option>
            </select>
          </div>
        </section>

        <section
          v-if="selectedFarmId && availableYears.length"
          class="consumptions-page__years"
        >
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 16px;">
            <div>
              <h3 class="consumptions-page__section-title">كل السنوات</h3>
              <p class="consumptions-page__section-subtitle">
                اختار السنة اللي عايز تعرض إجمالياتها أو تحمل تقريرها
              </p>
            </div>

            <button type="button" class="consumptions-page__download-button consumptions-page__download-button--year" @click="downloadYearReport">
              <BaseIcon name="solar:download-outline" />
              تحميل تقرير السنة
            </button>
          </div>

          <div class="consumptions-page__years-list">
            <button
              v-for="year in availableYears"
              :key="year"
              type="button"
              class="consumptions-page__year-chip"
              :class="{ 'consumptions-page__year-chip--active': selectedYear === year }"
              @click="selectedYear = year"
            >
              {{ year }}
            </button>
          </div>
        </section>

        <section v-if="!selectedFarmId" class="consumptions-page__empty-state">
          <div class="consumptions-page__empty-icon">
            <BaseIcon name="mdi:sprout" />
          </div>
          <h3 class="consumptions-page__empty-title">اختر المزرعة</h3>
          <p class="consumptions-page__empty-text">اختر المزرعة لعرض الإجماليات</p>
        </section>

        <section
          v-else-if="selectedFarmId && !availableYears.length"
          class="consumptions-page__empty-state"
        >
          <div class="consumptions-page__empty-icon">
            <BaseIcon name="solar:calendar-mark-outline" />
          </div>
          <h3 class="consumptions-page__empty-title">لا توجد بيانات</h3>
          <p class="consumptions-page__empty-text">
            لا توجد تقارير أو استهلاكات متاحة لهذه المزرعة حاليًا
          </p>
        </section>

        <template v-else>
          <!-- ── Yearly stat cards ── -->
          <section class="consumptions-page__stats">
            <!-- Irrigation -->
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
                <p class="consumptions-page__stat-planned">
                  {{ formatNumber(yearlyTotals.irrigationLiters) }} لتر
                </p>
              </div>
            </article>

            <!-- Fertilization -->
            <article
              class="consumptions-page__stat-card consumptions-page__stat-card--clickable"
              @click="toggleExpandedCard('fertilization')"
            >
              <div class="consumptions-page__stat-icon">
                <BaseIcon name="solar:leaf-outline" />
              </div>
              <div class="consumptions-page__stat-copy">
                <p class="consumptions-page__stat-label">إجمالي التسميد</p>
                <h3 class="consumptions-page__stat-value">
                  {{ formatNumber(yearlyActualTotals.fertilizationKg) }}
                  <span>كجم</span>
                </h3>
                <p class="consumptions-page__stat-planned">
                  {{ formatNumber(yearlyTotals.fertilizationKg) }} كجم
                </p>
                <p class="consumptions-page__stat-hint">اضغط لعرض أنواع الأسمدة المستخدمة</p>
              </div>
              <div class="consumptions-page__stat-arrow">
                <BaseIcon
                  :name="expandedCard === 'fertilization'
                    ? 'solar:alt-arrow-up-outline'
                    : 'solar:alt-arrow-down-outline'"
                />
              </div>
            </article>

            <!-- Spraying -->
            <article
              class="consumptions-page__stat-card consumptions-page__stat-card--clickable"
              @click="toggleExpandedCard('spraying')"
            >
              <div class="consumptions-page__stat-icon">
                <BaseIcon name="solar:magic-stick-3-outline" />
              </div>
              <div class="consumptions-page__stat-copy">
                <p class="consumptions-page__stat-label">إجمالي الرش</p>
                <h3 class="consumptions-page__stat-value">
                  {{ formatNumber(yearlyActualTotals.sprayingKg) }}
                  <span>كجم</span>
                </h3>
                <p class="consumptions-page__stat-planned">
                  {{ formatNumber(yearlyTotals.sprayingKg) }} كجم
                </p>
                <p class="consumptions-page__stat-hint">اضغط لعرض الأصناف المستخدمة</p>
              </div>
              <div class="consumptions-page__stat-arrow">
                <BaseIcon
                  :name="expandedCard === 'spraying'
                    ? 'solar:alt-arrow-up-outline'
                    : 'solar:alt-arrow-down-outline'"
                />
              </div>
            </article>
          </section>

          <!-- ── Fertilization yearly details ── -->
          <section
            v-if="expandedCard === 'fertilization'"
            class="consumptions-page__details-box"
          >
            <div class="consumptions-page__details-head">
              <h3 class="consumptions-page__section-title">تفاصيل الأسمدة المستخدمة</h3>
              <p class="consumptions-page__section-subtitle">
                إجمالي كل صنف تم استخدامه خلال سنة {{ selectedYear }}
              </p>
            </div>

            <div v-if="yearlyFertilizationMerged.length" class="consumptions-page__details-list">
              <div
                v-for="item in yearlyFertilizationMerged"
                :key="`fert-${item.name}`"
                class="consumptions-page__details-item"
              >
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

          <!-- ── Spraying yearly details ── -->
          <section
            v-if="expandedCard === 'spraying'"
            class="consumptions-page__details-box"
          >
            <div class="consumptions-page__details-head">
              <h3 class="consumptions-page__section-title">تفاصيل أصناف الرش المستخدمة</h3>
              <p class="consumptions-page__section-subtitle">
                إجمالي كل صنف تم استخدامه خلال سنة {{ selectedYear }}
              </p>
            </div>

            <div v-if="yearlySprayingMerged.length" class="consumptions-page__details-list">
              <div
                v-for="item in yearlySprayingMerged"
                :key="`spray-${item.name}`"
                class="consumptions-page__details-item"
              >
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

          <!-- ── Monthly breakdown ── -->
          <section class="consumptions-page__months">
            <div class="consumptions-page__months-head">
              <h3 class="consumptions-page__section-title">إجماليات سنة {{ selectedYear }}</h3>
              <p class="consumptions-page__section-subtitle">
                ملخص الاستهلاك الشهري للمزرعة المختارة
              </p>
            </div>

            <div class="consumptions-page__months-grid">
              <article
                v-for="month in monthlyBreakdown"
                :key="month.monthKey"
                class="consumptions-page__month-card"
                :class="{ 'consumptions-page__month-card--current': month.isCurrentMonth }"
              >
                <div class="consumptions-page__month-head">
                  <h4 class="consumptions-page__month-title">{{ month.monthLabel }}</h4>
                  <span class="consumptions-page__month-badge">{{ month.weeksCount }} أسبوع</span>
                </div>

                <!-- Metric tiles: actual main, planned strikethrough -->
                <div class="consumptions-page__month-metrics">
                  <div
                    v-if="month.irrigationLiters > 0 || month.actualIrrigationLiters > 0"
                    class="consumptions-page__metric"
                  >
                    <span class="consumptions-page__metric-label">مياه الري</span>
                    <strong class="consumptions-page__metric-value">
                      {{ formatNumber(month.actualIrrigationLiters) }} لتر
                    </strong>
                    <span class="consumptions-page__metric-planned">
                      {{ formatNumber(month.irrigationLiters) }} لتر
                    </span>
                  </div>

                  <button
                    v-if="month.fertilizationKg > 0 || month.actualFertilizationKg > 0"
                    type="button"
                    class="consumptions-page__metric consumptions-page__metric--clickable"
                    @click="toggleMonthExpanded(month.monthKey, 'fertilization')"
                  >
                    <span class="consumptions-page__metric-label">التسميد</span>
                    <strong class="consumptions-page__metric-value">
                      {{ formatNumber(month.actualFertilizationKg) }} كجم
                    </strong>
                    <span class="consumptions-page__metric-planned">
                      {{ formatNumber(month.fertilizationKg) }} كجم
                    </span>
                    <small class="consumptions-page__metric-hint">اضغط لعرض التفاصيل</small>
                  </button>

                  <button
                    v-if="month.sprayingKg > 0 || month.actualSprayingKg > 0"
                    type="button"
                    class="consumptions-page__metric consumptions-page__metric--clickable"
                    @click="toggleMonthExpanded(month.monthKey, 'spraying')"
                  >
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

                <!-- Comparison bars -->
                <div class="consumptions-page__comparison">
                  <!-- Irrigation bar -->
                  <div
                    v-if="month.irrigationLiters > 0 || month.actualIrrigationLiters > 0"
                    class="consumptions-page__comparison-row"
                  >
                    <div class="consumptions-page__comparison-label">
                      <BaseIcon name="solar:waterdrops-outline" class="consumptions-page__comparison-icon consumptions-page__comparison-icon--irr" />
                      <span>الري</span>
                    </div>
                    <div class="consumptions-page__comparison-bar-wrap">
                      <div class="consumptions-page__comparison-bar-track">
                        <div
                          class="consumptions-page__comparison-bar-fill consumptions-page__comparison-bar-fill--actual"
                          :style="{ width: month.irrigationLiters > 0 ? Math.min(100, (month.actualIrrigationLiters / month.irrigationLiters) * 100) + '%' : (month.actualIrrigationLiters > 0 ? '100%' : '0%') }"
                        />
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
                        <span
                          v-if="month.isCurrentMonth && month.plannedToDateIrrigationLiters !== null"
                          class="consumptions-page__comparison-val consumptions-page__comparison-val--ptd"
                        >
                          مخطط لحد اليوم: {{ formatNumber(month.plannedToDateIrrigationLiters) }} لتر
                        </span>
                        <span class="consumptions-page__comparison-val consumptions-page__comparison-val--planned">
                          {{ formatNumber(month.irrigationLiters) }} لتر
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Fertilization bar -->
                  <div
                    v-if="month.fertilizationKg > 0 || month.actualFertilizationKg > 0"
                    class="consumptions-page__comparison-row"
                  >
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
                        <span
                          v-if="month.isCurrentMonth && month.plannedToDateFertilizationKg !== null"
                          class="consumptions-page__comparison-val consumptions-page__comparison-val--ptd"
                        >
                          مخطط لحد اليوم: {{ formatNumber(month.plannedToDateFertilizationKg) }} كجم
                        </span>
                        <span class="consumptions-page__comparison-val consumptions-page__comparison-val--planned">
                          {{ formatNumber(month.fertilizationKg) }} كجم
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Spraying bar -->
                  <div
                    v-if="month.sprayingKg > 0 || month.actualSprayingKg > 0"
                    class="consumptions-page__comparison-row"
                  >
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
                        <span
                          v-if="month.isCurrentMonth && month.plannedToDateSprayingKg !== null"
                          class="consumptions-page__comparison-val consumptions-page__comparison-val--ptd"
                        >
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
                    <span
                      v-if="month.isCurrentMonth"
                      class="consumptions-page__comparison-legend-item consumptions-page__comparison-legend-item--ptd"
                    >
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
                  <button type="button" class="consumptions-page__download-button" @click="downloadMonthReport(month)">
                    <BaseIcon name="solar:download-outline" />
                    تحميل تقرير الشهر
                  </button>
                </div>

                <!-- Fertilization details dropdown -->
                <div
                  v-if="monthExpandedMap[month.monthKey] === 'fertilization'"
                  class="consumptions-page__month-details"
                >
                  <h5 class="consumptions-page__month-details-title">
                    تفاصيل التسميد في {{ month.monthLabel }}
                  </h5>

                  <div
                    v-if="mergeProducts(month.actualFertilizationProducts, month.fertilizationProducts, month.plannedToDateFertilizationProducts, month.isCurrentMonth).length"
                    class="consumptions-page__details-list"
                  >
                    <div
                      v-for="item in mergeProducts(month.actualFertilizationProducts, month.fertilizationProducts, month.plannedToDateFertilizationProducts, month.isCurrentMonth)"
                      :key="`${month.monthKey}-fert-${item.name}`"
                      class="consumptions-page__details-item"
                    >
                      <div class="consumptions-page__details-item-copy">
                        <strong>{{ item.name }}</strong>
                        <span>خلال الشهر</span>
                      </div>
                      <div class="consumptions-page__details-item-vals">
                        <span class="consumptions-page__details-item-value">{{ formatNumber(item.actual) }} كجم</span>
                        <span v-if="month.isCurrentMonth" class="consumptions-page__details-item-ptd">
                          لحد اليوم: {{ formatNumber(item.ptd) }} كجم
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
                <div
                  v-if="monthExpandedMap[month.monthKey] === 'spraying'"
                  class="consumptions-page__month-details"
                >
                  <h5 class="consumptions-page__month-details-title">
                    تفاصيل الرش في {{ month.monthLabel }}
                  </h5>

                  <div
                    v-if="mergeProducts(month.actualSprayingProducts, month.sprayingProducts, month.plannedToDateSprayingProducts, month.isCurrentMonth).length"
                    class="consumptions-page__details-list"
                  >
                    <div
                      v-for="item in mergeProducts(month.actualSprayingProducts, month.sprayingProducts, month.plannedToDateSprayingProducts, month.isCurrentMonth)"
                      :key="`${month.monthKey}-spray-${item.name}`"
                      class="consumptions-page__details-item"
                    >
                      <div class="consumptions-page__details-item-copy">
                        <strong>{{ item.name }}</strong>
                        <span>خلال الشهر</span>
                      </div>
                      <div class="consumptions-page__details-item-vals">
                        <span class="consumptions-page__details-item-value">{{ formatNumber(item.actual) }} كجم</span>
                        <span v-if="month.isCurrentMonth" class="consumptions-page__details-item-ptd">
                          لحد اليوم: {{ formatNumber(item.ptd) }} كجم
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
  </BasePageWrapper>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useFarmsStore } from "@/stores/farms.store";
import { useReportsStore } from "@/stores/reports.store";
import { useTasksStore } from "@/stores/tasks.store";
import FertilizerTypesServices from "@/services/fertilizerTypes.services";
import PesticideTypesServices from "@/services/pesticideTypes.services";

const { locale } = useI18n();

const farmsStore = useFarmsStore();
const reportsStore = useReportsStore();
const tasksStore = useTasksStore();

const { records: farmsRecords, uiFlags: farmsUiFlags } = storeToRefs(farmsStore);
const { records: reportsRecords, uiFlags: reportsUiFlags } = storeToRefs(reportsStore);
const { records: tasksRecords } = storeToRefs(tasksStore);

const selectedFarmId = ref("");
const selectedYear = ref("");
const expandedCard = ref("");
const monthExpandedMap = ref({});
const fertilizerTypesRecords = ref([]);
const pesticideTypesRecords = ref([]);

const isPageLoading = computed(() => {
  return farmsUiFlags.value?.isFetchingList || reportsUiFlags.value?.isFetchingList;
});

const farmsOptions = computed(() => {
  return (farmsRecords.value || []).map((farm) => ({
    id: farm.id,
    name: farm.name,
  }));
});

// ─── Helpers ───────────────────────────────────────────────────────────────
const roundNumber = (value) => Number(Number(value || 0).toFixed(2));

const formatNumber = (value) => {
  const n = Number(value || 0);
  return n % 1 === 0 ? n.toLocaleString() : n.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const reportDate = (report) => report?.report_weeks?.[0]?.date || null;

const numberOfTreesFor = (report) =>
  Number(
    report?.palm_type?.number_of_trees ||
      report?.farm?.palm_type?.number_of_trees ||
      report?.number_of_trees ||
      0
  );

const normalizeProductName = (value) => String(value || "").trim().replace(/\s+/g, " ");

const addToMap = (map, name, amount) => {
  const cleanName = normalizeProductName(name);
  const cleanAmount = Number(amount || 0);
  if (!cleanName || !cleanAmount) return;
  if (!map[cleanName]) map[cleanName] = 0;
  map[cleanName] += cleanAmount;
};

const mapToSortedArray = (map) =>
  Object.entries(map)
    .map(([name, total]) => ({ name, total: roundNumber(total) }))
    .sort((a, b) => b.total - a.total);

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
    if (name && totalKg > 0) result.push({ name, totalKg });
  }
  return result;
};

const extractSprayingEntries = (day, treesCount) => {
  const result = [];
  const name = getPesticideTypeName(day);
  const totalKg = (Number(day?.amount_of_spray || 0) * Number(treesCount || 0)) / 1000;
  if (name && totalKg > 0) result.push({ name, totalKg });

  for (const item of Array.isArray(day?.spraying_items) ? day.spraying_items : []) {
    const itemName = getPesticideTypeName(day, item);
    const quantityPerPalm =
      Number(item?.quantity_per_palm_tree || 0) ||
      Number(item?.amount_per_palm_tree || 0) ||
      Number(item?.quantity || 0);
    const itemTotalKg = (quantityPerPalm * treesCount) / 1000;
    if (itemName && itemTotalKg > 0) result.push({ name: itemName, totalKg: itemTotalKg });
  }
  return result;
};

const hasRealTaskForDay = (day) => {
  const hasFertilization =
    Array.isArray(day?.fertilizations) &&
    day.fertilizations.some(
      (f) =>
        !!f?.fertilizer_type_id ||
        (String(f?.type_of_fertilization || "").trim() !== "" &&
          String(f?.type_of_fertilization || "") !== "0") ||
        Number(f?.fertilizer_quantity_per_palm_tree || 0) > 0
    );
  const irrigationPerTree = Number(day?.irrigation_amount_per_palm_tree || 0);
  const sprayAmount = Number(day?.amount_of_spray || 0);
  const hasSprayingName = !!day?.pesticide_type_id || String(day?.spraying || "").trim() !== "";
  return hasFertilization || irrigationPerTree > 0 || sprayAmount > 0 || hasSprayingName;
};

// ─── Available years (reports + tasks) ───────────────────────────────────
const availableYears = computed(() => {
  const fromReports = (reportsRecords.value || [])
    .map((r) => { const d = reportDate(r); return d ? new Date(d).getFullYear() : null; })
    .filter(Boolean);

  const fromTasks = (tasksRecords.value || [])
    .filter((t) => t.is_completed && t.date)
    .map((t) => new Date(t.date.slice(0, 10)).getFullYear());

  return [...new Set([...fromReports, ...fromTasks])].sort((a, b) => b - a);
});

const filteredReportsByYear = computed(() => {
  if (!selectedYear.value) return [];
  return (reportsRecords.value || []).filter((report) => {
    const date = reportDate(report);
    if (!date) return false;
    return new Date(date).getFullYear() === Number(selectedYear.value);
  });
});

// ─── Actual data from completed tasks ────────────────────────────────────
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
      grouped[monthKey].irrigationLiters +=
        Number(qd.irrigation_amount_per_palm_tree || 0) * treesCount;
    } else if (task.task_type === "spraying") {
      const totalKg = (Number(qd.amount_of_spray || 0) * treesCount) / 1000;
      grouped[monthKey].sprayingKg += totalKg;
      const name = normalizeProductName(qd.pesticide_type_name || qd.spraying || "");
      if (name && totalKg > 0) addToMap(grouped[monthKey].sprayingProductsMap, name, totalKg);
    } else if (task.task_type === "fertilization") {
      const totalKg = (Number(qd.fertilizer_quantity_per_palm_tree || 0) * treesCount) / 1000;
      grouped[monthKey].fertilizationKg += totalKg;
      const name = normalizeProductName(qd.fertilizer_type_name || qd.type_of_fertilization || "");
      if (name && totalKg > 0) addToMap(grouped[monthKey].fertilizationProductsMap, name, totalKg);
    }
  }

  for (const key of Object.keys(grouped)) {
    grouped[key].irrigationLiters = roundNumber(grouped[key].irrigationLiters);
    grouped[key].fertilizationKg = roundNumber(grouped[key].fertilizationKg);
    grouped[key].sprayingKg = roundNumber(grouped[key].sprayingKg);
  }
  return grouped;
});

// ─── Planned-to-date for current month ───────────────────────────────────
const plannedToDateMonthData = computed(() => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentMonthKey = `${currentYear}-${currentMonth + 1}`;
  const todayDate = now.toISOString().slice(0, 10);

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
    if (reportDateObj.getFullYear() !== currentYear || reportDateObj.getMonth() !== currentMonth)
      continue;

    const treesCount = numberOfTreesFor(report);
    for (const week of report?.report_weeks || []) {
      for (const day of week?.days || []) {
        if (!hasRealTaskForDay(day)) continue;
        const dayDate = day?.date?.slice(0, 10) || "";
        if (dayDate > todayDate) continue;

        result.irrigationLiters +=
          Number(day?.irrigation_amount_per_palm_tree || 0) * treesCount;

        for (const item of extractFertilizationEntries(day, treesCount)) {
          result.fertilizationKg += item.totalKg;
          addToMap(result.fertilizationProductsMap, item.name, item.totalKg);
        }
        for (const item of extractSprayingEntries(day, treesCount)) {
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

// ─── Monthly breakdown (reports + actuals merged) ────────────────────────
const monthlyBreakdown = computed(() => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const grouped = {};

  // From reports (planned)
  for (const report of filteredReportsByYear.value) {
    const date = reportDate(report);
    if (!date) continue;

    const dateObject = new Date(date);
    const monthIndex = dateObject.getMonth();
    const year = dateObject.getFullYear();
    const monthKey = `${year}-${monthIndex + 1}`;

    if (!grouped[monthKey]) {
      grouped[monthKey] = {
        monthKey, monthIndex, monthNumber: monthIndex + 1, year,
        isCurrentMonth: year === currentYear && monthIndex === currentMonth,
        monthLabel: new Intl.DateTimeFormat(locale.value || "ar", {
          month: "long", year: "numeric",
        }).format(dateObject),
        weeksCount: 0,
        irrigationLiters: 0, fertilizationKg: 0, sprayingKg: 0,
        fertilizationProductsMap: {}, sprayingProductsMap: {},
        actualIrrigationLiters: 0, actualFertilizationKg: 0, actualSprayingKg: 0,
        actualFertilizationProductsMap: {}, actualSprayingProductsMap: {},
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

        for (const item of extractFertilizationEntries(day, treesCount)) {
          grouped[monthKey].fertilizationKg += item.totalKg;
          addToMap(grouped[monthKey].fertilizationProductsMap, item.name, item.totalKg);
        }
        for (const item of extractSprayingEntries(day, treesCount)) {
          grouped[monthKey].sprayingKg += item.totalKg;
          addToMap(grouped[monthKey].sprayingProductsMap, item.name, item.totalKg);
        }
      }
    }
  }

  // Merge actual data
  const actualData = actualMonthlyData.value;
  for (const monthKey of Object.keys(actualData)) {
    if (grouped[monthKey]) {
      grouped[monthKey].actualIrrigationLiters = actualData[monthKey].irrigationLiters;
      grouped[monthKey].actualFertilizationKg = actualData[monthKey].fertilizationKg;
      grouped[monthKey].actualSprayingKg = actualData[monthKey].sprayingKg;
      grouped[monthKey].actualFertilizationProductsMap = actualData[monthKey].fertilizationProductsMap || {};
      grouped[monthKey].actualSprayingProductsMap = actualData[monthKey].sprayingProductsMap || {};
    } else {
      const parts = monthKey.split("-");
      const year = Number(parts[0]);
      const monthNumber = Number(parts[1]);
      const monthIndex = monthNumber - 1;
      const dateObject = new Date(year, monthIndex, 1);
      grouped[monthKey] = {
        monthKey, monthIndex, monthNumber, year,
        isCurrentMonth: year === currentYear && monthIndex === currentMonth,
        monthLabel: new Intl.DateTimeFormat(locale.value || "ar", {
          month: "long", year: "numeric",
        }).format(dateObject),
        weeksCount: 0,
        irrigationLiters: 0, fertilizationKg: 0, sprayingKg: 0,
        fertilizationProductsMap: {}, sprayingProductsMap: {},
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

  // Merge planned-to-date
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
    .filter((item) => {
      const hasPlanned = item.irrigationLiters > 0 || item.fertilizationKg > 0 || item.sprayingKg > 0;
      const hasActual = item.actualIrrigationLiters > 0 || item.actualFertilizationKg > 0 || item.actualSprayingKg > 0;
      return hasPlanned || hasActual;
    })
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.monthIndex - a.monthIndex;
    });
});

// ─── Yearly totals ────────────────────────────────────────────────────────
const yearlyTotals = computed(() =>
  monthlyBreakdown.value.reduce(
    (sum, month) => {
      sum.irrigationLiters += Number(month.irrigationLiters || 0);
      sum.fertilizationKg += Number(month.fertilizationKg || 0);
      sum.sprayingKg += Number(month.sprayingKg || 0);
      return sum;
    },
    { irrigationLiters: 0, fertilizationKg: 0, sprayingKg: 0 }
  )
);

const yearlyActualTotals = computed(() =>
  monthlyBreakdown.value.reduce(
    (sum, month) => {
      sum.irrigationLiters += Number(month.actualIrrigationLiters || 0);
      sum.fertilizationKg += Number(month.actualFertilizationKg || 0);
      sum.sprayingKg += Number(month.actualSprayingKg || 0);
      return sum;
    },
    { irrigationLiters: 0, fertilizationKg: 0, sprayingKg: 0 }
  )
);

// ─── Merge products helper ────────────────────────────────────────────────
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

// ─── Yearly merged lists ──────────────────────────────────────────────────
const yearlyFertilizationMerged = computed(() => {
  const plannedMap = {}, actualMap = {};
  for (const month of monthlyBreakdown.value) {
    for (const item of month.fertilizationProducts || []) addToMap(plannedMap, item.name, item.total);
    for (const item of month.actualFertilizationProducts || []) addToMap(actualMap, item.name, item.total);
  }
  return mergeProducts(mapToSortedArray(actualMap), mapToSortedArray(plannedMap), [], false);
});

const yearlySprayingMerged = computed(() => {
  const plannedMap = {}, actualMap = {};
  for (const month of monthlyBreakdown.value) {
    for (const item of month.sprayingProducts || []) addToMap(plannedMap, item.name, item.total);
    for (const item of month.actualSprayingProducts || []) addToMap(actualMap, item.name, item.total);
  }
  return mergeProducts(mapToSortedArray(actualMap), mapToSortedArray(plannedMap), [], false);
});

// ─── UI helpers ──────────────────────────────────────────────────────────
const toggleExpandedCard = (cardName) => {
  expandedCard.value = expandedCard.value === cardName ? "" : cardName;
};

const toggleMonthExpanded = (monthKey, type) => {
  monthExpandedMap.value = {
    ...monthExpandedMap.value,
    [monthKey]: monthExpandedMap.value[monthKey] === type ? "" : type,
  };
};

// ─── Data fetching ────────────────────────────────────────────────────────
const fetchFarms = async () => {
  await farmsStore.fetchRecords({ page: 1, per_page: 1000 });
};

const fetchFarmReports = async (farmId) => {
  if (!farmId) return;
  await reportsStore.fetchRecords({ farm_id: farmId });
};

const fetchFarmTasks = async (farmId) => {
  if (!farmId) return;
  await tasksStore.fetchRecords({ farm_id: farmId, per_page: 10000 });
};

// ─── PDF Exports ──────────────────────────────────────────────────────────

const getSelectedFarmName = () => {
  return farmsOptions.value.find(f => String(f.id) === String(selectedFarmId.value))?.name || "";
};

const escapeHtml = (unsafe) => {
  return String(unsafe || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const pdfBaseStyles = `
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, sans-serif; direction: rtl; color: #0f172a; background: #ffffff; }
  .report-page { width: 100%; max-width: 720px; margin: 0 auto; padding: 12px; background: #ffffff; overflow: visible; }
  .report-header { margin-bottom: 20px; padding: 18px; border: 1px solid #dbe3ef; border-radius: 16px; background: radial-gradient(circle at top right, rgba(34, 197, 94, 0.10), transparent 32%), radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 34%), linear-gradient(180deg, #ffffff, #f8fbff); }
  .report-eyebrow { margin: 0 0 8px; font-size: 13px; font-weight: 800; color: #2563eb; }
  .report-title { margin: 0 0 10px; font-size: 28px; font-weight: 800; color: #0f172a; }
  .report-subtitle { margin: 0; color: #475569; line-height: 1.9; font-size: 14px; }
  .report-section { margin-top: 20px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 18px; background: #ffffff; page-break-inside: avoid; break-inside: avoid; overflow: visible; }
  .report-section h3 { margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #0f172a; }
  .summary-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
  .summary-card { border: 1px solid #dbe3ef; border-radius: 16px; padding: 14px; background: #f8fbff; min-width: 0; }
  .summary-card .summary-label { display: block; color: #64748b; font-size: 13px; font-weight: 700; }
  .summary-card strong { display: block; margin-top: 8px; font-size: 24px; color: #0f172a; word-break: break-word; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; table-layout: fixed; }
  th, td { border: 1px solid #dbe3ef; padding: 10px 8px; text-align: right; vertical-align: top; font-size: 13px; word-break: break-word; }
  th { background: #eff6ff; font-weight: 800; }
  .empty-row { text-align: center; color: #64748b; background: #f8fafc; }
  .val-actual { font-weight: 800; color: #16a34a; }
  .val-planned { font-size: 11px; color: #94a3b8; display: block; margin-top: 2px; }
  .val-ptd { font-size: 11px; font-weight: 700; color: #d97706; display: block; margin-top: 2px; }
  .badge-current { display: inline-block; margin-inline-start: 8px; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 999px; background: #eff6ff; color: #2563eb; }
`;

const plannedSpan = (text) =>
  `<span style="position:relative;display:inline-block;color:#94a3b8;font-size:11px;margin-top:2px;">${escapeHtml(text)}<span style="position:absolute;left:0;right:0;top:70%;height:1px;background:#94a3b8;"></span></span>`;

const renderTableRows = (rows, columnsCount) => {
  if (!rows.length) return `<tr><td class="empty-row" colspan="${columnsCount}">لا توجد بيانات</td></tr>`;
  return rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("");
};

const buildDocumentHtml = ({ title, subtitle, content }) => `
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
    const html2pdf = (await import("html2pdf.js")).default;
    wrapper = createPdfElement(htmlString);
    const target = wrapper.querySelector(".report-page");
    await html2pdf()
      .set({
        margin: [6, 6, 6, 6],
        filename: fileName,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff", scrollX: 0, scrollY: 0 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      })
      .from(target)
      .save();
  } catch (error) {
    console.error(error);
    alert("حصلت مشكلة أثناء إنشاء ملف PDF.");
  } finally {
    if (wrapper?.parentNode) wrapper.parentNode.removeChild(wrapper);
  }
};

const buildMonthReportHtml = (month) => {
  const isCurrentMonth = month.isCurrentMonth;
  const fertMap = {};
  for (const item of month.fertilizationProducts || []) fertMap[item.name] = { planned: item.total, actual: 0, ptd: 0 };
  for (const item of month.actualFertilizationProducts || []) {
    if (!fertMap[item.name]) fertMap[item.name] = { planned: 0, actual: 0, ptd: 0 };
    fertMap[item.name].actual = item.total;
  }
  if (isCurrentMonth) {
    for (const item of month.plannedToDateFertilizationProducts || []) {
      if (!fertMap[item.name]) fertMap[item.name] = { planned: 0, actual: 0, ptd: 0 };
      fertMap[item.name].ptd = item.total;
    }
  }

  const sprayMap = {};
  for (const item of month.sprayingProducts || []) sprayMap[item.name] = { planned: item.total, actual: 0, ptd: 0 };
  for (const item of month.actualSprayingProducts || []) {
    if (!sprayMap[item.name]) sprayMap[item.name] = { planned: 0, actual: 0, ptd: 0 };
    sprayMap[item.name].actual = item.total;
  }
  if (isCurrentMonth) {
    for (const item of month.plannedToDateSprayingProducts || []) {
      if (!sprayMap[item.name]) sprayMap[item.name] = { planned: 0, actual: 0, ptd: 0 };
      sprayMap[item.name].ptd = item.total;
    }
  }

  const fertRows = Object.entries(fertMap).map(([name, v]) => [name, v.actual, v.planned, v.ptd]);
  const sprayRows = Object.entries(sprayMap).map(([name, v]) => [name, v.actual, v.planned, v.ptd]);

  const renderProductRows = (rows) => {
    if (!rows.length) return `<tr><td class="empty-row" colspan="4">لا توجد بيانات</td></tr>`;
    return rows.map(([name, actual, planned, ptd]) => `
      <tr>
        <td>${escapeHtml(name)}</td>
        <td><span class="val-actual">${formatNumber(actual)} كجم</span></td>
        <td>${plannedSpan(formatNumber(planned) + ' كجم')}</td>
        ${isCurrentMonth ? `<td><span class="val-ptd">${formatNumber(ptd)} كجم</span></td>` : ""}
      </tr>
    `).join("");
  };

  const ptdHeader = isCurrentMonth ? "<th>مخطط لحد اليوم</th>" : "";
  const subtitle = `
    المزرعة: ${escapeHtml(getSelectedFarmName())}<br>
    الشهر: ${escapeHtml(month.monthLabel)}${isCurrentMonth ? " <strong>(الشهر الحالي)</strong>" : ""}<br>
    عدد الأسابيع: ${escapeHtml(String(month.weeksCount))}<br>
    تاريخ إنشاء التقرير: ${escapeHtml(new Date().toLocaleString("ar-EG"))}
  `;

  const content = `
    <div class="report-section">
      <h3>ملخص الشهر</h3>
      <div class="summary-grid">
        <div class="summary-card">
          <span class="summary-label">مياه الري</span>
          <strong class="val-actual">${escapeHtml(formatNumber(month.actualIrrigationLiters))} لتر</strong>
          ${plannedSpan('مخطط: ' + formatNumber(month.irrigationLiters) + ' لتر')}
          ${isCurrentMonth && month.plannedToDateIrrigationLiters !== null ? `<span class="val-ptd">لحد اليوم: ${escapeHtml(formatNumber(month.plannedToDateIrrigationLiters))} لتر</span>` : ""}
        </div>
        <div class="summary-card">
          <span class="summary-label">التسميد</span>
          <strong class="val-actual">${escapeHtml(formatNumber(month.actualFertilizationKg))} كجم</strong>
          ${plannedSpan('مخطط: ' + formatNumber(month.fertilizationKg) + ' كجم')}
          ${isCurrentMonth && month.plannedToDateFertilizationKg !== null ? `<span class="val-ptd">لحد اليوم: ${escapeHtml(formatNumber(month.plannedToDateFertilizationKg))} كجم</span>` : ""}
        </div>
        <div class="summary-card">
          <span class="summary-label">الرش</span>
          <strong class="val-actual">${escapeHtml(formatNumber(month.actualSprayingKg))} كجم</strong>
          ${plannedSpan('مخطط: ' + formatNumber(month.sprayingKg) + ' كجم')}
          ${isCurrentMonth && month.plannedToDateSprayingKg !== null ? `<span class="val-ptd">لحد اليوم: ${escapeHtml(formatNumber(month.plannedToDateSprayingKg))} كجم</span>` : ""}
        </div>
      </div>
    </div>

    <div class="report-section">
      <h3>أصناف التسميد خلال الشهر</h3>
      <table>
        <thead>
          <tr>
            <th>الصنف</th>
            <th>المنفذ فعلاً</th>
            <th>المخطط</th>
            ${ptdHeader}
          </tr>
        </thead>
        <tbody>
          ${renderProductRows(fertRows)}
        </tbody>
      </table>
    </div>

    <div class="report-section">
      <h3>أصناف الرش خلال الشهر</h3>
      <table>
        <thead>
          <tr>
            <th>الصنف</th>
            <th>المنفذ فعلاً</th>
            <th>المخطط</th>
            ${ptdHeader}
          </tr>
        </thead>
        <tbody>
          ${renderProductRows(sprayRows)}
        </tbody>
      </table>
    </div>
  `;

  return buildDocumentHtml({ title: `تقرير استهلاكات ${month.monthLabel}`, subtitle, content });
};

const buildYearReportHtml = () => {
  const monthsRows = monthlyBreakdown.value.map((month) => [
    month.monthLabel + (month.isCurrentMonth ? " (الحالي)" : ""),
    `${month.weeksCount}`,
    `${formatNumber(month.actualIrrigationLiters)} / ${formatNumber(month.irrigationLiters)} لتر`,
    `${formatNumber(month.actualFertilizationKg)} / ${formatNumber(month.fertilizationKg)} كجم`,
    `${formatNumber(month.actualSprayingKg)} / ${formatNumber(month.sprayingKg)} كجم`,
  ]);

  const fertMap = {};
  const sprayMap = {};
  for (const month of monthlyBreakdown.value) {
    for (const item of month.fertilizationProducts || []) {
      if (!fertMap[item.name]) fertMap[item.name] = { planned: 0, actual: 0 };
      fertMap[item.name].planned += item.total;
    }
    for (const item of month.actualFertilizationProducts || []) {
      if (!fertMap[item.name]) fertMap[item.name] = { planned: 0, actual: 0 };
      fertMap[item.name].actual += item.total;
    }
    for (const item of month.sprayingProducts || []) {
      if (!sprayMap[item.name]) sprayMap[item.name] = { planned: 0, actual: 0 };
      sprayMap[item.name].planned += item.total;
    }
    for (const item of month.actualSprayingProducts || []) {
      if (!sprayMap[item.name]) sprayMap[item.name] = { planned: 0, actual: 0 };
      sprayMap[item.name].actual += item.total;
    }
  }

  const renderYearlyProductRows = (map) => {
    const entries = Object.entries(map);
    if (!entries.length) return `<tr><td class="empty-row" colspan="3">لا توجد بيانات</td></tr>`;
    return entries.sort((a, b) => b[1].actual - a[1].actual).map(([name, v]) => `
      <tr>
        <td>${escapeHtml(name)}</td>
        <td><span class="val-actual">${formatNumber(v.actual)} كجم</span></td>
        <td>${plannedSpan(formatNumber(v.planned) + ' كجم')}</td>
      </tr>
    `).join("");
  };

  const subtitle = `
    المزرعة: ${escapeHtml(getSelectedFarmName())}<br>
    السنة: ${escapeHtml(selectedYear.value)}<br>
    تاريخ إنشاء التقرير: ${escapeHtml(new Date().toLocaleString("ar-EG"))}
  `;

  const content = `
    <div class="report-section">
      <h3>الملخص العام</h3>
      <div class="summary-grid">
        <div class="summary-card">
          <span class="summary-label">مياه الري</span>
          <strong class="val-actual">${escapeHtml(formatNumber(yearlyActualTotals.value.irrigationLiters))} لتر</strong>
          ${plannedSpan('مخطط: ' + formatNumber(yearlyTotals.value.irrigationLiters) + ' لتر')}
        </div>
        <div class="summary-card">
          <span class="summary-label">التسميد</span>
          <strong class="val-actual">${escapeHtml(formatNumber(yearlyActualTotals.value.fertilizationKg))} كجم</strong>
          ${plannedSpan('مخطط: ' + formatNumber(yearlyTotals.value.fertilizationKg) + ' كجم')}
        </div>
        <div class="summary-card">
          <span class="summary-label">الرش</span>
          <strong class="val-actual">${escapeHtml(formatNumber(yearlyActualTotals.value.sprayingKg))} كجم</strong>
          ${plannedSpan('مخطط: ' + formatNumber(yearlyTotals.value.sprayingKg) + ' كجم')}
        </div>
      </div>
    </div>

    <div class="report-section">
      <h3>تفاصيل الشهور (منفذ / مخطط)</h3>
      <table>
        <thead>
          <tr>
            <th>الشهر</th>
            <th>أسابيع</th>
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
            <th>المنفذ فعلاً</th>
            <th>المخطط</th>
          </tr>
        </thead>
        <tbody>
          ${renderYearlyProductRows(fertMap)}
        </tbody>
      </table>
    </div>

    <div class="report-section">
      <h3>أصناف الرش خلال السنة</h3>
      <table>
        <thead>
          <tr>
            <th>الصنف</th>
            <th>المنفذ فعلاً</th>
            <th>المخطط</th>
          </tr>
        </thead>
        <tbody>
          ${renderYearlyProductRows(sprayMap)}
        </tbody>
      </table>
    </div>
  `;

  return buildDocumentHtml({ title: `تقرير استهلاكات السنة ${selectedYear.value}`, subtitle, content });
};

const downloadYearReport = async () => {
  if (!selectedYear.value || !monthlyBreakdown.value.length) return;
  await downloadPdfFile(buildYearReportHtml(), `year-report-${selectedYear.value}-farm-${selectedFarmId.value}.pdf`);
};

const downloadMonthReport = async (month) => {
  await downloadPdfFile(buildMonthReportHtml(month), `month-report-${month.year}-${month.monthNumber}-farm-${selectedFarmId.value}.pdf`);
};

watch(selectedFarmId, async (farmId) => {
  selectedYear.value = "";
  expandedCard.value = "";
  monthExpandedMap.value = {};
  if (!farmId) return;

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
  await Promise.all([fetchFarms(), fetchTypesLookups()]);
});
</script>

<style scoped lang="scss">
.consumptions-page {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__hero {
    display: grid;
    grid-template-columns: 1.4fr 0.9fr;
    gap: 20px;
    padding: 24px;
    border-radius: 28px;
    border: 1px solid rgba(59, 130, 246, 0.12);
    background:
      radial-gradient(circle at top right, rgba(34, 197, 94, 0.13), transparent 28%),
      radial-gradient(circle at top left, rgba(59, 130, 246, 0.14), transparent 30%),
      linear-gradient(180deg, #ffffff, #f7fbff);
  }

  &__eyebrow {
    display: inline-flex;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 700;
    color: #2563eb;
  }

  &__hero-title {
    margin: 0 0 10px;
    font-size: 30px;
    font-weight: 800;
    color: #0f172a;
  }

  &__hero-text {
    margin: 0;
    font-size: 15px;
    line-height: 1.9;
    color: #475569;
  }

  &__hero-filter {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    padding: 18px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.2);
  }

  &__field-label {
    font-size: 14px;
    font-weight: 700;
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
    outline: none;
    color: #0f172a;

    &:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
    }
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
    font-weight: 700;
    cursor: pointer;
    transition: 0.2s ease;

    &:hover { transform: translateY(-1px); border-color: #93c5fd; }
    &--active { background: linear-gradient(135deg, #2563eb, #22c55e); color: #fff; border-color: transparent; }
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

    &--clickable {
      cursor: pointer;
      transition: 0.2s ease;
      &:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06); }
    }
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

  &__stat-copy { min-width: 0; flex: 1; }

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

    span { font-size: 14px; color: #64748b; margin-inline-start: 4px; }
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
    font-weight: 700;
  }

  &__stat-arrow { flex-shrink: 0; font-size: 22px; color: #64748b; }

  &__details-list { display: grid; gap: 12px; }

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

    strong { font-size: 15px; color: #0f172a; }
    span { font-size: 12px; color: #64748b; }
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

    &--current { border-color: rgba(37, 99, 235, 0.25); }
  }

  &__month-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  &__month-title { margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; }

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
    margin-bottom: 16px;
  }

  &__metric {
    padding: 14px;
    border-radius: 16px;
    background: #fff;
    border: 1px solid rgba(226, 232, 240, 0.95);
    text-align: start;

    &--clickable {
      cursor: pointer;
      transition: 0.2s ease;
      width: 100%;
      &:hover { transform: translateY(-1px); border-color: #93c5fd; box-shadow: 0 12px 24px rgba(15, 23, 42, 0.04); }
    }
  }

  &__metric-label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 700; color: #64748b; }
  &__metric-value { display: block; font-size: 16px; font-weight: 800; color: #0f172a; }

  &__metric-planned {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    text-decoration: line-through;
    margin-top: 3px;
  }

  &__metric-hint { display: block; margin-top: 8px; font-size: 12px; color: #2563eb; font-weight: 700; }

  // ── Comparison bars ────────────────────────────────────────────────────
  &__comparison { display: flex; flex-direction: column; gap: 14px; margin-top: 16px; }

  &__comparison-row { display: flex; align-items: center; gap: 12px; }

  &__comparison-label {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    width: 60px;
    font-size: 12px;
    font-weight: 700;
    color: #475569;
    justify-content: flex-end;
  }

  &__comparison-icon { font-size: 16px; }
  &__comparison-icon--irr { color: #2563eb; }
  &__comparison-icon--fert { color: #16a34a; }
  &__comparison-icon--spray { color: #9333ea; }

  &__comparison-bar-wrap { flex: 1; display: flex; flex-direction: column; gap: 5px; }

  &__comparison-bar-track {
    position: relative;
    height: 10px;
    border-radius: 999px;
    background: #e2e8f0;
    overflow: visible;
  }

  &__comparison-bar-fill {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    border-radius: 999px;
    transition: width 0.55s cubic-bezier(0.22, 1, 0.36, 1);

    &--actual {
      background: linear-gradient(90deg, #22c55e, #16a34a);
      box-shadow: 0 2px 8px rgba(34, 197, 94, 0.35);
    }
  }

  &__comparison-bar-marker {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 18px;
    border-radius: 999px;
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

    &--actual { color: #16a34a; }
    &--ptd { color: #d97706; }
    &--planned { color: #94a3b8; }
  }

  &__comparison-legend {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
    margin-top: 8px;
    padding-top: 10px;
    border-top: 1px dashed rgba(148, 163, 184, 0.25);
  }

  &__comparison-legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;

    &--actual { color: #16a34a; }
    &--ptd { color: #d97706; }
    &--planned { color: #94a3b8; }
  }

  &__comparison-legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;

    &--planned { background: #cbd5e1; }
  }

  &__comparison-legend-dash {
    width: 14px;
    height: 3px;
    border-radius: 999px;
    background: #f59e0b;
  }

  // ── Month details dropdown ────────────────────────────────────────────
  &__month-details {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px dashed rgba(148, 163, 184, 0.35);
  }

  &__month-actions {
    display: flex;
    justify-content: flex-start;
    margin-top: 14px;
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

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 24px rgba(37, 99, 235, 0.18);
    }

    &--year {
      white-space: nowrap;
    }
  }

  &__month-details-title { margin: 0 0 12px; font-size: 16px; font-weight: 800; color: #0f172a; }

  // ── Empty state ───────────────────────────────────────────────────────
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

  &__empty-title { margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; }
  &__empty-text { margin: 0; font-size: 15px; color: #64748b; }
}

@media (max-width: 1200px) {
  .consumptions-page {
    &__stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    &__months-grid { grid-template-columns: 1fr; }
  }
}

@media (max-width: 900px) {
  .consumptions-page {
    &__hero { grid-template-columns: 1fr; }
  }
}

@media (max-width: 640px) {
  .consumptions-page {
    &__stats { grid-template-columns: 1fr; }
    &__month-metrics { grid-template-columns: 1fr; }
    &__hero-title { font-size: 24px; }
    &__section-title { font-size: 18px; }
    &__stat-value { font-size: 20px; }
    &__details-item { flex-direction: column; align-items: flex-start; }
    &__details-item-value { white-space: normal; }
    &__comparison-label { width: 48px; }

    &__month-actions {
      justify-content: center;
      width: 100%;
    }

    &__download-button {
      width: 100%;
    }
  }
}
</style>