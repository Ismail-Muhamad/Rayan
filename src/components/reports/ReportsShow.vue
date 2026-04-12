<template>
  <div class="farm">
    <BaseLoader
      v-if="farmsUiFlags.isFetchingItem || reportsUiFlags.isFetchingList"
    />
    <div v-else class="farm__content">
      <!-- Farm Info -->
      <div class="farm__info">
        <h2 class="farm__title">{{ t("farms.table.headers.farm_info") }}</h2>
        <div class="farm__grid">
          <BaseCard
            v-for="info in farmInfo"
            :key="info.key"
            :title="info.title"
            :value="info.value"
          />
        </div>
      </div>
      <!-- Palm Types Info -->
      <div class="farm__palm">
        <h2 class="farm__title">
          {{ t("farms.table.headers.palm_types") }}
        </h2>
        <div class="farm__table">
          <BaseTable
            :headers="PALM_TYPES_HEADERS"
            :items="palmTypesInfo"
            :showToolbar="false"
          />
        </div>
      </div>
      <!-- Reports -->
      <div v-if="mappedReportsList.length" class="farm__reports">
        <h2 class="farm__title">
          {{ t("farms.table.headers.reports") }}
        </h2>
        <BaseAccordion variant="splitted">
          <BaseAccordionItem
            v-for="report in mappedReportsList"
            :key="report.id"
          >
            <template #title>
              <div class="farm__report-title">
                <h2 class="farm__title farm__title--sm">
                  {{ formatReportTitle(report) }}
                </h2>
                <div class="farm__report-actions">
                  <BaseButton
                    dropdown
                    variant="soft"
                    color="gray"
                    size="icon-sm"
                    :dropdownItems="REPORT_ACTIONS"
                  >
                    <template #dropdown>
                      <div class="farm__report-actions">
                        <BaseButton
                          v-for="item in REPORT_ACTIONS"
                          :key="item.action"
                          variant="soft"
                          :color="item.color"
                          size="sm"
                          @click="handleReportAction(report, item.action)"
                        >
                          <BaseIcon v-if="item.icon" :name="item.icon" />
                          {{ item.text }}
                        </BaseButton>
                      </div>
                    </template>
                    <BaseIcon name="pepicons-pop:dots-y" />
                  </BaseButton>
                </div>
              </div>
            </template>
            <div class="farm__report">
              <!-- Review -->
              <div class="farm__review">
                <BaseStyledSection :label="t('farms.table.headers.review')">
                  <div v-html="report.review"></div>
                </BaseStyledSection>
              </div>
              <!-- Recommendations -->
              <div class="farm__recommendations">
                <BaseStyledSection
                  :label="t('farms.table.headers.recommendations')"
                >
                  <div v-html="report.recommendations"></div>
                </BaseStyledSection>
              </div>
              <!-- Weeks -->
              <div
                v-for="week in mapWeeksReport(report)"
                :key="week.id"
                class="farm__week"
              >
                <h2 class="farm__title farm__title--sm">
                  {{ t(`farms.form.options.week_number.${week.week_number}`) }}
                </h2>
                <BaseTable
                  :headers="REPORT_HEADERS"
                  :items="week.days"
                  :showToolbar="false"
                >
                  <template #type_of_fertilization="{ item }">
                    <div class="farm__cell-stack">
                      <span
                        v-for="(f, i) in item.fertilizations"
                        :key="i"
                        class="farm__cell-text"
                      >
                        {{ f.type_of_fertilization }}
                      </span>
                    </div>
                  </template>
                  <template #fertilizer_quantity_per_palm_tree="{ item }">
                    <div class="farm__cell-stack">
                      <span
                        v-for="(f, i) in item.fertilizations"
                        :key="i"
                        class="farm__cell-text"
                      >
                        {{ f.fertilizer_quantity_per_palm_tree }}
                      </span>
                    </div>
                  </template>
                  <template #fertilization_total="{ item }">
                    <div class="farm__cell-stack">
                      <span
                        v-for="(f, i) in item.fertilizations"
                        :key="i"
                        class="farm__cell-text"
                      >
                        {{ f.fertilization_total }}
                      </span>
                    </div>
                  </template>
                </BaseTable>
              </div>
            </div>
          </BaseAccordionItem>
        </BaseAccordion>
      </div>
    </div>
    <!-- MODALS -->
    <ReportsDeleteModal
      ref="deleteReportModalRef"
      @refetch="fetchReportAndFarmInfo"
    />
  </div>
