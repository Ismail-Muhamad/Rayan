<template>
  <BasePageWrapper
    titleKey="farms.show.title"
    subtitleKey="farms.show.subtitle"
    iconName="tabler:trees"
  >
    <div class="farm">
      <BaseLoader
        v-if="farmsUiFlags.isFetchingItem || reportsUiFlags.isFetchingList"
      />

      <div v-else class="farm__content">
        <section class="farm__hero">
          <div class="farm__hero-overlay"></div>

          <div class="farm__hero-top">
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
          </div>

          <div class="farm__hero-center">
            <span class="farm__eyebrow">{{ t('farms.show.title') }}</span>

            <h2 class="farm__hero-title">{{ farmRecord?.name || '--' }}</h2>

            <div class="farm__hero-meta">
              <span class="farm__hero-chip farm__hero-chip--location">
                <BaseIcon name="solar:map-point-outline" :width="16" :height="16" />
                {{ farmRecord?.location || '--' }}
              </span>

              <span class="farm__hero-chip farm__hero-chip--emerald">
                <BaseIcon name="tabler:trees" :width="16" :height="16" />
                {{ totalPalmTypes }} {{ t('farms.table.headers.palm_types') }}
              </span>

              <span class="farm__hero-chip farm__hero-chip--slate">
                <BaseIcon name="solar:calendar-outline" :width="16" :height="16" />
                {{ latestTaskLabel }}
              </span>
            </div>

            <p class="farm__hero-text">
              {{ t('farms.show.hero_text') }}
            </p>
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
                    {{ t('farms.table.headers.palm_count') }}:
                    {{ palmType.palm_count }}
                  </span>

                  <span class="farm__pill farm__pill--amber">
                    {{ t('farms.table.headers.palm_age') }}:
                    {{ palmType.palm_age }}
                  </span>
                </div>
              </article>
            </div>
          </BaseStyledSection>
        </div>

        <BaseStyledSection
          :label="t('farms.show.monthly_tasks')"
          :description="t('farms.show.tasks_text')"
        >
          <template v-if="taskGroups.length">
            <div class="farm__months-grid">
              <article
                v-for="taskGroup in taskGroups"
                :key="taskGroup.id"
                class="farm__month-card"
              >
                <div class="farm__month-head">
                  <div>
                    <p class="farm__month-label">{{ t('farms.show.task_month') }}</p>
                    <h3 class="farm__month-title">{{ taskGroup.monthLabel }}</h3>
                  </div>

                  <div class="farm__month-badges">
                    <span class="farm__pill farm__pill--emerald">
                      {{ taskGroup.palmTypeName }}
                    </span>

                    <span class="farm__pill farm__pill--slate">
                      {{ t('farms.show.week_count') }}:
                      {{ taskGroup.weeks.length }}
                    </span>
                  </div>
                </div>

                <div class="farm__month-summary">
                  <div class="farm__month-summary-box">
                    <p class="farm__month-summary-title">
                      {{ t('farms.table.headers.review') }}
                    </p>
                    <p class="farm__month-summary-text">
                      {{ taskGroup.reviewPreview }}
                    </p>
                  </div>

                  <div class="farm__month-summary-box">
                    <p class="farm__month-summary-title">
                      {{ t('farms.table.headers.recommendations') }}
                    </p>
                    <p class="farm__month-summary-text">
                      {{ taskGroup.recommendationsPreview }}
                    </p>
                  </div>
                </div>

                <div class="farm__weeks-grid">
                  <button
                    v-for="week in taskGroup.weeks"
                    :key="week.id"
                    type="button"
                    class="farm__week-card"
                    @click="goToWeek(taskGroup.id, week.id)"
                  >
                    <div class="farm__week-icon">
                      <BaseIcon name="solar:calendar-mark-outline" />
                    </div>

                    <div class="farm__week-copy">
                      <div class="farm__week-top">
                        <h4 class="farm__week-title">
                          {{ t(`farms.form.options.week_number.${week.week_number}`) }}
                        </h4>

                        <span class="farm__pill farm__pill--blue-soft">
                          {{ week.days.length }}
                          {{ t('farms.show.days_count') }}
                        </span>
                      </div>

                      <p class="farm__week-range">{{ getWeekRangeLabel(week) }}</p>

                      <p class="farm__week-hint">
                        {{ t('farms.show.open_week') }}
                      </p>
                    </div>

                    <div class="farm__week-arrow">
                      <BaseIcon name="solar:alt-arrow-left-outline" />
                    </div>
                  </button>
                </div>
              </article>
            </div>
          </template>

          <div v-else class="farm__empty-state">
            <div class="farm__empty-icon">
              <BaseIcon name="solar:calendar-mark-outline" />
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
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useFarmsStore } from '@/stores/farms.store';
import { useReportsStore } from '@/stores/reports.store';

