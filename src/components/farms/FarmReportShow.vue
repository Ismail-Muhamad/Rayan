<template>
  <BasePageWrapper
    titleKey="farms.show.monthly_tasks"
    subtitleKey="farms.show.tasks_text"
    iconName="solar:calendar-mark-outline"
  >
    <div class="report-show">
      <BaseLoader
        v-if="farmsUiFlags.isFetchingItem || reportsUiFlags.isFetchingList"
      />

      <div v-else-if="selectedReport" class="report-show__content">
        <section class="report-show__hero">
          <div class="report-show__hero-bg"></div>

          <div class="report-show__hero-content">
            <div class="report-show__hero-top">
              <span class="report-show__status-pill">
                <BaseIcon name="solar:verified-check-bold" />
                التقرير جاهز
              </span>

              <BaseButton
                color="blue"
                variant="outline"
                size="sm"
                @click="router.push({ name: 'show_farm', params: { id: currentFarmId } })"
              >
                <BaseIcon name="solar:arrow-left-outline" />
                رجوع للمزرعة
              </BaseButton>
            </div>

            <div class="report-show__main-title">
              <p class="report-show__eyebrow">تقرير مهام الشهر</p>

              <h1>{{ reportMonthLabel }}</h1>

              <p>
                جدول الري والتسميد والرش الخاص بمزرعة
                <strong>{{ farmRecord?.name || selectedReport?.farm?.name || '--' }}</strong>
              </p>
            </div>

            <div class="report-show__hero-cards">
              <article class="report-show__mini-card">
                <div class="report-show__mini-icon">
                  <BaseIcon name="tabler:trees" />
                </div>
                <div>
                  <span>نوع النخيل</span>
                  <strong>{{ selectedReport?.palm_type?.name || '--' }}</strong>
                </div>
              </article>

              <article class="report-show__mini-card">
                <div class="report-show__mini-icon">
                  <BaseIcon name="solar:calendar-outline" />
                </div>
                <div>
                  <span>عدد الأسابيع</span>
                  <strong>{{ mappedWeeks.length }}</strong>
                </div>
              </article>

              <article class="report-show__mini-card">
                <div class="report-show__mini-icon">
                  <BaseIcon name="solar:leaf-outline" />
                </div>
                <div>
                  <span>عدد النخل</span>
                  <strong>{{ numberOfTreesFor(selectedReport) }}</strong>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section class="report-show__summary-grid">
          <article class="report-show__summary-card">
            <div class="report-show__section-head">
              <div class="report-show__section-icon">
                <BaseIcon name="solar:document-text-outline" />
              </div>
              <div>
                <p>المراجعة</p>
                <h3>ملخص حالة المزرعة</h3>
              </div>
            </div>

            <p class="report-show__summary-text">
              {{ stripHtml(selectedReport?.review) || 'لا توجد مراجعة لهذا التقرير.' }}
            </p>
          </article>

          <article class="report-show__summary-card">
            <div class="report-show__section-head">
              <div class="report-show__section-icon">
                <BaseIcon name="solar:lightbulb-bolt-outline" />
              </div>
              <div>
                <p>التوصيات</p>
                <h3>إرشادات الشهر</h3>
              </div>
            </div>

            <p class="report-show__summary-text">
              {{
                stripHtml(selectedReport?.recommendations) ||
                'لا توجد توصيات لهذا التقرير.'
              }}
            </p>
          </article>
        </section>

        <section class="report-show__weeks-section">
          <div class="report-show__weeks-head">
            <div>
              <p>تفاصيل المهام</p>
              <h2>أسابيع شهر {{ reportMonthOnly }}</h2>
            </div>

            <BaseButton
              color="blue"
              size="sm"
              :isLoading="exportingReportId === selectedReport.id"
              @click="handleDownloadReport(selectedReport)"
            >
              <BaseIcon name="solar:download-minimalistic-outline" />
              تحميل PDF
            </BaseButton>
          </div>

          <div v-if="mappedWeeks.length" class="report-show__weeks-list">
            <article
              v-for="week in mappedWeeks"
              :key="week.id"
              class="report-show__week-card"
            >
              <button
                type="button"
                class="report-show__week-main"
                @click="toggleWeek(week.id)"
              >
                <div class="report-show__week-number">
                  <BaseIcon name="solar:calendar-mark-outline" />
                </div>

                <div class="report-show__week-copy">
                  <h3>
                    {{ t(`farms.form.options.week_number.${week.week_number}`) }}
                  </h3>

                  <p>{{ getWeekRangeLabel(week) }}</p>
                </div>

                <div class="report-show__week-meta">
                  <span>{{ week.days.length }} أيام</span>
                  <BaseIcon
                    :name="
                      openedWeeks.includes(week.id)
                        ? 'solar:alt-arrow-up-outline'
                        : 'solar:alt-arrow-down-outline'
                    "
                  />
                </div>
              </button>

              <div
                v-if="openedWeeks.includes(week.id)"
                class="report-show__days-list"
              >
                <article
                  v-for="day in week.days"
                  :key="day.id"
                  class="report-show__day-card"
                >
                  <div class="report-show__day-head">
                    <div>
                      <span>{{ day.day }}</span>
                      <strong>{{ formatDayDate(day.date) }}</strong>
                    </div>
                  </div>

                  <div class="report-show__tasks-grid">
                    <div class="report-show__task-box report-show__task-box--water">
                      <div class="report-show__task-icon">
                        <BaseIcon name="solar:drop-outline" />
                      </div>

                      <div>
                        <p>الري</p>
                        <h4>{{ day.irrigation_amount_per_palm_tree }}</h4>
                        <span>
                          الإجمالي:
                          {{ day.total_amount_of_irrigation }}
                        </span>
                      </div>
                    </div>

                    <div class="report-show__task-box report-show__task-box--fertilizer">
                      <div class="report-show__task-icon">
                        <BaseIcon name="solar:leaf-outline" />
                      </div>

                      <div>
                        <p>التسميد</p>

                        <template v-if="day.fertilizations?.length">
                          <h4>
                            {{ day.fertilizations[0].type_of_fertilization }}
                          </h4>
                          <span>
                            للنخلة:
                            {{
                              day.fertilizations[0]
                                .fertilizer_quantity_per_palm_tree
                            }}
                          </span>
                        </template>

                        <template v-else>
                          <h4>{{ t('farms.form.no_quantity') }}</h4>
                        </template>
                      </div>
                    </div>

                    <div class="report-show__task-box report-show__task-box--spray">
                      <div class="report-show__task-icon">
                        <BaseIcon name="solar:test-tube-outline" />
                      </div>

                      <div>
                        <p>الرش</p>
                        <h4>{{ day.spraying }}</h4>
                        <span>
                          الكمية:
                          {{ day.amount_of_spray }}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </article>
          </div>

          <div v-else class="report-show__empty">
            <div>
              <BaseIcon name="solar:calendar-minimalistic-outline" />
            </div>

            <h3>لا توجد مهام ظاهرة لهذا الشهر</h3>
            <p>قد يكون التقرير موجودًا، لكن لا توجد أيام بها ري أو تسميد أو رش.</p>
          </div>
        </section>
      </div>

      <div v-else class="report-show__empty report-show__empty--page">
        <div>
          <BaseIcon name="solar:danger-triangle-outline" />
        </div>

        <h3>التقرير غير موجود</h3>
        <p>تأكد من رابط التقرير أو رقم التقرير المرسل في رسالة الواتساب.</p>

        <BaseButton
          color="blue"
          @click="router.push({ name: 'show_farm', params: { id: currentFarmId } })"
        >
          الرجوع للمزرعة
        </BaseButton>
      </div>
    </div>
  </BasePageWrapper>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useFarmsStore } from '@/stores/farms.store';
