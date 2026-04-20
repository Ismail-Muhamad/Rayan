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
                    <article class="consumptions-page__stat-card">
                        <div class="consumptions-page__stat-icon">
                            <BaseIcon name="solar:waterdrops-outline" />
                        </div>
                        <div class="consumptions-page__stat-copy">
                            <p class="consumptions-page__stat-label">إجمالي مياه الري</p>
                            <h3 class="consumptions-page__stat-value">
                                {{ formatNumber(yearlyTotals.irrigationLiters) }}
                                <span>لتر</span>
                            </h3>
                        </div>
                    </article>

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
                                {{ formatNumber(yearlyTotals.fertilizationKg) }}
                                <span>كجم</span>
                            </h3>
                            <p class="consumptions-page__stat-hint">اضغط لعرض أنواع الأسمدة المستخدمة</p>
                        </div>
                        <div class="consumptions-page__stat-icon">
                            <BaseIcon name="solar:leaf-outline" />
                        </div>
                    </article>

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
                                {{ formatNumber(yearlyTotals.sprayingKg) }}
                                <span>كجم</span>
                            </h3>
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

                    <div v-if="fertilizationProducts.length" class="consumptions-page__details-list">
                        <div v-for="item in fertilizationProducts" :key="`fert-${item.name}`"
                            class="consumptions-page__details-item">
                            <div class="consumptions-page__details-item-copy">
                                <strong>{{ item.name }}</strong>
                                <span>إجمالي الاستخدام خلال السنة</span>
                            </div>
                            <div class="consumptions-page__details-item-value">
                                {{ formatNumber(item.total) }} كجم
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

                    <div v-if="sprayingProducts.length" class="consumptions-page__details-list">
                        <div v-for="item in sprayingProducts" :key="`spray-${item.name}`"
                            class="consumptions-page__details-item">
                            <div class="consumptions-page__details-item-copy">
                                <strong>{{ item.name }}</strong>
                                <span>إجمالي الاستخدام خلال السنة</span>
                            </div>
                            <div class="consumptions-page__details-item-value">
                                {{ formatNumber(item.total) }} كجم
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
                            <div class="consumptions-page__month-head">
                                <span class="consumptions-page__month-badge">{{ month.weeksCount }} أسبوع</span>
                                <h4 class="consumptions-page__month-title">{{ month.monthLabel }}</h4>
                            </div>

                            <div class="consumptions-page__month-metrics">
                                <div class="consumptions-page__metric">
                                    <span class="consumptions-page__metric-label">مياه الري</span>
                                    <strong class="consumptions-page__metric-value">
                                        {{ formatNumber(month.irrigationLiters) }} لتر
                                    </strong>
                                </div>

                                <button type="button"
                                    class="consumptions-page__metric consumptions-page__metric--clickable"
                                    @click="toggleMonthExpanded(month.monthKey, 'fertilization')">
                                    <span class="consumptions-page__metric-label">التسميد</span>
                                    <strong class="consumptions-page__metric-value">
                                        {{ formatNumber(month.fertilizationKg) }} كجم
                                    </strong>
                                    <small class="consumptions-page__metric-hint">اضغط لعرض التفاصيل</small>
                                </button>

                                <button type="button"
                                    class="consumptions-page__metric consumptions-page__metric--clickable"
                                    @click="toggleMonthExpanded(month.monthKey, 'spraying')">
                                    <span class="consumptions-page__metric-label">الرش</span>
                                    <strong class="consumptions-page__metric-value">
                                        {{ formatNumber(month.sprayingKg) }} كجم
                                    </strong>
                                    <small class="consumptions-page__metric-hint">اضغط لعرض التفاصيل</small>
                                </button>
                            </div>

                            <div class="consumptions-page__month-actions">
                                <button type="button" class="consumptions-page__download-button"
                                    @click="downloadMonthReport(month)">
                                    <BaseIcon name="solar:download-outline" />
                                    تحميل تقرير الشهر
                                </button>
                            </div>

                            <div v-if="monthExpandedMap[month.monthKey] === 'fertilization'"
                                class="consumptions-page__month-details">
                                <h5 class="consumptions-page__month-details-title">
                                    تفاصيل التسميد في {{ month.monthLabel }}
                                </h5>

                                <div v-if="month.fertilizationProducts.length" class="consumptions-page__details-list">
                                    <div v-for="item in month.fertilizationProducts"
                                        :key="`${month.monthKey}-fert-${item.name}`"
                                        class="consumptions-page__details-item">
                                        <div class="consumptions-page__details-item-copy">
                                            <strong>{{ item.name }}</strong>
                                            <span>إجمالي الاستخدام خلال الشهر</span>
                                        </div>
                                        <div class="consumptions-page__details-item-value">
                                            {{ formatNumber(item.total) }} كجم
                                        </div>
                                    </div>
                                </div>

                                <div v-else class="consumptions-page__details-empty">
                                    لا توجد أصناف تسميد في الشهر ده
                                </div>
                            </div>

                            <div v-if="monthExpandedMap[month.monthKey] === 'spraying'"
                                class="consumptions-page__month-details">
                                <h5 class="consumptions-page__month-details-title">
                                    تفاصيل الرش في {{ month.monthLabel }}
                                </h5>

                                <div v-if="month.sprayingProducts.length" class="consumptions-page__details-list">
                                    <div v-for="item in month.sprayingProducts"
                                        :key="`${month.monthKey}-spray-${item.name}`"
                                        class="consumptions-page__details-item">
                                        <div class="consumptions-page__details-item-copy">
                                            <strong>{{ item.name }}</strong>
                                            <span>إجمالي الاستخدام خلال الشهر</span>
                                        </div>
                                        <div class="consumptions-page__details-item-value">
                                            {{ formatNumber(item.total) }} كجم
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

const isPageLoading = computed(() => {
    return (
        usersUiFlags.value?.isFetchingList ||
        farmsUiFlags.value?.isFetchingList ||
        reportsUiFlags.value?.isFetchingList
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

            return !isAdmin;
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
    const years = (reportsRecords.value || [])
        .map((report) => {
            const date = reportDate(report);
            if (!date) return null;
            return new Date(date).getFullYear();
        })
        .filter(Boolean);

    return [...new Set(years)].sort((a, b) => b - a);
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
    const grouped = {};

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

    return Object.values(grouped)
        .map((item) => ({
            ...item,
            irrigationLiters: roundNumber(item.irrigationLiters),
            fertilizationKg: roundNumber(item.fertilizationKg),
            sprayingKg: roundNumber(item.sprayingKg),
            fertilizationProducts: mapToSortedArray(item.fertilizationProductsMap),
            sprayingProducts: mapToSortedArray(item.sprayingProductsMap),
        }))
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
        {
            irrigationLiters: 0,
            fertilizationKg: 0,
            sprayingKg: 0,
        }
    );
});

const fertilizationProducts = computed(() => {
    const map = {};
    for (const month of monthlyBreakdown.value) {
        for (const item of month.fertilizationProducts) {
            addToMap(map, item.name, item.total);
        }
    }
    return mapToSortedArray(map);
});

const sprayingProducts = computed(() => {
    const map = {};
    for (const month of monthlyBreakdown.value) {
        for (const item of month.sprayingProducts) {
            addToMap(map, item.name, item.total);
        }
    }
    return mapToSortedArray(map);
});

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
        return;
    }

    await fetchFarmReports(farmId);

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

    &__details-item-value {
        font-size: 16px;
        font-weight: 800;
        color: #2563eb;
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