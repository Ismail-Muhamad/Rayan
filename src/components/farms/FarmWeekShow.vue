<template>
  <BasePageWrapper
    titleKey="farms.show.week_page_title"
    subtitleKey="farms.show.week_page_subtitle"
    iconName="solar:calendar-mark-outline"
  >
    <div class="week-page">
      <BaseLoader
        v-if="farmsUiFlags.isFetchingItem || reportsUiFlags.isFetchingList"
      />

      <div v-else class="week-page__content">
        <section class="week-page__hero">
          <div class="week-page__hero-top">
            <div class="week-page__hero-actions">
              <BaseButton
                color="blue"
                variant="outline"
                size="sm"
                @click="router.push({ name: 'show_farm', params: { id: currentRouteId } })"
              >
                <BaseIcon name="solar:arrow-left-outline" />
                {{ t('farms.actions.back') }}
              </BaseButton>
            </div>
          </div>

          <div class="week-page__hero-body">
            <div class="week-page__hero-main">
              <span class="week-page__eyebrow">
                {{ t('farms.show.week_page_title') }}
              </span>

              <h2 class="week-page__hero-title">
                {{ farmRecord?.name || '--' }}
              </h2>

              <div class="week-page__hero-meta">
                <span class="week-page__chip week-page__chip--location">
                  <BaseIcon name="solar:map-point-outline" :width="16" :height="16" />
                  {{ farmRecord?.location || '--' }}
                </span>

                <span class="week-page__chip week-page__chip--emerald">
                  <BaseIcon name="solar:calendar-outline" :width="16" :height="16" />
                  {{ selectedMonthLabel }}
                </span>

                <span class="week-page__chip week-page__chip--slate">
                  <BaseIcon name="solar:clock-circle-outline" :width="16" :height="16" />
                  {{ selectedWeekRange }}
                </span>
              </div>

              <p class="week-page__hero-text">
                {{ t('farms.show.week_days_text') }}
              </p>
            </div>

            <aside class="week-page__week-spotlight">
              <p class="week-page__week-spotlight-label">الأسبوع الحالي</p>
              <h3 class="week-page__week-spotlight-title">
                {{ selectedWeekLabel }}
              </h3>

              <div class="week-page__week-spotlight-info">
                <div class="week-page__week-spotlight-item">
                  <span class="week-page__week-spotlight-item-label">عدد الأيام</span>
                  <strong class="week-page__week-spotlight-item-value">
                    {{ mappedDays.length }}
                  </strong>
                </div>

                <div class="week-page__week-spotlight-item">
                  <span class="week-page__week-spotlight-item-label">الفترة</span>
                  <strong class="week-page__week-spotlight-item-value week-page__week-spotlight-item-value--small">
                    {{ selectedWeekRange }}
                  </strong>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <BaseStyledSection
          :label="t('farms.show.week_days_title')"
          :description="selectedWeekRange"
        >
          <template v-if="mappedDays.length">
            <div class="week-page__days-grid">
              <article
                v-for="(day, index) in mappedDays"
                :key="`${day.raw_date}-${index}`"
                class="week-page__day-card"
              >
                <div class="week-page__day-head">
                  <div>
                    <p class="week-page__day-label">
                      {{ t('farms.table.headers.day') }}
                    </p>

                    <h3 class="week-page__day-title">
                      {{ day.day || '--' }}
                    </h3>
                  </div>

                  <span class="week-page__badge">
                    {{ day.date }}
                  </span>
                </div>

                <div class="week-page__sections">
                  <section class="week-page__section-box">
                    <div class="week-page__section-title">
                      <BaseIcon name="solar:leaf-outline" />
                      {{ t('farms.table.headers.fertilization_section') }}
                    </div>

                    <template v-if="day.fertilizations.length">
                      <div
                        v-for="(fertilization, fertIndex) in day.fertilizations"
                        :key="fertIndex"
                        class="week-page__mini-card"
                      >
                        <p class="week-page__mini-title">
                          {{ fertilization.type_of_fertilization || '--' }}
                        </p>

                        <div class="week-page__mini-grid">
                          <div class="week-page__metric">
                            <span class="week-page__metric-label">
                              {{ t('farms.table.headers.fertilizer_quantity_per_palm_tree') }}
                            </span>
                            <strong class="week-page__metric-value">
                              {{ fertilization.fertilizer_quantity_per_palm_tree }}
                            </strong>
                          </div>

                          <div class="week-page__metric">
                            <span class="week-page__metric-label">
                              {{ t('farms.table.headers.fertilization_total') }}
                            </span>
                            <strong class="week-page__metric-value">
                              {{ fertilization.total }}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </template>

                    <p v-else class="week-page__empty-line">--</p>
                  </section>

                  <section class="week-page__section-box">
                    <div class="week-page__section-title">
                      <BaseIcon name="solar:dropper-outline" />
                      {{ t('farms.table.headers.irrigation_section') }}
                    </div>

                    <div class="week-page__mini-card">
                      <div class="week-page__mini-grid">
                        <div class="week-page__metric">
                          <span class="week-page__metric-label">
                            {{ t('farms.table.headers.irrigation_amount_per_palm_tree') }}
                          </span>
                          <strong class="week-page__metric-value">
                            {{ day.irrigation_amount_per_palm_tree }}
                          </strong>
                        </div>

                        <div class="week-page__metric">
                          <span class="week-page__metric-label">
                            {{ t('farms.table.headers.total_amount_of_irrigation') }}
                          </span>
                          <strong class="week-page__metric-value">
                            {{ day.total_amount_of_irrigation }}
                          </strong>
                        </div>

                        <div class="week-page__metric">
                          <span class="week-page__metric-label">
                            {{ t('farms.table.headers.duration_of_irrigation_per_palm_tree') }}
                          </span>
                          <strong class="week-page__metric-value">
                            {{ day.duration_of_irrigation_per_palm_tree }}
                          </strong>
                        </div>

                        <div class="week-page__metric">
                          <span class="week-page__metric-label">
                            {{ t('farms.table.headers.total_duration_of_irrigation') }}
                          </span>
                          <strong class="week-page__metric-value">
                            {{ day.total_duration_of_irrigation }}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section class="week-page__section-box">
                    <div class="week-page__section-title">
                      <BaseIcon name="solar:magic-stick-3-outline" />
                      {{ t('farms.table.headers.spraying_section') }}
                    </div>

                    <div class="week-page__mini-card">
                      <div class="week-page__mini-grid">
                        <div class="week-page__metric">
                          <span class="week-page__metric-label">
                            {{ t('farms.table.headers.spraying') }}
                          </span>
                          <strong class="week-page__metric-value">
                            {{ day.spraying || '--' }}
                          </strong>
                        </div>

                        <div class="week-page__metric">
                          <span class="week-page__metric-label">
                            {{ t('farms.table.headers.spraying_per_tree') }}
                          </span>
                          <strong class="week-page__metric-value">
                            {{ day.spraying_per_tree }}
                          </strong>
                        </div>

                        <div class="week-page__metric">
                          <span class="week-page__metric-label">
                            {{ t('farms.table.headers.amount_of_spray') }}
                          </span>
                          <strong class="week-page__metric-value">
                            {{ day.amount_of_spray }}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </article>
            </div>
          </template>

          <div v-else class="week-page__empty-state">
            <div class="week-page__empty-icon">
              <BaseIcon name="solar:calendar-mark-outline" />
            </div>

            <h3 class="week-page__empty-title">
              {{ t('farms.show.no_days_title') }}
            </h3>

            <p class="week-page__empty-text">
              {{ t('farms.show.no_days_message') }}
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
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import moment from 'moment';
import { useFarmsStore } from '@/stores/farms.store';
import { useReportsStore } from '@/stores/reports.store';
import FertilizerTypesServices from '@/services/fertilizerTypes.services';
import PesticideTypesServices from '@/services/pesticideTypes.services';