import { useReportsStore } from '@/stores/reports.store';
import { exportReportToPDF } from '@/utils/exporters/reportPdfExporter.utils';

const farmsStore = useFarmsStore();
const reportsStore = useReportsStore();

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();

const exportingReportId = ref(null);
const openedWeeks = ref([]);

const { record: farmRecord, uiFlags: farmsUiFlags } = storeToRefs(farmsStore);
const { records: reportsList, uiFlags: reportsUiFlags } =
  storeToRefs(reportsStore);

const currentFarmId = computed(() => route.params.id);
const currentReportId = computed(() => route.params.reportId);

const selectedReport = computed(() => {
  return (reportsList.value || []).find((report) => {
    return String(report.id) === String(currentReportId.value);
  });
});

const stripHtml = (value) => {
  if (!value) return '';

  return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();

  const [year, month, day] = String(dateStr).split('-');
  return new Date(year, month - 1, day);
};

const getReportFirstDate = (report) => {
  return report?.report_weeks?.[0]?.date || null;
};

const reportMonthLabel = computed(() => {
  const date = getReportFirstDate(selectedReport.value);

  if (!date) return '--';

  return new Intl.DateTimeFormat(locale.value || 'ar', {
    month: 'long',
    year: 'numeric',
  }).format(parseLocalDate(date));
});

