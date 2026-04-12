<template>
  <BasePageWrapper
    titleKey="farms.show.title"
    subtitleKey="farms.show.subtitle"
    iconName="solar:buildings-3-outline"
  >
    <div class="farm">
      <BaseLoader
        v-if="farmsUiFlags.isFetchingItem || reportsUiFlags.isFetchingList"
      />

      <div v-else class="farm__content">
        <section class="farm__hero">
          <div class="farm__hero-copy">
            <span class="farm__eyebrow">{{ t('farms.show.title') }}</span>
            <h2 class="farm__hero-title">{{ farmRecord?.name || '--' }}</h2>
            <p class="farm__hero-text">
              {{ t('farms.show.hero_text') }}
            </p>

            <div class="farm__hero-meta">
              <span class="farm__hero-chip farm__hero-chip--location">
                <BaseIcon name="solar:map-point-outline" :width="16" :height="16" />
                {{ farmRecord?.location || '--' }}
              </span>
              <span class="farm__hero-chip farm__hero-chip--emerald">
                <BaseIcon name="solar:leaf-outline" :width="16" :height="16" />
                {{ totalPalmTypes }} {{ t('farms.table.headers.palm_types') }}
              </span>
            </div>
          </div>

          <div class="farm__hero-actions">
            <BaseButton
              color="blue"
              variant="outline"
              size="sm"
              @click="router.push({ name: 'farms_list' })"
            >
              <BaseIcon name="solar:arrow-left-outline" />
              {{ t('farms.actions.back') }}
            </BaseButton>
            <BaseButton
              color="blue"
              size="sm"
              @click="router.push({ name: 'edit_farm', params: { id: currentRouteId } })"
            >
              <BaseIcon name="solar:pen-2-outline" />
              {{ t('farms.actions.edit') }}
            </BaseButton>
          </div>
        </section>

        <div class="farm__stats-grid">
          <article
            v-for="stat in overviewStats"
            :key="stat.key"
            class="farm__stat-card"
          >
            <div class="farm__stat-icon">
              <BaseIcon :name="stat.icon" />
            </div>
            <div>
              <p class="farm__stat-label">{{ stat.label }}</p>
              <p class="farm__stat-value">{{ stat.value }}</p>
            </div>
          </article>
        </div>

        <div class="farm__overview-grid">
          <BaseStyledSection
            :label="t('farms.table.headers.farm_info')"
            :description="t('farms.show.summary_text')"
          >
            <div class="farm__info-grid">
              <article
                v-for="info in farmInfo"
                :key="info.key"
                class="farm__info-card"
              >
                <p class="farm__info-label">{{ info.title }}</p>
                <p class="farm__info-value">{{ info.value || '--' }}</p>
              </article>
            </div>
          </BaseStyledSection>

          <BaseStyledSection
            :label="t('farms.table.headers.palm_types')"
            :description="t('farms.show.palm_types_text')"
          >
            <div class="farm__palm-grid">
              <article
                v-for="(palmType, index) in palmTypesInfo"
                :key="`${palmType.palm_type}-${index}`"
                class="farm__palm-card"
              >
                <div class="farm__palm-card-top">
                  <div>
                    <p class="farm__palm-label">{{ t('farms.table.headers.palm_type') }}</p>
                    <h3 class="farm__palm-name">{{ palmType.palm_type }}</h3>
                  </div>
                  <span class="farm__pill farm__pill--emerald">
                    {{ palmType.palm_count }}
                  </span>
                </div>
                <div class="farm__palm-meta">
                  <span class="farm__pill farm__pill--slate">
                    {{ t('farms.table.headers.palm_count') }}: {{ palmType.palm_count }}
                  </span>
                  <span class="farm__pill farm__pill--amber">
                    {{ t('farms.table.headers.palm_age') }}: {{ palmType.palm_age }}
                  </span>
                </div>
              </article>
            </div>
          </BaseStyledSection>
        </div>

        <BaseStyledSection
          :label="t('farms.table.headers.reports')"
          :description="t('farms.show.reports_text')"
        >
          <template v-if="reportsList.length">
            <BaseAccordion variant="splitted">
              <BaseAccordionItem
                v-for="report in reportsList"
                :key="report.id"
                :value="report.id"
              >
                <template #startContent>
                  <div class="farm__report-start-icon">
                    <BaseIcon name="solar:document-text-outline" />
                  </div>
                </template>

                <template #title>
                  <div class="farm__report-heading">
                    <strong>{{ report?.palm_type?.name || '--' }}</strong>
                    <div class="farm__report-heading-meta">
                      <span class="farm__pill farm__pill--emerald">
                        {{ formatReportMonth(report) }}
                      </span>
                      <span class="farm__pill farm__pill--slate">
                        {{ t('farms.table.headers.palm_count') }}: {{ numberOfTreesFor(report) }}
                      </span>
                    </div>
                  </div>
                </template>

                <template #subtitle>
                  {{ formatReportTitle(report) }}
                </template>

                <div class="farm__report">
                  <div class="farm__report-toolbar">
                    <div class="farm__report-summary">
                      <span class="farm__pill farm__pill--slate">
                        {{ t('farms.show.week_count') }}: {{ report?.report_weeks?.length || 0 }}
                      </span>
                      <span class="farm__pill farm__pill--amber">
                        {{ t('farms.table.headers.month') }}: {{ formatReportMonth(report) }}
                      </span>
                    </div>
                    <BaseButton
                      variant="soft"
                      color="blue"
                      size="sm"
                      :loading="exportingReportId === report.id"
                      @click="handleDownloadReport(report)"
                    >
                      <BaseIcon name="solar:download-minimalistic-outline" />
                      {{ t('farms.actions.download_report') }}
                    </BaseButton>
                  </div>

                  <div class="farm__rich-grid">
                    <BaseStyledSection :label="t('farms.table.headers.review')">
                      <div class="farm__rich-text" v-html="report.review || '--'"></div>
                    </BaseStyledSection>
                    <BaseStyledSection :label="t('farms.table.headers.recommendations')">
                      <div
                        class="farm__rich-text"
                        v-html="report.recommendations || '--'"
                      ></div>
                    </BaseStyledSection>
                  </div>

                  <div
                    v-for="week in mapWeeksReport(report)"
                    :key="week.id"
                    class="farm__week-block"
                  >
                    <BaseStyledSection
                      :label="t(`farms.form.options.week_number.${week.week_number}`)"
                      :description="getWeekRangeLabel(week)"
                    >
                      <BaseTable
                        :headers="REPORT_HEADERS"
                        :items="week.days"
                        :showToolbar="false"
                        bordered
                      >
                        <template #type_of_fertilization="{ item }">
                          <div class="farm__cell-stack">
                            <span
                              v-for="(fertilization, index) in item.fertilizations"
                              :key="index"
                              class="farm__cell-text"
                            >
                              {{ fertilization.type_of_fertilization }}
                            </span>
                          </div>
                        </template>

                        <template #fertilizer_quantity_per_palm_tree="{ item }">
                          <div class="farm__cell-stack">
                            <span
                              v-for="(fertilization, index) in item.fertilizations"
                              :key="index"
                              class="farm__cell-text"
                            >
                              {{ fertilization.fertilizer_quantity_per_palm_tree }}
                              {{ t('farms.form.options.units.gram') }}
                            </span>
                          </div>
                        </template>

                        <template #fertilization_total="{ item }">
                          <div class="farm__cell-stack">
                            <span
                              v-for="(fertilization, index) in item.fertilizations"
                              :key="index"
                              class="farm__cell-text"
                            >
                              {{
                                (fertilization.fertilizer_quantity_per_palm_tree *
                                  numberOfTreesFor(report)) /
                                1000
                              }}
                              {{ t('farms.form.options.units.kg') }}
                            </span>
                          </div>
                        </template>
                      </BaseTable>
                    </BaseStyledSection>
                  </div>
                </div>
              </BaseAccordionItem>
            </BaseAccordion>
          </template>

          <div v-else class="farm__empty-state">
            <div class="farm__empty-icon">
              <BaseIcon name="solar:document-text-outline" />
            </div>
            <h3 class="farm__empty-title">{{ t('farms.show.no_reports_title') }}</h3>
            <p class="farm__empty-text">
              {{ t('farms.show.no_reports_message') }}
            </p>
          </div>
        </BaseStyledSection>
      </div>
    </div>
  </BasePageWrapper>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import moment from 'moment';