const farmsStore = useFarmsStore();
const reportsStore = useReportsStore();
const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();

const currentRouteId = computed(() => route.params.id);
const { record: farmRecord, uiFlags: farmsUiFlags } = storeToRefs(farmsStore);
const { records: reportsList, uiFlags: reportsUiFlags } = storeToRefs(reportsStore);

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

const totalWeeks = computed(() => {
  return (reportsList.value || []).reduce((sum, report) => {
    return sum + Number(report?.report_weeks?.length || 0);
  }, 0);
});

const latestTaskLabel = computed(() => {
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
    icon: 'tabler:trees',
  },
  {
    key: 'trees',
    label: t('farms.show.stats.total_trees'),
    value: totalTrees.value,
    icon: 'solar:leaf-outline',
  },
  {
    key: 'tasks',
    label: t('farms.show.stats.reports_count'),
    value: totalWeeks.value,
    icon: 'solar:calendar-mark-outline',
  },
  {
    key: 'last_task',
    label: t('farms.show.stats.last_report'),
    value: latestTaskLabel.value,
    icon: 'solar:calendar-outline',
  },
]);

const taskGroups = computed(() => {
  return (reportsList.value || []).map((report) => ({
    id: report.id,
    monthLabel: formatReportMonth(report),
    palmTypeName: report?.palm_type?.name || '--',
    reviewPreview: stripHtml(report?.review) || t('farms.show.no_review'),
    recommendationsPreview:
      stripHtml(report?.recommendations) || t('farms.show.no_recommendations'),
    weeks: report?.report_weeks || [],
  }));
});

onMounted(async () => {
  await farmsStore.fetchRecord(currentRouteId.value);
  await reportsStore.fetchRecords({
    farm_id: currentRouteId.value,
  });
});