const farmsStore = useFarmsStore();
const reportsStore = useReportsStore();
const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();

const fertilizerTypesRecords = ref([]);
const pesticideTypesRecords = ref([]);

const currentRouteId = computed(() => route.params.id);
const currentReportId = computed(() => String(route.params.reportId));
const currentWeekId = computed(() => String(route.params.weekId));

const { record: farmRecord, uiFlags: farmsUiFlags } = storeToRefs(farmsStore);
const { records: reportsList, uiFlags: reportsUiFlags } = storeToRefs(reportsStore);

onMounted(async () => {
  await Promise.all([
    farmsStore.fetchRecord(currentRouteId.value),
    reportsStore.fetchRecords({
      farm_id: currentRouteId.value,
    }),
    fetchTypesLookups(),
  ]);
});

const fetchTypesLookups = async () => {
  const [fertilizerTypesResponse, pesticideTypesResponse] = await Promise.all([
    FertilizerTypesServices.get(),
    PesticideTypesServices.get(),
  ]);

  fertilizerTypesRecords.value = fertilizerTypesResponse?.data || [];
  pesticideTypesRecords.value = pesticideTypesResponse?.data || [];
};

const selectedReport = computed(() => {
  return (reportsList.value || []).find(
    (report) => String(report.id) === currentReportId.value,
  );
});

