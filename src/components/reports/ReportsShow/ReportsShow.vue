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
              <div class="report-show__filters-container">
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

                <!-- Year Filter Tabs -->
                <div v-if="availableYears.length > 0" class="report-show__filters-wrapper" style="margin-top: 12px;">
                  <div class="report-show__filters">
                    <button
                      type="button"
                      class="report-show__filter-btn"
                      :class="{ 'report-show__filter-btn--active': selectedYear === 'all' }"
                      @click="selectedYear = 'all'"
                    >
                      {{ "كل السنين" }}
                    </button>
                    <button
                      v-for="year in availableYears"
                      :key="year"
                      type="button"
                      class="report-show__filter-btn"
                      :class="{ 'report-show__filter-btn--active': selectedYear === year }"
                      @click="selectedYear = year"
                    >
                      <BaseIcon name="solar:calendar-date-outline" width="14" height="14" />
                      {{ year }}
                    </button>
                  </div>
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
                <BaseAccordion variant="splitted" selection-mode="multiple" :default-expanded-keys="currentMonthExpandedKeys">
                  <ReportAccordionItem
                    v-for="report in group.reports"
                    :key="report.id"
                    :report="report"
                    :weeks="mapWeeksReport(report)"
                    :title="formatReportTitle(report)"
                    :exporting-report-id="exportingReportId"
                    @action="({ report: r, action: a }) => handleReportAction(r, a)"
                    @edit-activity="(payload) => handleEditActivity(payload, report.id)"
                    @delete-activity="(payload) => handleDeleteActivity(payload, report.id)"
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

    <EditDayActivityModal
      ref="editDayActivityModalRef"
      :fertilizer-types="fertilizerTypesRecords"
      :pesticide-types="pesticideTypesRecords"
      @save="handleSaveActivity"
    />

    <DeleteFertilizationModal
      ref="deleteFertilizationModalRef"
      :fertilizer-types="fertilizerTypesRecords"
      @save="handleSaveActivity"
    />

    <DeleteActivityConfirmModal
      ref="deleteActivityConfirmModalRef"
      @confirm="handleConfirmDeleteActivity"
    />

    <AddDayModal
      ref="addDayModalRef"
      @save="onAddDaySave"
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
import { useTasksStore } from "@/stores/tasks.store";
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
import EditDayActivityModal from "../Modals/EditDayActivityModal.vue";
import DeleteFertilizationModal from "../Modals/DeleteFertilizationModal.vue";
import DeleteActivityConfirmModal from "../Modals/DeleteActivityConfirmModal.vue";
import AddDayModal from "../Modals/AddDayModal.vue";

const farmsStore = useFarmsStore();
const reportsStore = useReportsStore();
const tasksStore = useTasksStore();

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();

const exportingReportId = ref(null);
const deleteReportModalRef = ref(null);
const editDayActivityModalRef = ref(null);
const deleteFertilizationModalRef = ref(null);
const deleteActivityConfirmModalRef = ref(null);
const addDayModalRef = ref(null);
const fertilizerTypesRecords = ref([]);
const pesticideTypesRecords = ref([]);
const selectedPalmTypeId = ref("all");
const selectedYear = ref(new Date().getFullYear());

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
  const mapped = (reportsList.value || []).map((report) => {
    const startDate = report?.report_weeks?.[0]?.date;
    const dateObj = startDate && !Number.isNaN(new Date(startDate).getTime()) ? new Date(startDate) : null;

    return {
      ...report,
      month:
        dateObj
          ? new Intl.DateTimeFormat(locale.value, { month: "long" }).format(dateObj)
          : "-",
      year: dateObj ? dateObj.getFullYear() : null,
      dateObj: dateObj,
      farm_name: report?.farm?.name,
      palm_type_name: report?.palm_type?.name,
    };
  });

  return mapped.sort((a, b) => {
    const timeA = a.dateObj ? a.dateObj.getTime() : 0;
    const timeB = b.dateObj ? b.dateObj.getTime() : 0;
    return timeB - timeA; // Descending
  });
});

const availableYears = computed(() => {
  const years = new Set();
  mappedReportsList.value.forEach((r) => {
    if (r.year) years.add(r.year);
  });
  return Array.from(years).sort((a, b) => b - a);
});