const reportMonthOnly = computed(() => {
  const date = getReportFirstDate(selectedReport.value);

  if (!date) return '--';

  return new Intl.DateTimeFormat(locale.value || 'ar', {
    month: 'long',
  }).format(parseLocalDate(date));
});

const formatDayDate = (dateStr) => {
  if (!dateStr) return '--';

  return new Intl.DateTimeFormat(locale.value || 'ar', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parseLocalDate(dateStr));
};

const getDayNameFromDate = (dateStr, tFn) => {
  const date = parseLocalDate(dateStr);
  const dayIndex = date.getDay();

  return tFn(`reports.form.options.days.${dayIndex}`);
};

const formatDuration = (totalMinutes) => {
  const hours = Math.floor(Number(totalMinutes || 0) / 60);
  const minutes = Number(totalMinutes || 0) % 60;

  if (hours && minutes) {
    return `${hours} ${t('farms.form.options.units.hour')} ${minutes} ${t('farms.form.options.units.minute')}`;
  }

  if (hours) {
    return `${hours} ${t('farms.form.options.units.hour')}`;
  }

  return `${minutes} ${t('farms.form.options.units.minute')}`;
};

const numberOfTreesFor = (report) => {
  return report?.palm_type?.number_of_trees || 0;
};

const mapWeeksReport = (report) => {
  const weeks = (report?.report_weeks || [])
    .map((week) => {
      const validDays = (week.days || []).filter((day) => {
        const hasFertilization = (day.fertilizations || []).some(
          (f) =>
            (f.type_of_fertilization &&
              String(f.type_of_fertilization) !== '0') ||
            (f.fertilizer_quantity_per_palm_tree &&
              String(f.fertilizer_quantity_per_palm_tree) !== '0'),
        );

        const hasIrrigation =
          (day.irrigation_amount_per_palm_tree &&
            String(day.irrigation_amount_per_palm_tree) !== '0') ||
          (day.duration_of_irrigation_per_palm_tree &&
            String(day.duration_of_irrigation_per_palm_tree) !== '0');

        const hasSpraying =
          (day.spraying && String(day.spraying) !== '0') ||
          (day.amount_of_spray && String(day.amount_of_spray) !== '0');

        return hasFertilization || hasIrrigation || hasSpraying;
      });

      return {
        ...week,
        days: validDays.map((day) => ({
          ...day,
          day: getDayNameFromDate(day.date, t),
          fertilizations: (day.fertilizations || []).map((f) => ({
            ...f,
            type_of_fertilization:
              f.type_of_fertilization &&
              String(f.type_of_fertilization) !== '0'
                ? f.type_of_fertilization
                : t('farms.form.no_quantity'),
            fertilization_total:
              f.fertilizer_quantity_per_palm_tree &&
              String(f.fertilizer_quantity_per_palm_tree) !== '0'
                ? `${(f.fertilizer_quantity_per_palm_tree * numberOfTreesFor(report)) / 1000} ${t('farms.form.options.units.kg')}`
                : t('farms.form.no_quantity'),
            fertilizer_quantity_per_palm_tree:
              f.fertilizer_quantity_per_palm_tree &&
              String(f.fertilizer_quantity_per_palm_tree) !== '0'
                ? `${f.fertilizer_quantity_per_palm_tree} ${t('farms.form.options.units.gram')}`
                : t('farms.form.no_quantity'),
          })),
          irrigation_amount_per_palm_tree:
            !day.irrigation_amount_per_palm_tree ||
            String(day.irrigation_amount_per_palm_tree) === '0'
              ? t('farms.form.no_quantity')
              : `${day.irrigation_amount_per_palm_tree} ${t('farms.form.options.units.liter')}`,
          duration_of_irrigation_per_palm_tree:
            !day.duration_of_irrigation_per_palm_tree ||
            String(day.duration_of_irrigation_per_palm_tree) === '0'
              ? t('farms.form.no_quantity')
              : `${day.duration_of_irrigation_per_palm_tree} ${t('farms.form.options.units.minute')}`,
          total_amount_of_irrigation:
            !day.irrigation_amount_per_palm_tree ||
            String(day.irrigation_amount_per_palm_tree) === '0'
              ? t('farms.form.no_quantity')
              : `${day.irrigation_amount_per_palm_tree * numberOfTreesFor(report)} ${t('farms.form.options.units.liter')}`,
          total_duration_of_irrigation:
            !day.duration_of_irrigation_per_palm_tree ||
            String(day.duration_of_irrigation_per_palm_tree) === '0'
              ? t('farms.form.no_quantity')
              : formatDuration(
                  day.duration_of_irrigation_per_palm_tree *
                    numberOfTreesFor(report),
                ),
          spraying:
            !day.spraying || String(day.spraying) === '0'
              ? t('farms.form.no_quantity')
              : day.spraying,
          spraying_per_tree:
            !day.amount_of_spray || String(day.amount_of_spray) === '0'
              ? t('farms.form.no_quantity')
              : `${day.amount_of_spray} ${t('farms.form.options.units.gram')}`,
          amount_of_spray:
            !day.amount_of_spray || String(day.amount_of_spray) === '0'
              ? t('farms.form.no_quantity')
              : `${(day.amount_of_spray * numberOfTreesFor(report)) / 1000} ${t('farms.form.options.units.kg')}`,
        })),
      };
    })
    .filter((week) => week.days.length > 0);

  return weeks;
};