const selectedWeek = computed(() => {
  return (selectedReport.value?.report_weeks || []).find(
    (week) => String(week.id) === currentWeekId.value,
  );
});

const numberOfTreesFor = (report) => {
  return Number(report?.palm_type?.number_of_trees || 0);
};

const getFertilizerTypeName = (fertilization) => {
  const matched = (fertilizerTypesRecords.value || []).find(
    (item) => item.id === fertilization?.fertilizer_type_id,
  );

  return (
    matched?.name ||
    fertilization?.type_of_fertilization ||
    t('farms.form.no_quantity')
  );
};

const getPesticideTypeName = (day) => {
  const matched = (pesticideTypesRecords.value || []).find(
    (item) => item.id === day?.pesticide_type_id,
  );

  return matched?.name || day?.spraying || t('farms.form.no_quantity');
};

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

const selectedMonthLabel = computed(() => {
  const date = selectedReport.value?.report_weeks?.[0]?.date;

  if (!date) return '--';

  return new Intl.DateTimeFormat(locale.value || 'ar', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
});

const selectedWeekLabel = computed(() => {
  const weekNumber = selectedWeek.value?.week_number;
  if (!weekNumber) return '--';
  return t(`farms.form.options.week_number.${weekNumber}`);
});

const selectedWeekRange = computed(() => {
  const days = selectedWeek.value?.days || [];

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
});

const hasRealTaskForDay = (day) => {
  const hasFertilization =
    Array.isArray(day?.fertilizations) &&
    day.fertilizations.some(
      (fertilization) =>
        fertilization?.fertilizer_type_id ||
        (fertilization?.type_of_fertilization &&
          String(fertilization.type_of_fertilization) !== '0'),
    );

  const irrigationPerTree = Number(day?.irrigation_amount_per_palm_tree || 0);
  const irrigationDuration = Number(day?.duration_of_irrigation_per_palm_tree || 0);

  const sprayAmount = Number(day?.amount_of_spray || 0);
  const hasSprayingName =
    !!day?.pesticide_type_id ||
    String(day?.spraying || '').trim() !== '';

  const hasIrrigation = irrigationPerTree > 0 || irrigationDuration > 0;
  const hasSpraying = hasSprayingName || sprayAmount > 0;

  return hasFertilization || hasIrrigation || hasSpraying;
};


const mappedDays = computed(() => {
  const report = selectedReport.value;
  const week = selectedWeek.value;

  if (!report || !week) return [];

  return [...(week.days || [])]
    .filter((day) => hasRealTaskForDay(day))
    .sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    })
    .map((day) => {
      const dayDate = new Date(day.date);

      return {
        ...day,
        raw_date: day.date,
        day: new Intl.DateTimeFormat(locale.value || 'ar', {
          weekday: 'long',
        }).format(dayDate),
        date: new Intl.DateTimeFormat(locale.value || 'ar', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(dayDate),
        fertilizations: (day.fertilizations || []).map((fertilization) => ({
          ...fertilization,
          type_of_fertilization: getFertilizerTypeName(fertilization),
          total:
            Number(fertilization.fertilizer_quantity_per_palm_tree || 0) > 0
              ? `${(
                  (Number(fertilization.fertilizer_quantity_per_palm_tree || 0) *
                    numberOfTreesFor(report)) /
                  1000
                )} ${t('farms.form.options.units.kg')}`
              : t('farms.form.no_quantity'),
          fertilizer_quantity_per_palm_tree:
            Number(fertilization.fertilizer_quantity_per_palm_tree || 0) > 0
              ? `${fertilization.fertilizer_quantity_per_palm_tree} ${t('farms.form.options.units.gram')}`
              : t('farms.form.no_quantity'),
        })),
        irrigation_amount_per_palm_tree:
          Number(day.irrigation_amount_per_palm_tree || 0) > 0
            ? `${day.irrigation_amount_per_palm_tree} ${t('farms.form.options.units.liter')}`
            : t('farms.form.no_quantity'),
        duration_of_irrigation_per_palm_tree:
          Number(day.duration_of_irrigation_per_palm_tree || 0) > 0
            ? `${day.duration_of_irrigation_per_palm_tree} ${t('farms.form.options.units.minute')}`
            : t('farms.form.no_quantity'),
        total_amount_of_irrigation:
          Number(day.irrigation_amount_per_palm_tree || 0) > 0
            ? `${day.irrigation_amount_per_palm_tree * numberOfTreesFor(report)} ${t('farms.form.options.units.liter')}`
            : t('farms.form.no_quantity'),
        total_duration_of_irrigation:
          Number(day.duration_of_irrigation_per_palm_tree || 0) > 0
            ? formatDuration(
                day.duration_of_irrigation_per_palm_tree * numberOfTreesFor(report),
              )
            : t('farms.form.no_quantity'),
        spraying:
          !day.pesticide_type_id &&
          (!day.spraying || String(day.spraying) === '0')
            ? t('farms.form.no_quantity')
            : getPesticideTypeName(day),
        spraying_per_tree:
          Number(day.amount_of_spray || 0) > 0
            ? `${day.amount_of_spray} ${t('farms.form.options.units.gram')}`
            : t('farms.form.no_quantity'),
        amount_of_spray:
          Number(day.amount_of_spray || 0) > 0
            ? `${(day.amount_of_spray * numberOfTreesFor(report)) / 1000} ${t('farms.form.options.units.kg')}`
            : t('farms.form.no_quantity'),
      };
    });
});

