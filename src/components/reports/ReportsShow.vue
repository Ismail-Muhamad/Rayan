<template>
  <div class="report-show">
    <BaseLoader
      v-if="farmsUiFlags.isFetchingItem || reportsUiFlags.isFetchingList"
    />

    <div v-else class="report-show__content">
      <section class="report-show__hero">
        <div class="report-show__hero-main">
          <div class="report-show__avatar">
            {{ getInitials(farmRecord?.name) }}
          </div>

          <div class="report-show__hero-text">
            <p class="report-show__eyebrow">
              {{ t("farms.table.headers.farm_info") }}
            </p>

            <h1 class="report-show__hero-title">
              {{ farmRecord?.name || "-" }}
            </h1>

            <div class="report-show__hero-meta">
              <span class="report-show__meta-chip">
                {{ farmRecord?.location || "-" }}
              </span>

              <span class="report-show__meta-chip report-show__meta-chip--light">
                {{ palmTypesInfo.length }}
                {{ t("farms.table.headers.palm_types") }}
              </span>
            </div>
          </div>
        </div>

        <div class="report-show__hero-side">
          <div class="report-show__stat-card">
            <span class="report-show__stat-label">
              {{ t("farms.table.headers.reports") }}
            </span>
            <strong class="report-show__stat-value">
              {{ mappedReportsList.length }}
            </strong>
          </div>
        </div>
      </section>

      <section class="report-show__section">
        <div class="report-show__section-head">
          <h2 class="report-show__section-title">
            {{ t("farms.table.headers.farm_info") }}
          </h2>
        </div>

        <div class="report-show__grid">
          <div
            v-for="info in farmInfo"
            :key="info.key"
            class="report-show__info-card"
          >
            <span class="report-show__info-label">{{ info.title }}</span>
            <strong class="report-show__info-value">
              {{ info.value || "-" }}
            </strong>
          </div>
        </div>
      </section>

      <section class="report-show__section">
        <div class="report-show__section-head">
          <h2 class="report-show__section-title">
            {{ t("farms.table.headers.palm_types") }}
          </h2>
        </div>

        <div class="report-show__table-shell">
          <BaseTable
            :headers="PALM_TYPES_HEADERS"
            :items="palmTypesInfo"
            :showToolbar="false"
          />
        </div>
      </section>

      <section v-if="mappedReportsList.length" class="report-show__section">
        <div class="report-show__section-head">
          <h2 class="report-show__section-title">
            {{ t("farms.table.headers.reports") }}
          </h2>
        </div>

        <BaseAccordion variant="splitted">
          <BaseAccordionItem
            v-for="report in mappedReportsList"
            :key="report.id"
          >
            <template #title>
              <div class="report-show__report-title">
                <div>
                  <h2 class="report-show__report-heading">
                    {{ formatReportTitle(report) }}
                  </h2>
                  <p class="report-show__report-subtitle">
                    {{ report.palm_type_name || "-" }}
                  </p>
                </div>

                <div class="report-show__report-actions">
                  <BaseButton
                    dropdown
                    variant="soft"
                    color="gray"
                    size="icon-sm"
                    :dropdownItems="REPORT_ACTIONS"
                  >
                    <template #dropdown>
                      <div class="report-show__report-actions-menu">
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

            <div class="report-show__report-body">
              <div class="report-show__rich-card">
                <BaseStyledSection :label="t('farms.table.headers.review')">
                  <div v-html="report.review"></div>
                </BaseStyledSection>
              </div>

              <div class="report-show__rich-card">
                <BaseStyledSection
                  :label="t('farms.table.headers.recommendations')"
                >
                  <div v-html="report.recommendations"></div>
                </BaseStyledSection>
              </div>

              <div
                v-for="week in mapWeeksReport(report)"
                :key="week.id"
                class="report-show__week-card"
              >
                <h2 class="report-show__week-title">
                  {{ t(`farms.form.options.week_number.${week.week_number}`) }}
                </h2>

                <div class="report-show__table-shell report-show__table-shell--inner">
                  <BaseTable
                    :headers="REPORT_HEADERS"
                    :items="week.days"
                    :showToolbar="false"
                  >
                    <template #type_of_fertilization="{ item }">
                      <div class="report-show__cell-stack">
                        <span
                          v-for="(f, i) in item.fertilizations"
                          :key="i"
                          class="report-show__cell-text"
                        >
                          {{ f.type_of_fertilization }}
                        </span>
                      </div>
                    </template>

                    <template #fertilizer_quantity_per_palm_tree="{ item }">
                      <div class="report-show__cell-stack">
                        <span
                          v-for="(f, i) in item.fertilizations"
                          :key="i"
                          class="report-show__cell-text"
                        >
                          {{ f.fertilizer_quantity_per_palm_tree }}
                        </span>
                      </div>
                    </template>

                    <template #fertilization_total="{ item }">
                      <div class="report-show__cell-stack">
                        <span
                          v-for="(f, i) in item.fertilizations"
                          :key="i"
                          class="report-show__cell-text"
                        >
                          {{ f.fertilization_total }}
                        </span>
                      </div>
                    </template>
                  </BaseTable>
                </div>
              </div>
            </div>
          </BaseAccordionItem>
        </BaseAccordion>
      </section>

      <section v-else class="report-show__section">
        <div class="report-show__empty">
          لا توجد تقارير مرتبطة بهذه المزرعة حالياً
        </div>
      </section>
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

import { useFarmsStore } from "@/stores/farms.store";
import { useReportsStore } from "@/stores/reports.store";
import ReportsDeleteModal from "./Modals/ReportsDeleteModal.vue";
import { exportReportToPDF } from "@/utils/exporters/reportPdfExporter.utils";
import FertilizerTypesServices from "@/services/fertilizerTypes.services";
import PesticideTypesServices from "@/services/pesticideTypes.services";