const mappedWeeks = computed(() => {
  return mapWeeksReport(selectedReport.value);
});

const formatReportTitle = (report) => {
  const firstWeek = report?.report_weeks?.[0];
  const date = firstWeek ? parseLocalDate(firstWeek.date) : new Date();

  const month = new Intl.DateTimeFormat(locale.value || 'ar', {
    month: 'long',
  }).format(date);

  return `${report?.farm?.name || farmRecord.value?.name || '--'} - ${report?.palm_type?.name || '--'} - ${t('farms.table.headers.month')} ${month}`;
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

const getWeekRangeLabel = (week) => {
  const days = week?.days || [];

  if (!days.length) {
    return t('farms.show.week_without_days');
  }

  const firstDay = new Intl.DateTimeFormat(locale.value || 'ar', {
    day: 'numeric',
    month: 'short',
  }).format(parseLocalDate(days[0].date));

  const lastDay = new Intl.DateTimeFormat(locale.value || 'ar', {
    day: 'numeric',
    month: 'short',
  }).format(parseLocalDate(days[days.length - 1].date));

  return `${firstDay} - ${lastDay}`;
};

const toggleWeek = (weekId) => {
  if (openedWeeks.value.includes(weekId)) {
    openedWeeks.value = openedWeeks.value.filter((id) => id !== weekId);
    return;
  }

  openedWeeks.value = [...openedWeeks.value, weekId];
};

onMounted(async () => {
  await farmsStore.fetchRecord(currentFarmId.value);

  await reportsStore.fetchRecords({
    farm_id: currentFarmId.value,
  });

  if (mappedWeeks.value[0]?.id) {
    openedWeeks.value = [mappedWeeks.value[0].id];
  }
});
</script>

<style lang="scss" scoped>
.report-show {
  &__content {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  &__hero {
    position: relative;
    overflow: hidden;
    border-radius: 34px;
    padding: 18px;
    min-height: 360px;
    background:
      radial-gradient(circle at top right, rgba(37, 99, 235, 0.32), transparent 34%),
      radial-gradient(circle at bottom left, rgba(14, 165, 233, 0.22), transparent 34%),
      linear-gradient(145deg, #06172f, #0f2f5f 52%, #0b63c7);
    box-shadow: 0 24px 70px rgba(15, 47, 95, 0.25);
    color: white;
  }

  &__hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(120deg, rgba(255, 255, 255, 0.12), transparent 30%),
      radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.12), transparent 24%);
  }

  &__hero-content {
    position: relative;
    z-index: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__hero-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__status-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    padding: 9px 14px;
    border-radius: 999px;
    background-color: rgba(255, 255, 255, 0.14);
    border: 1px solid rgba(255, 255, 255, 0.22);
    font-size: 1.25rem;
    font-weight: 800;
    backdrop-filter: blur(14px);
  }

  &__main-title {
    margin-top: auto;
    max-width: 760px;

    h1 {
      margin-top: 8px;
      font-size: clamp(3.8rem, 8vw, 7rem);
      line-height: 1.05;
      font-weight: 950;
      letter-spacing: -1px;
    }

    p:last-child {
      margin-top: 14px;
      max-width: 620px;
      color: rgba(255, 255, 255, 0.82);
      font-size: 1.6rem;
      line-height: 1.9;

      strong {
        color: white;
      }
    }
  }

  &__eyebrow {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.4rem;
    font-weight: 800;
  }

  &__hero-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  &__mini-card {
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 22px;
    padding: 14px;
    background-color: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(16px);

    span {
      display: block;
      color: rgba(255, 255, 255, 0.66);
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 4px;
    }

    strong {
      display: block;
      color: white;
      font-size: 1.45rem;
      font-weight: 900;
    }
  }

  &__mini-icon,
  &__section-icon,
  &__task-icon,
  &__week-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__mini-icon {
    width: 46px;
    height: 46px;
    border-radius: 16px;
    color: white;
    font-size: 2rem;
    background-color: rgba(255, 255, 255, 0.14);
  }

  &__summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  &__summary-card,
  &__weeks-section,
  &__week-card,
  &__day-card {
    background-color: var(--white);
    border: 1px solid var(--gray-200);
    box-shadow: 0 12px 34px rgba(17, 24, 39, 0.06);
  }

  &__summary-card {
    border-radius: 26px;
    padding: 20px;
  }

  &__section-head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;

    p {
      color: var(--blue-700);
      font-size: 1.2rem;
      font-weight: 800;
    }

    h3 {
      margin-top: 3px;
      color: var(--gray-950);
      font-size: 1.75rem;
      font-weight: 900;
    }
  }

  &__section-icon {
    width: 52px;
    height: 52px;
    border-radius: 18px;
    color: var(--blue-700);
    background: linear-gradient(135deg, var(--blue-100), var(--sky-50));
    font-size: 2.2rem;
  }

  &__summary-text {
    color: var(--gray-700);
    font-size: 1.42rem;
    line-height: 1.95;
  }

  &__weeks-section {
    border-radius: 28px;
    padding: 20px;
  }

  &__weeks-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 18px;
    flex-wrap: wrap;

    p {
      color: var(--blue-700);
      font-size: 1.25rem;
      font-weight: 800;
      margin-bottom: 5px;
    }

    h2 {
      color: var(--gray-950);
      font-size: 2.4rem;
      font-weight: 950;
    }
  }

  &__weeks-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__week-card {
    overflow: hidden;
    border-radius: 24px;
  }

  &__week-main {
    width: 100%;
    border: 0;
    outline: 0;
    background:
      radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 26%),
      linear-gradient(135deg, rgba(248, 251, 255, 1), rgba(255, 255, 255, 1));
    display: flex;
    align-items: center;
    gap: 14px;
    text-align: start;
    padding: 16px;
    cursor: pointer;
  }

  &__week-number {
    width: 54px;
    height: 54px;
    border-radius: 18px;
    background: linear-gradient(135deg, var(--blue-600), var(--blue-800));
    color: white;
    font-size: 2rem;
  }

  &__week-copy {
    flex: 1;
    min-width: 0;

    h3 {
      color: var(--gray-950);
      font-size: 1.75rem;
      font-weight: 900;
    }

    p {
      margin-top: 6px;
      color: var(--gray-500);
      font-size: 1.25rem;
      font-weight: 700;
    }
  }

  &__week-meta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--blue-700);
    font-size: 1.25rem;
    font-weight: 900;

    span {
      padding: 8px 12px;
      border-radius: 999px;
      background-color: rgba(59, 130, 246, 0.1);
    }
  }

  &__days-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0 14px 14px;
  }

  &__day-card {
    border-radius: 22px;
    padding: 14px;
  }

  &__day-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    span {
      display: block;
      color: var(--blue-700);
      font-size: 1.2rem;
      font-weight: 900;
    }

    strong {
      display: block;
      margin-top: 4px;
      color: var(--gray-950);
      font-size: 1.55rem;
      font-weight: 950;
    }
  }

  &__tasks-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  &__task-box {
    display: flex;
    gap: 10px;
    border-radius: 20px;
    padding: 14px;
    border: 1px solid var(--gray-200);
    background-color: var(--gray-50);

    p {
      color: var(--gray-500);
      font-size: 1.15rem;
      font-weight: 800;
    }

    h4 {
      margin-top: 5px;
      color: var(--gray-950);
      font-size: 1.42rem;
      font-weight: 950;
      line-height: 1.45;
    }

    span {
      display: block;
      margin-top: 6px;
      color: var(--gray-500);
      font-size: 1.12rem;
      font-weight: 700;
      line-height: 1.6;
    }

    &--water {
      background: linear-gradient(135deg, rgba(239, 246, 255, 1), rgba(255, 255, 255, 1));
    }

    &--fertilizer {
      background: linear-gradient(135deg, rgba(240, 253, 244, 1), rgba(255, 255, 255, 1));
    }

    &--spray {
      background: linear-gradient(135deg, rgba(250, 245, 255, 1), rgba(255, 255, 255, 1));
    }
  }

  &__task-icon {
    width: 42px;
    height: 42px;
    border-radius: 15px;
    background-color: white;
    color: var(--blue-700);
    font-size: 1.8rem;
    box-shadow: 0 8px 20px rgba(17, 24, 39, 0.06);
  }

  &__empty {
    min-height: 280px;
    border-radius: 28px;
    background-color: var(--white);
    border: 1px solid var(--gray-200);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    text-align: center;
    padding: 24px;

    &--page {
      min-height: 70vh;
    }

    div {
      width: 70px;
      height: 70px;
      border-radius: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--blue-100), var(--sky-50));
      color: var(--blue-700);
      font-size: 3rem;
    }

    h3 {
      color: var(--gray-950);
      font-size: 2rem;
      font-weight: 950;
    }

    p {
      max-width: 460px;
      color: var(--gray-500);
      font-size: 1.4rem;
      line-height: 1.8;
    }
  }
}