import { useFarmsStore } from '@/stores/farms.store';
import { useReportsStore } from '@/stores/reports.store';
import { exportReportToPDF } from '@/utils/exporters/reportPdfExporter.utils';

const farmsStore = useFarmsStore();
const reportsStore = useReportsStore();
const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();

const REPORT_HEADERS = computed(() => [
  { text: t('farms.table.headers.day'), value: 'day' },
  { text: t('farms.table.headers.date'), value: 'date' },
  {
    text: t('farms.table.headers.type_of_fertilization'),
    value: 'type_of_fertilization',
  },
  {
    text: t('farms.table.headers.fertilizer_quantity_per_palm_tree'),
    value: 'fertilizer_quantity_per_palm_tree',
  },
  {
    text: t('farms.table.headers.fertilization_total'),
    value: 'fertilization_total',
  },
  {
    text: t('farms.table.headers.irrigation_amount_per_palm_tree'),
    value: 'irrigation_amount_per_palm_tree',
  },
  {
    text: t('farms.table.headers.duration_of_irrigation_per_palm_tree'),
    value: 'duration_of_irrigation_per_palm_tree',
  },
  {
    text: t('farms.table.headers.total_amount_of_irrigation'),
    value: 'total_amount_of_irrigation',
  },
  {
    text: t('farms.table.headers.total_duration_of_irrigation'),
    value: 'total_duration_of_irrigation',
  },
  { text: t('farms.table.headers.spraying'), value: 'spraying' },
  {
    text: t('farms.table.headers.spraying_per_tree'),
    value: 'spraying_per_tree',
  },
  { text: t('farms.table.headers.amount_of_spray'), value: 'amount_of_spray' },
]);