const stripHtml = (value) => {
  if (!value) return '';
  return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
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

const goToWeek = (reportId, weekId) => {
  router.push({
    name: 'show_farm_week',
    params: {
      id: currentRouteId.value,
      reportId,
      weekId,
    },
  });
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
    position: relative;
    overflow: hidden;
    border-radius: 30px;
    border: 1px solid rgba(59, 130, 246, 0.12);
    background:
      radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 28%),
      radial-gradient(circle at top left, rgba(125, 211, 252, 0.22), transparent 34%),
      linear-gradient(180deg, rgba(248, 251, 255, 0.98), rgba(238, 246, 255, 0.92));
    box-shadow: 0 24px 50px rgba(30, 64, 175, 0.08);
    padding: 24px 24px 30px;
  }

  &__hero-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(90deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.82));
  }

  &__hero-top,
  &__hero-center {
    position: relative;
    z-index: 1;
  }

  &__hero-top {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 16px;
  }

  &__hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__hero-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 14px;
    padding: 18px 0 10px;
  }

  &__eyebrow {
    display: inline-flex;
    align-items: center;
    padding: 7px 14px;
    border-radius: 999px;
    background-color: rgba(59, 130, 246, 0.1);
    color: var(--blue-800);
    font-size: 1.25rem;
    font-weight: 800;
  }

  &__hero-title {
    font-size: clamp(3rem, 4vw, 4.8rem);
    font-weight: 900;
    color: var(--gray-950);
    line-height: 1.15;
  }

  &__hero-meta {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  &__hero-text {
    max-width: 820px;
    color: var(--gray-600);
    font-size: 1.55rem;
    line-height: 1.9;
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
      background-color: rgba(255, 255, 255, 0.88);
      color: var(--gray-700);
      border: 1px solid var(--gray-200);
    }

    &--emerald {
      background-color: var(--blue-100);
      color: var(--blue-800);
    }

    &--slate {
      background-color: var(--gray-100);
      color: var(--gray-700);
    }
  }

  &__stats-grid,
  &__overview-grid,
  &__months-grid,
  &__weeks-grid,
  &__info-grid,
  &__palm-grid {
    display: grid;
    gap: 16px;
  }

  &__stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  }

  &__overview-grid {
    grid-template-columns: minmax(280px, 1fr) minmax(320px, 1.15fr);
  }

  &__months-grid {
    grid-template-columns: 1fr;
  }

  &__weeks-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  &__info-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  &__palm-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  &__stat-card,
  &__info-card,
  &__palm-card,
  &__month-card,
  &__week-card,
  &__month-summary-box {
    background-color: var(--white);
    border: 1px solid var(--gray-200);
    box-shadow: 0 10px 28px rgba(17, 24, 39, 0.05);
  }

  &__stat-card {
    border-radius: 20px;
    padding: 18px;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__stat-icon,
  &__empty-icon,
  &__week-icon {
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
  &__palm-label,
  &__month-label,
  &__month-summary-title {
    color: var(--gray-500);
    font-size: 1.3rem;
    font-weight: 700;
  }

  &__stat-value {
    color: var(--gray-950);
    font-size: 2rem;
    font-weight: 900;
    margin-top: 4px;
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
    margin-bottom: 14px;
  }

  &__palm-name {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--gray-900);
    margin-top: 8px;
  }

  &__palm-meta,
  &__month-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__month-card {
    border-radius: 24px;
    padding: 20px;
    background:
      linear-gradient(180deg, rgba(248, 251, 255, 0.92), rgba(255, 255, 255, 1));
  }

  &__month-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }

  &__month-title {
    font-size: 2rem;
    font-weight: 900;
    color: var(--gray-950);
    margin-top: 8px;
  }

  &__month-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 14px;
    margin-bottom: 18px;
  }

  &__month-summary-box {
    border-radius: 18px;
    padding: 16px;
  }

  &__month-summary-text {
    margin-top: 10px;
    color: var(--gray-700);
    font-size: 1.35rem;
    line-height: 1.9;
  }

  &__week-card {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 14px;
    text-align: start;
    border-radius: 20px;
    padding: 16px;
    cursor: pointer;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      border-color 0.2s ease;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(243, 248, 255, 0.92));

    &:hover {
      transform: translateY(-3px);
      border-color: var(--blue-200);
      box-shadow: 0 20px 34px rgba(37, 99, 235, 0.12);
    }
  }

  &__week-copy {
    flex: 1;
    min-width: 0;
  }

  &__week-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__week-title {
    font-size: 1.65rem;
    font-weight: 800;
    color: var(--gray-950);
  }

  &__week-range {
    margin-top: 8px;
    color: var(--gray-600);
    font-size: 1.35rem;
  }

  &__week-hint {
    margin-top: 8px;
    color: var(--blue-700);
    font-size: 1.25rem;
    font-weight: 700;
  }

  &__week-arrow {
    color: var(--blue-700);
    font-size: 1.8rem;
    flex-shrink: 0;
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

    &--blue-soft {
      background-color: rgba(59, 130, 246, 0.1);
      color: var(--blue-800);
    }
  }

  &__empty-state {
    min-height: 260px;
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
    max-width: 480px;
    color: var(--gray-500);
    font-size: 1.5rem;
    line-height: 1.8;
  }
}

@media (max-width: 960px) {
  .farm {
    &__overview-grid {
      grid-template-columns: 1fr;
    }

    &__hero {
      padding: 18px;
      border-radius: 22px;
    }

    &__hero-title {
      font-size: 2.6rem;
    }

    &__week-card {
      align-items: flex-start;
    }
  }
}
</style>