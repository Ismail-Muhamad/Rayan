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
          <div class="consumptions-page__years-head">
            <h3 class="consumptions-page__section-title">كل السنوات</h3>
            <p class="consumptions-page__section-subtitle">
              اختار السنة اللي عايز تعرض إجمالياتها
            </p>
          </div>

          <div class="consumptions-page__years-list">
            <button
              v-for="year in availableYears"
              :key="year"
              type="button"
              class="consumptions-page__year-chip"
              :class="{
                'consumptions-page__year-chip--active': selectedYear === year,
              }"
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
          <p class="consumptions-page__empty-text">
            اختر المزرعة لعرض الإجماليات
          </p>
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
          <section class="consumptions-page__stats">
            <article class="consumptions-page__stat-card">
              <div class="consumptions-page__stat-icon">
                <BaseIcon name="solar:waterdrops-outline" />
              </div>
              <div class="consumptions-page__stat-copy">
                <p class="consumptions-page__stat-label">إجمالي مياه الري</p>
                <h3 class="consumptions-page__stat-value">
                  {{ yearlyTotals.irrigationLiters.toLocaleString() }}
                  <span>لتر</span>
                </h3>
              </div>
            </article>

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
                  {{ yearlyTotals.fertilizationKg.toLocaleString() }}
                  <span>كجم</span>
                </h3>
                <p class="consumptions-page__stat-hint">
                  اضغط لعرض أنواع الأسمدة المستخدمة
                </p>
              </div>
              <div class="consumptions-page__stat-arrow">
                <BaseIcon
                  :name="
                    expandedCard === 'fertilization'
                      ? 'solar:alt-arrow-up-outline'
                      : 'solar:alt-arrow-down-outline'
                  "
                />
              </div>
            </article>

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
                  {{ yearlyTotals.sprayingKg.toLocaleString() }}
                  <span>كجم</span>
                </h3>
                <p class="consumptions-page__stat-hint">
                  اضغط لعرض الأصناف المستخدمة
                </p>
              </div>
              <div class="consumptions-page__stat-arrow">
                <BaseIcon
                  :name="
                    expandedCard === 'spraying'
                      ? 'solar:alt-arrow-up-outline'
                      : 'solar:alt-arrow-down-outline'
                  "
                />
              </div>
            </article>
          </section>

          <section
            v-if="expandedCard === 'fertilization'"
            class="consumptions-page__details-box"
          >
            <div class="consumptions-page__details-head">
              <h3 class="consumptions-page__section-title">
                تفاصيل الأسمدة المستخدمة
              </h3>
              <p class="consumptions-page__section-subtitle">
                إجمالي كل صنف تم استخدامه خلال سنة {{ selectedYear }}
              </p>
            </div>

            <div
              v-if="fertilizationProducts.length"
              class="consumptions-page__details-list"
            >
              <div
                v-for="item in fertilizationProducts"
                :key="`fert-${item.name}`"
                class="consumptions-page__details-item"
              >
                <div class="consumptions-page__details-item-copy">
                  <strong>{{ item.name }}</strong>
                  <span>إجمالي الاستخدام خلال السنة</span>
                </div>
                <div class="consumptions-page__details-item-value">
                  {{ item.total.toLocaleString() }} كجم
                </div>
              </div>
            </div>

            <div v-else class="consumptions-page__details-empty">
              لا توجد أصناف تسميد مسجلة في السنة دي
            </div>
          </section>

          <section
            v-if="expandedCard === 'spraying'"
            class="consumptions-page__details-box"
          >
            <div class="consumptions-page__details-head">
              <h3 class="consumptions-page__section-title">
                تفاصيل أصناف الرش المستخدمة
              </h3>
              <p class="consumptions-page__section-subtitle">
                إجمالي كل صنف تم استخدامه خلال سنة {{ selectedYear }}
              </p>
            </div>

            <div
              v-if="sprayingProducts.length"
              class="consumptions-page__details-list"
            >
              <div
                v-for="item in sprayingProducts"
                :key="`spray-${item.name}`"
                class="consumptions-page__details-item"
              >
                <div class="consumptions-page__details-item-copy">
                  <strong>{{ item.name }}</strong>
                  <span>إجمالي الاستخدام خلال السنة</span>
                </div>
                <div class="consumptions-page__details-item-value">
                  {{ item.total.toLocaleString() }} كجم
                </div>
              </div>
            </div>

            <div v-else class="consumptions-page__details-empty">
              لا توجد أصناف رش مسجلة في السنة دي
            </div>
          </section>

          <section class="consumptions-page__months">
            <div class="consumptions-page__months-head">
              <h3 class="consumptions-page__section-title">
                إجماليات سنة {{ selectedYear }}
              </h3>
              <p class="consumptions-page__section-subtitle">
                ملخص الاستهلاك الشهري للمزرعة المختارة
              </p>
            </div>

            <div class="consumptions-page__months-grid">
              <article
                v-for="month in monthlyBreakdown"
                :key="month.monthKey"
                class="consumptions-page__month-card"
              >
                <div class="consumptions-page__month-head">
                  <h4 class="consumptions-page__month-title">
                    {{ month.monthLabel }}
                  </h4>
                  <span class="consumptions-page__month-badge">
                    {{ month.weeksCount }} أسبوع
                  </span>
                </div>

                <div class="consumptions-page__month-metrics">
                  <div class="consumptions-page__metric">
                    <span class="consumptions-page__metric-label">مياه الري</span>
                    <strong class="consumptions-page__metric-value">
                      {{ month.irrigationLiters.toLocaleString() }} لتر
                    </strong>
                  </div>

                  <button
                    type="button"
                    class="consumptions-page__metric consumptions-page__metric--clickable"
                    @click="toggleMonthExpanded(month.monthKey, 'fertilization')"
                  >
                    <span class="consumptions-page__metric-label">التسميد</span>
                    <strong class="consumptions-page__metric-value">
                      {{ month.fertilizationKg.toLocaleString() }} كجم
                    </strong>
                    <small class="consumptions-page__metric-hint">
                      اضغط لعرض التفاصيل
                    </small>
                  </button>

                  <button
                    type="button"
                    class="consumptions-page__metric consumptions-page__metric--clickable"
                    @click="toggleMonthExpanded(month.monthKey, 'spraying')"
                  >
                    <span class="consumptions-page__metric-label">الرش</span>
                    <strong class="consumptions-page__metric-value">
                      {{ month.sprayingKg.toLocaleString() }} كجم
                    </strong>
                    <small class="consumptions-page__metric-hint">
                      اضغط لعرض التفاصيل
                    </small>
                  </button>
                </div>

                <div
                  v-if="monthExpandedMap[month.monthKey] === 'fertilization'"
                  class="consumptions-page__month-details"
                >
                  <h5 class="consumptions-page__month-details-title">
                    تفاصيل التسميد في {{ month.monthLabel }}
                  </h5>

                  <div
                    v-if="month.fertilizationProducts.length"
                    class="consumptions-page__details-list"
                  >
                    <div
                      v-for="item in month.fertilizationProducts"
                      :key="`${month.monthKey}-fert-${item.name}`"
                      class="consumptions-page__details-item"
                    >
                      <div class="consumptions-page__details-item-copy">
                        <strong>{{ item.name }}</strong>
                        <span>إجمالي الاستخدام خلال الشهر</span>
                      </div>
                      <div class="consumptions-page__details-item-value">
                        {{ item.total.toLocaleString() }} كجم
                      </div>
                    </div>
                  </div>

                  <div v-else class="consumptions-page__details-empty">
                    لا توجد أصناف تسميد في الشهر ده
                  </div>
                </div>

                <div
                  v-if="monthExpandedMap[month.monthKey] === 'spraying'"
                  class="consumptions-page__month-details"
                >
                  <h5 class="consumptions-page__month-details-title">
                    تفاصيل الرش في {{ month.monthLabel }}
                  </h5>

                  <div
                    v-if="month.sprayingProducts.length"
                    class="consumptions-page__details-list"
                  >
                    <div
                      v-for="item in month.sprayingProducts"
                      :key="`${month.monthKey}-spray-${item.name}`"
                      class="consumptions-page__details-item"
                    >
                      <div class="consumptions-page__details-item-copy">
                        <strong>{{ item.name }}</strong>
                        <span>إجمالي الاستخدام خلال الشهر</span>
                      </div>
                      <div class="consumptions-page__details-item-value">
                        {{ item.total.toLocaleString() }} كجم
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
import FertilizerTypesServices from "@/services/fertilizerTypes.services";
import PesticideTypesServices from "@/services/pesticideTypes.services";