@media (max-width: 900px) {
  .report-show {
    margin-top: -10px;

    &__content {
      gap: 14px;
    }

    &__hero {
      border-radius: 0 0 30px 30px;
      margin: -18px -16px 0;
      min-height: unset;
      padding: 14px 16px 18px;
      box-shadow: 0 18px 42px rgba(15, 47, 95, 0.22);
    }

    &__hero-content {
      gap: 14px;
    }

    &__hero-top {
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: nowrap;
    }

    &__status-pill {
      padding: 8px 12px;
      font-size: 1.1rem;
      white-space: nowrap;
    }

    &__main-title {
      margin-top: 8px;
      text-align: right;

      h1 {
        margin-top: 6px;
        font-size: 4.1rem;
        line-height: 1.05;
      }

      p:last-child {
        margin-top: 10px;
        font-size: 1.28rem;
        line-height: 1.8;
      }
    }

    &__eyebrow {
      font-size: 1.18rem;
    }

    &__hero-cards {
      grid-template-columns: 1fr;
      gap: 9px;
      margin-top: 2px;
    }

    &__mini-card {
      min-height: 74px;
      border-radius: 18px;
      padding: 11px 12px;
      background-color: rgba(255, 255, 255, 0.13);

      span {
        font-size: 1.05rem;
      }

      strong {
        font-size: 1.35rem;
      }
    }

    &__mini-icon {
      width: 44px;
      height: 44px;
      border-radius: 16px;
      font-size: 1.9rem;
    }

    &__summary-grid {
      grid-template-columns: 1fr;
      gap: 14px;
    }

    &__summary-card {
      border-radius: 24px;
      padding: 17px;
    }

    &__section-head {
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 10px;

      p {
        font-size: 1.08rem;
      }

      h3 {
        font-size: 1.55rem;
      }
    }

    &__section-icon {
      width: 48px;
      height: 48px;
      border-radius: 17px;
      font-size: 2rem;
    }

    &__summary-text {
      font-size: 1.27rem;
      line-height: 1.95;
    }

    &__weeks-section {
      border-radius: 24px;
      padding: 15px;
    }

    &__weeks-head {
      align-items: center;
      margin-bottom: 14px;

      p {
        font-size: 1.1rem;
      }

      h2 {
        font-size: 1.9rem;
      }
    }

    &__week-card {
      border-radius: 22px;
    }

    &__week-main {
      padding: 13px;
      align-items: center;
      gap: 11px;
    }

    &__week-number {
      width: 46px;
      height: 46px;
      border-radius: 16px;
      font-size: 1.8rem;
    }

    &__week-copy {
      h3 {
        font-size: 1.48rem;
      }

      p {
        font-size: 1.12rem;
      }
    }

    &__week-meta {
      flex-direction: column-reverse;
      align-items: flex-end;
      gap: 5px;

      span {
        font-size: 1rem;
        padding: 6px 9px;
      }
    }

    &__days-list {
      padding: 0 10px 12px;
      gap: 10px;
    }

    &__day-card {
      border-radius: 20px;
      padding: 12px;
    }

    &__day-head {
      margin-bottom: 10px;

      span {
        font-size: 1.08rem;
      }

      strong {
        font-size: 1.38rem;
      }
    }

    &__tasks-grid {
      grid-template-columns: 1fr;
      gap: 9px;
    }

    &__task-box {
      border-radius: 17px;
      padding: 12px;
      align-items: flex-start;

      p {
        font-size: 1.05rem;
      }

      h4 {
        font-size: 1.26rem;
      }

      span {
        font-size: 1.02rem;
      }
    }

    &__task-icon {
      width: 40px;
      height: 40px;
      border-radius: 14px;
      font-size: 1.65rem;
    }
  }
}

@media (max-width: 430px) {
  .report-show {
    &__hero {
      margin-inline: -14px;
      padding-inline: 14px;
      border-radius: 0 0 28px 28px;
    }

    &__main-title {
      h1 {
        font-size: 3.65rem;
      }

      p:last-child {
        font-size: 1.18rem;
      }
    }

    &__mini-card {
      min-height: 68px;
    }

    &__weeks-head {
      h2 {
        font-size: 1.75rem;
      }
    }
  }
}

@media (min-width: 901px) {
  .report-show {
    &__content {
      max-width: 1180px;
      margin: 0 auto;
      width: 100%;
    }
  }
}
</style>