</template>
<script setup>
// ===== IMPORTS =====
// Vue and Libraries
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useVuelidate } from "@vuelidate/core";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import moment from "moment";
// Stores
import { useFarmsStore } from "@/stores/farms.store";
import { useReportsStore } from "@/stores/reports.store";
// Composables
// Components
import ReportsDeleteModal from "./Modals/ReportsDeleteModal.vue";
// Constants
// Helpers
// Utils
import { exportReportToPDF } from "@/utils/exporters/reportPdfExporter.utils";
// ===== PROPS & EMITS =====
// ===== STORE INSTANCES =====
const farmsStore = useFarmsStore();
const reportsStore = useReportsStore();
// ===== COMPOSABLES =====
const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
// ===== CONSTANTS =====
const PALM_TYPES_HEADERS = [
  {
    text: t("farms.table.headers.palm_type"),
    value: "palm_type",
  },
  {
    text: t("farms.table.headers.palm_count"),
    value: "palm_count",
  },
  {
    text: t("farms.table.headers.palm_age"),
    value: "palm_age",
  },
];
const REPORT_HEADERS = [
  {
    text: t("farms.table.headers.day"),
    value: "day",
  },
  {
    text: t("farms.table.headers.date"),
    value: "date",
  },
  {
    text: t("farms.table.headers.type_of_fertilization"),
    value: "type_of_fertilization",
  },
  {
    text: t("farms.table.headers.fertilizer_quantity_per_palm_tree"),
    value: "fertilizer_quantity_per_palm_tree",
  },
  {
    text: t("farms.table.headers.fertilization_total"),
    value: "fertilization_total",
  },
  {
    text: t("farms.table.headers.irrigation_amount_per_palm_tree"),
    value: "irrigation_amount_per_palm_tree",
  },
  {
    text: t("farms.table.headers.duration_of_irrigation_per_palm_tree"),
    value: "duration_of_irrigation_per_palm_tree",
  },
  {
    text: t("farms.table.headers.total_amount_of_irrigation"),
    value: "total_amount_of_irrigation",
  },
  {
    text: t("farms.table.headers.total_duration_of_irrigation"),
    value: "total_duration_of_irrigation",
  },
  {
    text: t("farms.table.headers.spraying"),
    value: "spraying",
  },
  {
    text: t("farms.table.headers.spraying_per_tree"),
    value: "spraying_per_tree",
  },
  {
    text: t("farms.table.headers.amount_of_spray"),
    value: "amount_of_spray",
  },
];

const REPORT_ACTIONS = [
  {
    text: t("reports.actions.download"),
    icon: "solar:download-minimalistic-outline",
    color: "blue",
    action: "download",
  },
  {
    text: t("reports.actions.edit"),
    icon: "basil:edit-outline",
    color: "blue",
    action: "edit",
  },
  {
    text: t("reports.actions.delete"),
    icon: "solar:clipboard-remove-outline",
    color: "red",
    action: "delete",
  },
];
// ===== REACTIVE STATE & TEMPLATE REFS =====
const exportingReportId = ref(null);
const deleteReportModalRef = ref(null);
// ===== VALIDATION RULES =====
// ===== COMPUTED PROPERTIES =====
const currentRouteId = computed(() => route.params.id);
const { record: farmRecord, uiFlags: farmsUiFlags } = storeToRefs(farmsStore);
const { records: reportsList, uiFlags: reportsUiFlags } =
  storeToRefs(reportsStore);

const farmInfo = computed(() => {
  return [
    {
      key: "farm_name",
      title: t("farms.table.headers.farm_name"),
      value: farmRecord.value?.name,
    },
    {
      key: "location",
      title: t("farms.table.headers.location"),
      value: farmRecord.value?.location,
    },
  ];
});