const { locale } = useI18n();

const farmsStore = useFarmsStore();
const reportsStore = useReportsStore();

const { records: farmsRecords, uiFlags: farmsUiFlags } = storeToRefs(farmsStore);
const { records: reportsRecords, uiFlags: reportsUiFlags } =
  storeToRefs(reportsStore);

const selectedFarmId = ref("");
const selectedYear = ref("");
const expandedCard = ref("");
const monthExpandedMap = ref({});
const fertilizerTypesRecords = ref([]);
const pesticideTypesRecords = ref([]);

const isPageLoading = computed(() => {
  return (
    farmsUiFlags.value?.isFetchingList || reportsUiFlags.value?.isFetchingList
  );
});

const farmsOptions = computed(() => {
  return (farmsRecords.value || []).map((farm) => ({
    id: farm.id,
    name: farm.name,
  }));
});

const roundNumber = (value) => Number(Number(value || 0).toFixed(2));

const reportDate = (report) => {
  return report?.report_weeks?.[0]?.date || null;
};

const numberOfTreesFor = (report) => {
  return Number(
    report?.palm_type?.number_of_trees ||
      report?.farm?.palm_type?.number_of_trees ||
      report?.number_of_trees ||
      0
  );
};

const normalizeProductName = (value) => {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
};