const exportingReportId = ref(null);
const currentRouteId = computed(() => route.params.id);
const { record: farmRecord, uiFlags: farmsUiFlags } = storeToRefs(farmsStore);
const { records: reportsList, uiFlags: reportsUiFlags } =
  storeToRefs(reportsStore);

const farmInfo = computed(() => [
  {
    key: 'farm_name',
    title: t('farms.table.headers.farm_name'),
    value: farmRecord.value?.name,
  },
  {
    key: 'location',
    title: t('farms.table.headers.location'),
    value: farmRecord.value?.location,
  },
]);

const palmTypesInfo = computed(() => {
  return (farmRecord.value?.palm_types || []).map((palmType) => ({
    palm_type: palmType.name,
    palm_count: palmType.number_of_trees,
    palm_age: palmType.palm_age,
  }));
});

const totalPalmTypes = computed(() => palmTypesInfo.value.length);
const totalTrees = computed(() => {
  return palmTypesInfo.value.reduce(
    (sum, palmType) => sum + Number(palmType.palm_count || 0),
    0,
  );
});

const latestReportLabel = computed(() => {
  const latestReport = [...(reportsList.value || [])]
    .sort((current, next) => {
      return (
        new Date(next?.report_weeks?.[0]?.date || 0).getTime() -
        new Date(current?.report_weeks?.[0]?.date || 0).getTime()
      );
    })
    .at(0);

  return latestReport ? formatReportMonth(latestReport) : '--';
});