const farmsStore = useFarmsStore();
const reportsStore = useReportsStore();

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();

const PALM_TYPES_HEADERS = computed(() => [
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
]);

const REPORT_HEADERS = computed(() => [
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
]);

const REPORT_ACTIONS = computed(() => [
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
]);

const exportingReportId = ref(null);
const deleteReportModalRef = ref(null);
const fertilizerTypesRecords = ref([]);
const pesticideTypesRecords = ref([]);

const currentRouteId = computed(() => route.params.id);

const { record: farmRecord, uiFlags: farmsUiFlags } = storeToRefs(farmsStore);
const { records: reportsList, uiFlags: reportsUiFlags } =
  storeToRefs(reportsStore);

const farmInfo = computed(() => [
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
]);

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

const getInitials = (name) => {
  if (!name) return "?";

  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
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
    gap: 18px;
  }

  &__hero {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 24px;
    border-radius: 24px;
    border: 1px solid rgba(59, 130, 246, 0.14);
    background: linear-gradient(135deg, var(--blue-700) 0%, var(--blue-500) 100%);
    box-shadow: 0 18px 40px rgba(37, 99, 235, 0.16);

    &::before {
      content: "";
      position: absolute;
      top: -70px;
      right: -70px;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
    }

    &::after {
      content: "";
      position: absolute;
      bottom: -80px;
      left: -50px;
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
    }
  }

  &__hero-main,
  &__hero-side {
    position: relative;
    z-index: 1;
  }

  &__hero-main {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__avatar {
    width: 72px;
    height: 72px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: var(--white);
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.1) 100%);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  &__eyebrow {
    margin: 0 0 8px;
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.78);
  }

  &__hero-title {
    margin: 0 0 10px;
    font-size: clamp(2rem, 2.6vw, 3rem);
    line-height: 1.25;
    font-weight: 800;
    color: var(--white);
  }

  &__hero-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__meta-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 36px;
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--white);
    background: rgba(255, 255, 255, 0.14);
    border: 1px solid rgba(255, 255, 255, 0.16);

    &--light {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  &__stat-card {
    min-width: 180px;
    padding: 18px 20px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(10px);
  }

  &__stat-label {
    display: block;
    margin-bottom: 8px;
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
  }

  &__stat-value {
    display: block;
    font-size: 2.3rem;
    font-weight: 800;
    color: var(--white);
  }

  &__section {
    padding: 18px;
    border-radius: 24px;
    border: 1px solid var(--blue-100);
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
  }

  &__section-head {
    margin-bottom: 16px;
  }

  &__section-title {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--blue-800);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }

  &__info-card {
    padding: 18px;
    border-radius: 20px;
    border: 1px solid var(--blue-100);
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
  }

  &__info-label {
    display: block;
    margin-bottom: 8px;
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--blue-600);
  }

  &__info-value {
    display: block;
    font-size: 1.45rem;
    line-height: 1.7;
    color: var(--slate-900);
    word-break: break-word;
  }

  &__table-shell {
    padding: 10px;
    border-radius: 18px;
    border: 1px solid var(--blue-100);
    background: #ffffff;
    overflow: hidden;

    &--inner {
      margin-top: 8px;
    }
  }

  &__report-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
  }

  &__report-heading {
    margin: 0 0 6px;
    font-size: 1.45rem;
    font-weight: 800;
    color: var(--blue-800);
  }

  &__report-subtitle {
    margin: 0;
    font-size: 1.15rem;
    color: var(--slate-600);
  }

  &__report-actions-menu {
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: flex-end;
  }

  &__report-body {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding-top: 18px;
  }

  &__rich-card,
  &__week-card {
    padding: 18px;
    border-radius: 20px;
    border: 1px solid #e7f0ff;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  }

  &__week-title {
    margin: 0 0 14px;
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--blue-700);
  }

  &__cell-stack {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__cell-text {
    white-space: nowrap;
  }

  &__empty {
    padding: 28px 18px;
    border-radius: 18px;
    text-align: center;
    font-size: 1.35rem;
    font-weight: 600;
    color: var(--blue-700);
    background: #f8fbff;
    border: 1px dashed var(--blue-200);
  }
}

:deep(.base-table),
:deep(.table-wrapper),
:deep(table) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(thead tr th) {
  padding-top: 15px !important;
  padding-bottom: 15px !important;
  font-size: 1.15rem !important;
  font-weight: 800 !important;
  color: var(--blue-800) !important;
  background: linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%) !important;
  border-bottom: 1px solid var(--blue-100) !important;
}

:deep(tbody td) {
  padding-top: 15px !important;
  padding-bottom: 15px !important;
  vertical-align: middle !important;
  border-bottom: 1px solid #edf3ff !important;
}

:deep(tbody tr:hover) {
  background: rgba(59, 130, 246, 0.04) !important;
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

@media (max-width: 992px) {
  .report-show {
    &__hero {
      flex-direction: column;
      align-items: stretch;
    }

    &__hero-main {
      align-items: flex-start;
    }

    &__report-title {
      flex-direction: column;
      align-items: flex-start;
    }
  }
}

@media (max-width: 576px) {
  .report-show {
    &__hero,
    &__section {
      padding: 16px;
      border-radius: 20px;
    }

    &__avatar {
      width: 60px;
      height: 60px;
      font-size: 1.6rem;
    }

    &__hero-title {
      font-size: 1.8rem;
    }

    &__section-title {
      font-size: 1.5rem;
    }
  }
}
</style>