<template>
  <div class="report-show">
    <BaseLoader
      v-if="farmsUiFlags.isFetchingItem || reportsUiFlags.isFetchingList"
    />

    <div v-else class="report-show__content">
      <!-- Top Hero Section -->
      <ReportsShowHero
        :farm-record="farmRecord"
        :palm-types-count="palmTypesInfo.length"
        :reports-count="mappedReportsList.length"
      />

      <!-- Dual-Column Dashboard Layout -->
      <div class="report-show__layout">
        <!-- Sidebar Column (340px fixed on desktop) -->
        <aside class="report-show__sidebar">
          <FarmInfoGrid :farm-record="farmRecord" />
          <PalmTypesList :palm-types-info="palmTypesInfo" />
        </aside>

        <!-- Main Column (Flexible) -->
        <main class="report-show__main">
          <section class="report-show__section">
            <!-- Section Header with Filters -->
            <div class="report-show__section-head">
              <div class="report-show__section-title-wrapper">
                <div class="report-show__section-title-icon">
                  <BaseIcon name="solar:document-text-outline" width="22" height="22" />
                </div>
                <h2 class="report-show__section-title">
                  {{ t("farms.table.headers.reports") }}
                </h2>
              </div>

              <!-- Filter tabs with horizontal scroll -->
              <div class="report-show__filters-wrapper">
                <div class="report-show__filters">
                  <button
                    type="button"
                    class="report-show__filter-btn"
                    :class="{ 'report-show__filter-btn--active': selectedPalmTypeId === 'all' }"
                    @click="selectedPalmTypeId = 'all'"
                  >
                    {{ "الكل" }}
                  </button>
                  <button
                    v-for="type in palmTypesInfo"
                    :key="type.id"
                    type="button"
                    class="report-show__filter-btn"
                    :class="{ 'report-show__filter-btn--active': selectedPalmTypeId === type.id }"
                    @click="selectedPalmTypeId = type.id"
                  >
                    <BaseIcon name="solar:leaf-linear" width="14" height="14" />
                    {{ type.palm_type }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Grouped Reports Accordions -->
            <div v-if="filteredGroups.length" class="report-show__groups">
              <div
                v-for="group in filteredGroups"
                :key="group.palm_type_id"
                class="report-show__group"
              >
                <!-- Group Header Details -->
                <div class="report-show__group-head">
                  <div class="report-show__group-title-wrapper">
                    <div class="report-show__group-title-icon">
                      <BaseIcon name="solar:leaf-linear" width="18" height="18" />
                    </div>
                    <h3 class="report-show__group-title">
                      {{ group.palm_type_name }}
                    </h3>
                  </div>
                  <span class="report-show__group-badge">
                    {{ group.reports.length }}
                    {{ t("farms.table.headers.reports") }}
                  </span>
                </div>

                <!-- Accordion for Reports in this group -->
                <BaseAccordion variant="splitted">
                  <ReportAccordionItem
                    v-for="report in group.reports"
                    :key="report.id"
                    :report="report"
                    :weeks="mapWeeksReport(report)"
                    :title="formatReportTitle(report)"
                    :exporting-report-id="exportingReportId"
                    @action="({ report: r, action: a }) => handleReportAction(r, a)"
                  />
                </BaseAccordion>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="report-show__empty">
              <BaseIcon name="solar:document-add-outline" width="48" height="48" class="report-show__empty-icon" />
              <p class="report-show__empty-text">لا توجد تقارير مرتبطة بهذه المزرعة حالياً</p>
            </div>
          </section>
        </main>
      </div>
    </div>

    <ReportsDeleteModal
      ref="deleteReportModalRef"
      @refetch="fetchReportAndFarmInfo"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import moment from "moment";

// Stores & Modals
import { useFarmsStore } from "@/stores/farms.store";
import { useReportsStore } from "@/stores/reports.store";
import ReportsDeleteModal from "../Modals/ReportsDeleteModal.vue";

// Utilities & Services
import { exportReportToPDF } from "@/utils/exporters/reportPdfExporter.utils";
import FertilizerTypesServices from "@/services/fertilizerTypes.services";
import PesticideTypesServices from "@/services/pesticideTypes.services";

// Subcomponents
import ReportsShowHero from "./components/ReportsShowHero.vue";
import FarmInfoGrid from "./components/FarmInfoGrid.vue";
import PalmTypesList from "./components/PalmTypesList.vue";
import ReportAccordionItem from "./components/ReportAccordionItem.vue";
import BaseIcon from "@/components/shared/BaseIcon.vue";

const farmsStore = useFarmsStore();
const reportsStore = useReportsStore();

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();

const exportingReportId = ref(null);
const deleteReportModalRef = ref(null);
const fertilizerTypesRecords = ref([]);
const pesticideTypesRecords = ref([]);
const selectedPalmTypeId = ref("all");

const currentRouteId = computed(() => route.params.id);

const { record: farmRecord, uiFlags: farmsUiFlags } = storeToRefs(farmsStore);
const { records: reportsList, uiFlags: reportsUiFlags } = storeToRefs(reportsStore);

const palmTypesInfo = computed(() => {
  return (farmRecord.value?.palm_types || []).flatMap((palmType) => {
    return {
      id: palmType.id,
      palm_type: palmType.name,
      palm_count: palmType.number_of_trees,
      palm_age: palmType.palm_age,
    };
  });
});

const mappedReportsList = computed(() => {
  return (reportsList.value || []).map((report) => {
    const startDate = report?.report_weeks?.[0]?.date;

    return {
      ...report,
      month:
        startDate && !Number.isNaN(new Date(startDate).getTime())
          ? new Intl.DateTimeFormat(locale.value, { month: "long" }).format(
              new Date(startDate),
            )
          : "-",
      farm_name: report?.farm?.name,
      palm_type_name: report?.palm_type?.name,
    };
  });
});

// Group reports by Palm Type ID
const reportsGroupedByPalmType = computed(() => {
  const groups = {};

  (mappedReportsList.value || []).forEach((report) => {
    const typeId = report.palm_type?.id || "unknown";
    const typeName = report.palm_type?.name || t("farms.table.headers.palm_type");

    if (!groups[typeId]) {
      groups[typeId] = {
        palm_type_id: typeId,
        palm_type_name: typeName,
        reports: [],
      };
    }

    groups[typeId].reports.push(report);
  });

  return Object.values(groups);
});

// Filter groups based on selected tab
const filteredGroups = computed(() => {
  if (selectedPalmTypeId.value === "all") {
    return reportsGroupedByPalmType.value;
  }
  return reportsGroupedByPalmType.value.filter(
    (group) => String(group.palm_type_id) === String(selectedPalmTypeId.value)
  );
});

const getFertilizerTypeName = (fertilization) => {
  const matched = (fertilizerTypesRecords.value || []).find(
    (item) => item.id === fertilization?.fertilizer_type_id,
  );

  return (
    matched?.name ||
    fertilization?.type_of_fertilization ||
    t("farms.form.no_quantity")
  );
};

const getPesticideTypeName = (day) => {
  const matched = (pesticideTypesRecords.value || []).find(
    (item) => item.id === day?.pesticide_type_id,
  );

  return matched?.name || day?.spraying || t("farms.form.no_quantity");
};

onMounted(async () => {
  await Promise.all([fetchReportAndFarmInfo(), fetchTypesLookups()]);
});

const fetchTypesLookups = async () => {
  const [fertilizerTypesResponse, pesticideTypesResponse] = await Promise.all([
    FertilizerTypesServices.get(),
    PesticideTypesServices.get(),
  ]);

  fertilizerTypesRecords.value = fertilizerTypesResponse?.data || [];
  pesticideTypesRecords.value = pesticideTypesResponse?.data || [];
};

const fetchReportAndFarmInfo = async () => {
  await farmsStore.fetchRecord(currentRouteId.value);
  await reportsStore.fetchRecords({
    farm_id: currentRouteId.value,
  });
};

const formatDuration = (totalMinutes) => {
  const dur = moment.duration(totalMinutes, "minutes");
  const hours = Math.floor(dur.asHours());
  const minutes = dur.minutes();

  if (hours && minutes) {
    return `${hours} ${t("farms.form.options.units.hour")} ${minutes} ${t("farms.form.options.units.minute")}`;
  }

  if (hours) {
    return `${hours} ${t("farms.form.options.units.hour")}`;
  }

  return `${minutes} ${t("farms.form.options.units.minute")}`;
};

const getDayNameFromDate = (dateStr) => {
  const date = parseLocalDate(dateStr);
  const dayIndex = date.getDay();
  return t(`reports.form.options.days.${dayIndex}`);
};

const mapWeeksReport = (report) => {
  const weeks = (report?.report_weeks || [])
    .map((week) => {
      const validDays = (week.days || []).filter((day) => {
        const hasFertilization = (day.fertilizations || []).some(
          (f) =>
            (f.fertilizer_type_id || f.type_of_fertilization) &&
            String(f.type_of_fertilization) !== "0",
        );

        const hasIrrigation =
          (day.irrigation_amount_per_palm_tree &&
            String(day.irrigation_amount_per_palm_tree) !== "0") ||
          (day.duration_of_irrigation_per_palm_tree &&
            String(day.duration_of_irrigation_per_palm_tree) !== "0");

        const hasSpraying =
          day.pesticide_type_id ||
          (day.spraying && String(day.spraying) !== "0") ||
          (day.amount_of_spray && String(day.amount_of_spray) !== "0");

        return hasFertilization || hasIrrigation || hasSpraying;
      });

      return {
        ...week,
        days: validDays.map((day) => {
          return {
            ...day,
            day: getDayNameFromDate(day.date),
            fertilizations: (day.fertilizations || []).map((f) => {
              return {
                ...f,
                type_of_fertilization:
                  f.fertilizer_type_id || f.type_of_fertilization
                    ? getFertilizerTypeName(f)
                    : t("farms.form.no_quantity"),
                fertilization_total:
                  f.fertilizer_quantity_per_palm_tree &&
                  String(f.fertilizer_quantity_per_palm_tree) !== "0"
                    ? `${(
                        (f.fertilizer_quantity_per_palm_tree *
                          numberOfTreesFor(report)) /
                        1000
                      )} ${t("farms.form.options.units.kg")}`
                    : t("farms.form.no_quantity"),
                fertilizer_quantity_per_palm_tree:
                  f.fertilizer_quantity_per_palm_tree &&
                  String(f.fertilizer_quantity_per_palm_tree) !== "0"
                    ? `${f.fertilizer_quantity_per_palm_tree} ${t("farms.form.options.units.gram")}`
                    : t("farms.form.no_quantity"),
              };
            }),
            irrigation_amount_per_palm_tree:
              !day.irrigation_amount_per_palm_tree ||
              String(day.irrigation_amount_per_palm_tree) === "0"
                ? t("farms.form.no_quantity")
                : `${day.irrigation_amount_per_palm_tree} ${t("farms.form.options.units.liter")}`,
            duration_of_irrigation_per_palm_tree:
              !day.duration_of_irrigation_per_palm_tree ||
              String(day.duration_of_irrigation_per_palm_tree) === "0"
                ? t("farms.form.no_quantity")
                : `${day.duration_of_irrigation_per_palm_tree} ${t("farms.form.options.units.minute")}`,
            total_amount_of_irrigation:
              !day.irrigation_amount_per_palm_tree ||
              String(day.irrigation_amount_per_palm_tree) === "0"
                ? t("farms.form.no_quantity")
                : `${day.irrigation_amount_per_palm_tree * numberOfTreesFor(report)} ${t("farms.form.options.units.liter")}`,
            total_duration_of_irrigation:
              !day.duration_of_irrigation_per_palm_tree ||
              String(day.duration_of_irrigation_per_palm_tree) === "0"
                ? t("farms.form.no_quantity")
                : formatDuration(
                    day.duration_of_irrigation_per_palm_tree *
                      numberOfTreesFor(report),
                  ),
            spraying:
              !day.pesticide_type_id &&
              (!day.spraying || String(day.spraying) === "0")
                ? t("farms.form.no_quantity")
                : getPesticideTypeName(day),
            spraying_per_tree:
              !day.amount_of_spray || String(day.amount_of_spray) === "0"
                ? t("farms.form.no_quantity")
                : `${day.amount_of_spray} ${t("farms.form.options.units.gram")}`,
            amount_of_spray:
              !day.amount_of_spray || String(day.amount_of_spray) === "0"
                ? t("farms.form.no_quantity")
                : `${(day.amount_of_spray * numberOfTreesFor(report)) / 1000} ${t("farms.form.options.units.kg")}`,
          };
        }),
      };
    })
    .filter((week) => week.days.length > 0);

  return weeks;
};

const numberOfTreesFor = (report) => {
  return report?.palm_type?.number_of_trees || 0;
};

const parseLocalDate = (dateStr) => {
  const [year, month, day] = dateStr.split("-");
  return new Date(year, month - 1, day);
};

const formatReportTitle = (report) => {
  const firstWeek = report?.report_weeks?.[0];
  const date = firstWeek ? parseLocalDate(firstWeek.date) : new Date();

  const month = new Intl.DateTimeFormat(locale.value, {
    month: "long",
  }).format(date);

  return `${report?.farm?.name} - ${report?.palm_type?.name} - ${t("farms.table.headers.month")} ${month}`;
};

const handleDownloadReport = async (report) => {
  try {
    exportingReportId.value = report.id;

    await exportReportToPDF({
      report,
      farmRecord: farmRecord.value,
      t,
      mapWeeksReport,
      numberOfTreesFor,
      formatReportTitle,
    });
  } catch (error) {
    console.error("Failed to export report PDF:", error);
  } finally {
    exportingReportId.value = null;
  }
};

const handleReportAction = (report, action) => {
  switch (action) {
    case "download":
      handleDownloadReport(report);
      break;
    case "edit":
      router.push({ name: "edit_report", params: { id: report.id } });
      break;
    case "delete":
      deleteReportModalRef.value.openModal(report);
      break;
    default:
      break;
  }
};
</script>

<style lang="scss" scoped>
.report-show {
  min-height: 100%;
  padding: 4px;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 28%),
    linear-gradient(180deg, #f8fbff 0%, #f4f8ff 100%);

  &__content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__layout {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 24px;
    align-items: start;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }

  &__sidebar {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
  }

  &__section {
    padding: 24px;
    border-radius: 24px;
    border: 1px solid var(--blue-100);
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 14px 34px rgba(15, 23, 42, 0.05);
  }

  &__section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 14px;
    }
  }

  &__section-title-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__section-title-icon {
    display: grid;
    place-items: center;
    color: var(--blue-600);
    background: rgba(59, 130, 246, 0.08);
    width: 38px;
    height: 38px;
    border-radius: 10px;
  }

  &__section-title {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--blue-800);
  }

  &__filters-wrapper {
    display: flex;
    overflow: hidden;
    max-width: 100%;
    
    @media (max-width: 768px) {
      width: 100%;
    }
  }

  &__filters {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 4px 0;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__filter-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 99px;
    font-size: 1.15rem;
    font-weight: 700;
    white-space: nowrap;
    border: 1px solid #eef2f6;
    background: #ffffff;
    color: var(--slate-700);
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.02);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background: #f8fbff;
      border-color: var(--blue-200);
      color: var(--blue-600);
    }

    &--active {
      background: #5c1313; // Premium maroon color from user request!
      border-color: #5c1313;
      color: #ffffff !important;
      box-shadow: 0 4px 12px rgba(92, 19, 19, 0.2);

      &:hover {
        background: #4a1010;
        border-color: #4a1010;
      }
    }
  }

  &__groups {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  &__group {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px;
    border-radius: 22px;
    background: #fcfdfe;
    border: 1px dashed rgba(59, 130, 246, 0.18);
    box-shadow: inset 0 2px 8px rgba(59, 130, 246, 0.01);
  }

  &__group-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  &__group-title-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__group-title-icon {
    display: grid;
    place-items: center;
    color: #10b981;
    background: rgba(16, 185, 129, 0.08);
    width: 34px;
    height: 34px;
    border-radius: 8px;
  }

  &__group-title {
    margin: 0;
    font-size: 1.45rem;
    font-weight: 800;
    color: var(--blue-800);
  }

  &__group-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 99px;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--blue-700);
    background: rgba(59, 130, 246, 0.08);
    border: 1px solid rgba(59, 130, 246, 0.12);
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 48px 24px;
    border-radius: 20px;
    border: 1px dashed var(--blue-200);
    background: #f8fbff;
    text-align: center;
  }

  &__empty-icon {
    color: var(--blue-400);
  }

  &__empty-text {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--blue-700);
  }
}

@media (max-width: 576px) {
  .report-show {
    &__section {
      padding: 16px;
      border-radius: 20px;
    }

    &__group {
      padding: 16px;
      border-radius: 18px;
    }
  }
}
</style>