const addToMap = (map, name, amount) => {
  const cleanName = normalizeProductName(name);
  const cleanAmount = Number(amount || 0);

  if (!cleanName || !cleanAmount) return;

  if (!map[cleanName]) {
    map[cleanName] = 0;
  }

  map[cleanName] += cleanAmount;
};

const mapToSortedArray = (map) => {
  return Object.entries(map)
    .map(([name, total]) => ({
      name,
      total: roundNumber(total),
    }))
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
      result.push({
        name,
        totalKg,
      });
    }
  }

  return result;
};

const extractSprayingEntries = (day, treesCount) => {
  const result = [];

  const name = getPesticideTypeName(day);

  const totalKg =
    (Number(day?.amount_of_spray || 0) * Number(treesCount || 0)) / 1000;

  if (name && totalKg > 0) {
    result.push({
      name,
      totalKg,
    });
  }

  const sprayingItems = Array.isArray(day?.spraying_items)
    ? day.spraying_items
    : [];

  for (const item of sprayingItems) {
    const itemName = getPesticideTypeName(day, item);

    const quantityPerPalm =
      Number(item?.quantity_per_palm_tree || 0) ||
      Number(item?.amount_per_palm_tree || 0) ||
      Number(item?.quantity || 0);

    const itemTotalKg = (quantityPerPalm * treesCount) / 1000;

    if (itemName && itemTotalKg > 0) {
      result.push({
        name: itemName,
        totalKg: itemTotalKg,
      });
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
        (
          String(fertilization?.type_of_fertilization || "").trim() !== "" &&
          String(fertilization?.type_of_fertilization || "") !== "0"
        ) ||
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
          addToMap(
            grouped[monthKey].fertilizationProductsMap,
            item.name,
            item.totalKg
          );
        }

        const sprayEntries = extractSprayingEntries(day, treesCount);
        for (const item of sprayEntries) {
          grouped[monthKey].sprayingKg += item.totalKg;
          addToMap(
            grouped[monthKey].sprayingProductsMap,
            item.name,
            item.totalKg
          );
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

const fetchFarms = async () => {
  await farmsStore.fetchRecords({
    page: 1,
    per_page: 1000,
  });
};

const fetchFarmReports = async (farmId) => {
  if (!farmId) return;

  await reportsStore.fetchRecords({
    farm_id: farmId,
  });
};

watch(selectedFarmId, async (farmId) => {
  selectedYear.value = "";
  expandedCard.value = "";
  monthExpandedMap.value = {};

  if (!farmId) return;

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
  }

  &__select:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
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
    font-weight: 700;
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
    font-weight: 700;
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
  }
}
</style>