</script>

<style lang="scss" scoped>
.week-page {
  &__content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__hero {
    border-radius: 30px;
    padding: 24px;
    border: 1px solid rgba(59, 130, 246, 0.12);
    background:
      radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 28%),
      radial-gradient(circle at top left, rgba(125, 211, 252, 0.22), transparent 34%),
      linear-gradient(180deg, rgba(248, 251, 255, 0.98), rgba(238, 246, 255, 0.92));
    box-shadow: 0 24px 50px rgba(30, 64, 175, 0.08);
  }

  &__hero-top {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 18px;
  }

  &__hero-actions {
    display: flex;
    gap: 10px;
  }

  &__hero-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 260px;
    gap: 18px;
    align-items: stretch;
  }

  &__hero-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 14px;
    justify-content: center;
  }

  &__week-spotlight {
    border-radius: 24px;
    padding: 18px;
    background: linear-gradient(180deg, rgba(59, 130, 246, 0.1), rgba(255, 255, 255, 0.9));
    border: 1px solid rgba(59, 130, 246, 0.18);
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 14px;
    text-align: center;
  }

  &__week-spotlight-label {
    color: var(--gray-600);
    font-size: 1.3rem;
    font-weight: 700;
  }

  &__week-spotlight-title {
    color: var(--blue-800);
    font-size: 2.5rem;
    font-weight: 900;
    line-height: 1.2;
  }

  &__week-spotlight-info {
    display: grid;
    gap: 10px;
  }

  &__week-spotlight-item {
    background: rgba(255, 255, 255, 0.85);
    border: 1px solid var(--blue-100);
    border-radius: 16px;
    padding: 12px;
    display: grid;
    gap: 6px;
  }

  &__week-spotlight-item-label {
    color: var(--gray-500);
    font-size: 1.15rem;
    font-weight: 700;
  }

  &__week-spotlight-item-value {
    color: var(--gray-950);
    font-size: 1.8rem;
    font-weight: 900;

    &--small {
      font-size: 1.25rem;
      line-height: 1.7;
    }
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
    line-height: 1.2;
  }

  &__hero-meta {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  &__chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 1.25rem;
    font-weight: 700;

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

  &__hero-text {
    max-width: 760px;
    color: var(--gray-600);
    font-size: 1.65rem;
    line-height: 1.9;
  }

  &__days-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 18px;
  }

  &__day-card,
  &__mini-card,
  &__section-box {
    background-color: var(--white);
    border: 1px solid var(--gray-200);
    box-shadow: 0 10px 28px rgba(17, 24, 39, 0.05);
  }

  &__day-card {
    border-radius: 24px;
    padding: 18px;
    background:
      linear-gradient(180deg, rgba(248, 251, 255, 0.96), rgba(255, 255, 255, 1));
  }

  &__day-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__day-label {
    color: var(--gray-500);
    font-size: 1.25rem;
    font-weight: 700;
  }

  &__day-title {
    font-size: 2.2rem;
    font-weight: 900;
    color: var(--gray-950);
    margin-top: 8px;
    line-height: 1.2;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 9px 15px;
    border-radius: 999px;
    background-color: rgba(59, 130, 246, 0.1);
    color: var(--blue-800);
    font-size: 1.2rem;
    font-weight: 800;
    white-space: nowrap;
  }

  &__sections {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__section-box {
    border-radius: 18px;
    padding: 14px;
  }

  &__section-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--gray-900);
    font-size: 1.45rem;
    font-weight: 900;
    margin-bottom: 12px;
  }

  &__mini-card {
    border-radius: 16px;
    padding: 14px;
  }

  &__mini-title {
    color: var(--gray-950);
    font-size: 1.45rem;
    font-weight: 900;
    margin-bottom: 12px;
  }

  &__mini-grid {
    display: grid;
    gap: 10px;
  }

  &__metric {
    display: grid;
    gap: 4px;
    padding: 10px 12px;
    border: 1px solid var(--gray-100);
    border-radius: 14px;
    background: rgba(248, 250, 252, 0.85);
  }

  &__metric-label {
    color: var(--gray-500);
    font-size: 1.18rem;
    font-weight: 700;
    line-height: 1.6;
  }

  &__metric-value {
    color: var(--gray-950);
    font-size: 1.45rem;
    font-weight: 900;
    line-height: 1.5;
    word-break: break-word;
  }

  &__empty-line {
    color: var(--gray-500);
    font-size: 1.3rem;
  }

  &__empty-state {
    min-height: 260px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    text-align: center;
  }

  &__empty-icon {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--blue-100), var(--sky-50));
    color: var(--blue-700);
    font-size: 2rem;
  }

  &__empty-title {
    font-size: 1.95rem;
    font-weight: 800;
    color: var(--gray-950);
  }

  &__empty-text {
    max-width: 460px;
    color: var(--gray-500);
    font-size: 1.5rem;
    line-height: 1.8;
  }
}

@media (max-width: 1100px) {
  .week-page {
    &__hero-body {
      grid-template-columns: 1fr;
    }

    &__week-spotlight {
      order: -1;
    }
  }
}

@media (max-width: 960px) {
  .week-page {
    &__hero {
      padding: 18px;
      border-radius: 22px;
    }

    &__hero-title {
      font-size: 2.6rem;
    }

    &__days-grid {
      grid-template-columns: 1fr;
    }

    &__day-title {
      font-size: 1.9rem;
    }

    &__metric-value {
      font-size: 1.3rem;
    }

    &__week-spotlight-title {
      font-size: 2rem;
    }
  }
}
</style>