const palmTypesInfo = computed(() => {
  return (farmRecord.value?.palm_types || []).flatMap((palmType) => {
    return {
      palm_type: palmType.name,
      palm_count: palmType.number_of_trees,
      palm_age: palmType.palm_age,
    };
  });
});
const mappedReportsList = computed(() => {
  return reportsList.value.map((report) => {
    const startDate = report?.report_weeks?.[0]?.date;
    return {
      ...report,
      month: new Intl.DateTimeFormat(locale, { month: "long" }).format(
        new Date(startDate),
      ),
      farm_name: report?.farm?.name,
      palm_type_name: report?.palm_type?.name,
    };
  });
});
// ===== LIFECYCLE HOOKS =====
onMounted(async () => {
  await fetchReportAndFarmInfo();
});
// ===== METHODS =====
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
  if (hours && minutes)
    return `${hours} ${t("farms.form.options.units.hour")} ${minutes} ${t("farms.form.options.units.minute")}`;
  if (hours) return `${hours} ${t("farms.form.options.units.hour")}`;
  return `${minutes} ${t("farms.form.options.units.minute")}`;
};
const mapWeeksReport = (report) => {
  const weeks = (report?.report_weeks || [])
    .map((week) => {
      const validDays = (week.days || []).filter((day) => {
        const hasFertilization = (day.fertilizations || []).some(
          (f) =>
            (f.type_of_fertilization &&
              String(f.type_of_fertilization) !== "0") ||
            (f.fertilizer_quantity_per_palm_tree &&
              String(f.fertilizer_quantity_per_palm_tree) !== "0"),
        );
        const hasIrrigation =
          (day.irrigation_amount_per_palm_tree &&
            String(day.irrigation_amount_per_palm_tree) !== "0") ||
          (day.duration_of_irrigation_per_palm_tree &&
            String(day.duration_of_irrigation_per_palm_tree) !== "0");
        const hasSpraying =
          (day.spraying && String(day.spraying) !== "0") ||
          (day.amount_of_spray && String(day.amount_of_spray) !== "0");

        return hasFertilization || hasIrrigation || hasSpraying;
      });

      return {
        ...week,
        days: validDays.map((day) => {
          return {
            ...day,
            // Fertilization
            fertilizations: day.fertilizations.map((f) => {
              return {
                ...f,
                type_of_fertilization:
                  f.type_of_fertilization &&
                  String(f.type_of_fertilization) !== "0"
                    ? f.type_of_fertilization
                    : t("farms.form.no_quantity"),
                fertilization_total:
                  f.fertilizer_quantity_per_palm_tree &&
                  String(f.fertilizer_quantity_per_palm_tree) !== "0"
                    ? `${
                        (f.fertilizer_quantity_per_palm_tree *
                          numberOfTreesFor(report)) /
                        1000
                      } ${t("farms.form.options.units.kg")}`
                    : t("farms.form.no_quantity"),
                fertilizer_quantity_per_palm_tree:
                  f.fertilizer_quantity_per_palm_tree &&
                  String(f.fertilizer_quantity_per_palm_tree) !== "0"
                    ? `${f.fertilizer_quantity_per_palm_tree} ${t("farms.form.options.units.gram")}`
                    : t("farms.form.no_quantity"),
              };
            }),
            // Irrigation
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
            // Spraying
            spraying:
              !day.spraying || String(day.spraying) === "0"
                ? t("farms.form.no_quantity")
                : day.spraying,
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

  const month = new Intl.DateTimeFormat(locale, {
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
  }
};
// ===== WATCHERS =====
// ===== EXPOSE PUBLIC METHODS =====
</script>
<style lang="scss" scoped>
.farm {
  &__report-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__title {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--gray-900);
    &--sm {
      font-size: 1.4rem;
    }
  }
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
  }
  &__grid,
  &__table {
    margin-block-end: 24px;
  }
  &__cell-stack {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  &__cell-text {
    white-space: nowrap;
  }
  &__report {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding-block-start: 24px;
  }
  &__report-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: flex-end;
  }
  &__info,
  &__palm,
  &__reports {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  &__week {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}
:deep(ul) {
  display: block;
  list-style-type: disc;
  margin-block-start: 1em;
  margin-block-end: 1em;
  padding-inline-start: 40px;
  unicode-bidi: isolate;
}
:deep(ol) {
  display: block;
  list-style-type: decimal;
  margin-block-start: 1em;
  margin-block-end: 1em;
  padding-inline-start: 40px;
  unicode-bidi: isolate;
}
</style>