const overviewStats = computed(() => [
  {
    key: 'palm_types',
    label: t('farms.show.stats.palm_types'),
    value: totalPalmTypes.value,
    icon: 'solar:leaf-outline',
  },
  {
    key: 'trees',
    label: t('farms.show.stats.total_trees'),
    value: totalTrees.value,
    icon: 'solar:trees-outline',
  },
  {
    key: 'reports',
    label: t('farms.show.stats.reports_count'),
    value: reportsList.value.length,
    icon: 'solar:document-text-outline',
  },
  {
    key: 'last_report',
    label: t('farms.show.stats.last_report'),
    value: latestReportLabel.value,
    icon: 'solar:calendar-outline',
  },
]);

onMounted(async () => {
  await farmsStore.fetchRecord(currentRouteId.value);
  await reportsStore.fetchRecords({
    farm_id: currentRouteId.value,
  });
});

const formatDuration = (totalMinutes) => {
  const duration = moment.duration(totalMinutes, 'minutes');
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();

  if (hours && minutes) {
    return `${hours} ${t('farms.form.options.units.hour')} ${minutes} ${t('farms.form.options.units.minute')}`;
  }

  if (hours) {
    return `${hours} ${t('farms.form.options.units.hour')}`;
  }

  return `${minutes} ${t('farms.form.options.units.minute')}`;
};

const mapWeeksReport = (report) => {
  return (report?.report_weeks || []).map((week) => ({
    ...week,
    days: (week.days || []).map((day) => ({
      ...day,
      fertilizations: day.fertilizations || [],
      irrigation_amount_per_palm_tree: `${day.irrigation_amount_per_palm_tree} ${t('farms.form.options.units.liter')}`,
      duration_of_irrigation_per_palm_tree: `${day.duration_of_irrigation_per_palm_tree} ${t('farms.form.options.units.minute')}`,
      total_amount_of_irrigation: `${day.irrigation_amount_per_palm_tree * numberOfTreesFor(report)} ${t('farms.form.options.units.liter')}`,
      total_duration_of_irrigation: formatDuration(
        day.duration_of_irrigation_per_palm_tree * numberOfTreesFor(report),
      ),
      spraying: day.spraying,
      spraying_per_tree: `${day.amount_of_spray} ${t('farms.form.options.units.gram')}`,
      amount_of_spray: `${(day.amount_of_spray * numberOfTreesFor(report)) / 1000} ${t('farms.form.options.units.kg')}`,
    })),
  }));
};

const numberOfTreesFor = (report) => {
  return Number(report?.palm_type?.number_of_trees || 0);
};

const formatReportMonth = (report) => {
  const date = report?.report_weeks?.[0]?.date;

  if (!date) {
    return t('farms.show.unknown_month');
  }

  return new Intl.DateTimeFormat(locale.value || 'ar', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
};

const formatReportTitle = (report) => {
  return `${report?.farm?.name || '--'} - ${report?.palm_type?.name || '--'} - ${t('farms.table.headers.month')} ${formatReportMonth(report)}`;
};

const getWeekRangeLabel = (week) => {
  const days = week?.days || [];

  if (!days.length) {
    return t('farms.show.week_without_days');
  }

  const firstDay = new Intl.DateTimeFormat(locale.value || 'ar', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(days[0].date));

  const lastDay = new Intl.DateTimeFormat(locale.value || 'ar', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(days[days.length - 1].date));

  return `${firstDay} - ${lastDay}`;
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
    console.error('Failed to export report PDF:', error);
  } finally {
    exportingReportId.value = null;
  }
};
</script>

<style lang="scss" scoped>
.farm {
  &__content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    padding: 24px;
    border-radius: 24px;
border: 1px solid var(--blue-100);
background:
  linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(255, 255, 255, 0.98)),
  var(--white);