const currentMonthExpandedKeys = computed(() => {
  const keys = [];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  mappedReportsList.value.forEach(report => {
    if (report.dateObj && report.dateObj.getMonth() === currentMonth && report.dateObj.getFullYear() === currentYear) {
      keys.push(String(report.id));
    }
  });
  return keys;
});

const filteredReports = computed(() => {
  let reports = mappedReportsList.value || [];
  if (selectedYear.value !== "all") {
    reports = reports.filter(r => String(r.year) === String(selectedYear.value));
  }
  return reports;
});

// Group reports by Palm Type ID
const reportsGroupedByPalmType = computed(() => {
  const groups = {};

  (filteredReports.value || []).forEach((report) => {
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
  const types = Array.isArray(fertilizerTypesRecords.value)
    ? fertilizerTypesRecords.value
    : fertilizerTypesRecords.value?.data || [];
    
  const typeId = fertilization?.fertilizer_type_id || fertilization?.type_of_fertilization;
  const matched = types.find((item) => String(item.id) === String(typeId) || item.name === typeId);

  return (
    matched?.name ||
    fertilization?.type_of_fertilization ||
    t("farms.form.no_quantity")
  );
};

const getPesticideTypeName = (day) => {
  const types = Array.isArray(pesticideTypesRecords.value)
    ? pesticideTypesRecords.value
    : pesticideTypesRecords.value?.data || [];
    
  const typeId = day?.pesticide_type_id || day?.spraying;
  const matched = types.find((item) => String(item.id) === String(typeId) || item.name === typeId);

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
            (f.fertilizer_type_id && String(f.fertilizer_type_id) !== "0") ||
            (f.type_of_fertilization && String(f.type_of_fertilization) !== "0"),
        );

        const hasIrrigation =
          (day.irrigation_amount_per_palm_tree &&
            String(day.irrigation_amount_per_palm_tree) !== "0") ||
          (day.duration_of_irrigation_per_palm_tree &&
            String(day.duration_of_irrigation_per_palm_tree) !== "0");

        const hasSpraying =
          (day.pesticide_type_id && String(day.pesticide_type_id) !== "0") ||
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
            fertilizations: (day.fertilizations || [])
              .filter((f) => (f.fertilizer_type_id && String(f.fertilizer_type_id) !== "0") || (f.type_of_fertilization && String(f.type_of_fertilization) !== "0"))
              .map((f) => {
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
    case "add-day":
      addDayModalRef.value.openModal(report.id, report.dateObj);
      break;
    default:
      break;
  }
};

const onAddDaySave = async (payload) => {
  const { reportId, date, activity, done, error } = payload;
  
  const report = reportsList.value.find((r) => r.id === reportId);
  if (!report) return done();

  let exists = false;
  for (const w of report.report_weeks) {
    if (w.days && w.days.some((d) => d.date === date)) {
      exists = true;
      break;
    }
  }
  
  if (exists) {
    error("هذا اليوم موجود مسبقاً في التقرير");
    return;
  }

  const newDay = {
    date: date,
    day: getDayNameFromDate(date),
    irrigation_amount_per_palm_tree: "0",
    duration_of_irrigation_per_palm_tree: "0",
    total_amount_of_irrigation: "0",
    spraying: "0",
    amount_of_spray: "0",
    fertilizations: [
      {
        type_of_fertilization: "0",
        fertilizer_quantity_per_palm_tree: "0"
      }
    ]
  };

  let weekIndex = 0;
  let dayIndex = 0;

  if (report.report_weeks.length > 0) {
    report.report_weeks[0].days.push(newDay);
    weekIndex = 0;
    dayIndex = report.report_weeks[0].days.length - 1;
  } else {
    report.report_weeks.push({
      week_number: 1,
      date: date,
      days: [newDay]
    });
    weekIndex = 0;
    dayIndex = 0;
  }

  // Close the AddDay modal
  done();

  // Give Vue a tick to process the close, then open EditDayActivityModal
  setTimeout(() => {
    editDayActivityModalRef.value?.openModal(
      reportId,
      weekIndex,
      dayIndex,
      newDay,
      activity
    );
  }, 100);
};

const handleEditActivity = (payload, reportId) => {
  const report = reportsList.value.find((r) => r.id === reportId);
  if (!report) return;

  const { dayDate, activityType } = payload;
  
  let foundWeekIndex = -1;
  let foundDayIndex = -1;
  let foundDayData = null;

  for (let w = 0; w < report.report_weeks.length; w++) {
    const week = report.report_weeks[w];
    for (let d = 0; d < week.days.length; d++) {
      if (week.days[d].date === dayDate) {
        foundWeekIndex = w;
        foundDayIndex = d;
        foundDayData = week.days[d];
        break;
      }
    }
    if (foundDayData) break;
  }

  if (foundDayData) {
    editDayActivityModalRef.value?.openModal(
      reportId, 
      foundWeekIndex, 
      foundDayIndex, 
      foundDayData, 
      activityType
    );
  }
};

const handleDeleteActivity = async (payload, reportId) => {
  const report = reportsList.value.find((r) => r.id === reportId);
  if (!report) return;

  const { dayDate, activityType } = payload;
  
  let foundWeekIndex = -1;
  let foundDayIndex = -1;
  let foundDayData = null;

  for (let w = 0; w < report.report_weeks.length; w++) {
    const week = report.report_weeks[w];
    for (let d = 0; d < week.days.length; d++) {
      if (week.days[d].date === dayDate) {
        foundWeekIndex = w;
        foundDayIndex = d;
        foundDayData = week.days[d];
        break;
      }
    }
    if (foundDayData) break;
  }

  if (!foundDayData) return;

  if (activityType === "fertilization") {
    deleteFertilizationModalRef.value?.openModal(
      reportId,
      foundWeekIndex,
      foundDayIndex,
      foundDayData
    );
  } else {
    // For irrigation and spraying, open the new confirm modal
    deleteActivityConfirmModalRef.value?.openModal(
      reportId,
      foundWeekIndex,
      foundDayIndex,
      foundDayData,
      activityType
    );
  }
};

const handleConfirmDeleteActivity = (payload) => {
  const { reportId, weekIndex, dayIndex, dayData, activityType, done } = payload;

  const updatedDay = JSON.parse(JSON.stringify(dayData));
  
  if (activityType === "irrigation") {
    updatedDay.irrigation_amount_per_palm_tree = "0";
    updatedDay.duration_of_irrigation_per_palm_tree = "0";
    updatedDay.total_amount_of_irrigation = "0";
  } else if (activityType === "spraying") {
    updatedDay.spraying = "0";
    updatedDay.amount_of_spray = "0";
    updatedDay.pesticide_type_id = null;
  }

  handleSaveActivity({
    reportId,
    weekIndex,
    dayIndex,
    updatedDay,
    done
  });
};

const handleSaveActivity = async (payload) => {
  const { reportId, weekIndex, dayIndex, updatedDay, done } = payload;
  
  const report = reportsList.value.find((r) => r.id === reportId);
  if (!report) {
    done();
    return;
  }

  const dateStr = report.report_weeks?.[0]?.days?.[0]?.date;
  let monthPayload = null;
  if (dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      monthPayload = { month: d.getMonth(), year: d.getFullYear() };
    }
  }

  // Build the payload
  const payloadToSave = {
    owner: report.owner_id || report.farm?.owner_id || null,
    farm_id: report.farm_id || report.farm?.id || null,
    palm_type_id: report.palm_type_id || report.palm_type?.id || null,
    month: monthPayload,
    review: report.review,
    recommendations: report.recommendations,
    report_weeks: JSON.parse(JSON.stringify(report.report_weeks)),
  };

  payloadToSave.report_weeks[weekIndex].days[dayIndex] = updatedDay;

  try {
    await reportsStore.updateRecord(reportId, payloadToSave);
    // Reset tasks cache so next visit to task pages fetches fresh data
    tasksStore.$reset();
    await fetchReportAndFarmInfo();
  } catch (error) {
    console.error("Failed to update day activity:", error);
  } finally {
    done();
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

  &__filters-container {
    display: flex;
    flex-direction: column;
    max-width: 100%;
    overflow: hidden; /* Ensure it doesn't cause page overflow */

    @media (max-width: 768px) {
      width: 100%;
    }
  }

  &__filters-wrapper {
    display: flex;
    max-width: 100%;
    width: 100%;
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