box-shadow: 0 20px 40px rgba(30, 64, 175, 0.08);
  }

  &__hero-copy {
    max-width: 760px;
  }

  &__eyebrow {
    display: inline-flex;
    padding: 6px 12px;
    border-radius: 999px;
background-color: var(--blue-100);
color: var(--blue-800);
    font-size: 1.25rem;
    font-weight: 700;
    margin-block-end: 12px;
  }

  &__hero-title {
    font-size: clamp(2.6rem, 3vw, 3.6rem);
    font-weight: 800;
    color: var(--gray-950);
    margin-block-end: 10px;
  }

  &__hero-text {
    max-width: 600px;
    color: var(--gray-600);
    font-size: 1.55rem;
    line-height: 1.8;
    margin-block-end: 16px;
  }

  &__hero-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__hero-chip,
  &__pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 1.25rem;
    font-weight: 700;
  }

  &__hero-chip {
    &--location {
      background-color: var(--white);
      color: var(--gray-700);
      border: 1px solid var(--gray-200);
    }

    &--emerald {
background-color: var(--blue-100);
color: var(--blue-800);
    }
  }

  &__hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-end;
  }

  &__stats-grid,
  &__overview-grid {
    display: grid;
    gap: 16px;
  }

  &__stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  }

  &__overview-grid {
    grid-template-columns: minmax(280px, 1fr) minmax(320px, 1.15fr);
  }

  &__stat-card,
  &__info-card,
  &__palm-card {
    background-color: var(--white);
    border: 1px solid var(--gray-200);
    box-shadow: 0 10px 30px rgba(17, 24, 39, 0.06);
  }

  &__stat-card {
    border-radius: 20px;
    padding: 18px;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__stat-icon,
  &__report-start-icon,
  &__empty-icon {
    width: 52px;
    height: 52px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
background: linear-gradient(135deg, var(--blue-100), var(--sky-50));
color: var(--blue-700);
    flex-shrink: 0;
    font-size: 2rem;
  }

  &__stat-label,
  &__info-label,
  &__palm-label {
    color: var(--gray-500);
    font-size: 1.3rem;
    font-weight: 700;
  }

  &__stat-value {
    color: var(--gray-950);
    font-size: 2rem;
    font-weight: 800;
    margin-top: 4px;
  }

  &__info-grid,
  &__palm-grid,
  &__rich-grid {
    display: grid;
    gap: 16px;
  }

  &__info-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  &__palm-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  &__rich-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  &__info-card,
  &__palm-card {
    border-radius: 18px;
    padding: 16px;
  }

  &__info-value {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--gray-900);
    margin-top: 8px;
  }

  &__palm-card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-block-end: 14px;
  }

  &__palm-name {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--gray-900);
    margin-top: 8px;
  }

  &__palm-meta,
  &__report-summary,
  &__report-heading-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__pill {
    &--emerald {
background-color: var(--blue-50);
color: var(--blue-700);
    }

    &--amber {
background-color: var(--blue-100);
color: var(--blue-800);
    }

    &--slate {
      background-color: var(--gray-100);
      color: var(--gray-700);
    }
  }

  &__report {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding-block-start: 20px;
  }

  &__report-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__report-heading {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 1.55rem;
    color: var(--gray-900);
  }

  &__rich-text {
    color: var(--gray-700);
    font-size: 1.45rem;
    line-height: 1.9;
  }

  &__week-block {
    margin-block-start: 4px;
  }

  &__cell-stack {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__cell-text {
    white-space: nowrap;
  }

  &__empty-state {
    min-height: 250px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 14px;
    padding: 16px;
  }

  &__empty-title {
    font-size: 1.95rem;
    font-weight: 800;
    color: var(--gray-950);
  }

  &__empty-text {
    max-width: 440px;
    color: var(--gray-500);
    font-size: 1.5rem;
    line-height: 1.8;
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

@media (max-width: 960px) {
  .farm {
    &__hero {
      flex-direction: column;
    }

    &__overview-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
