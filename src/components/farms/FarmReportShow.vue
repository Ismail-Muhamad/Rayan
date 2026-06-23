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
        <section class="report-show__hero glass-panel">
          <div class="report-show__hero-bg"></div>
          <div class="report-show__hero-blobs">
            <div class="blob blob-1"></div>
            <div class="blob blob-2"></div>
            <div class="blob blob-3"></div>
          </div>

          <div class="report-show__hero-content">
            <div class="report-show__hero-top fade-in-up">
              <span class="report-show__status-pill frosted">
                <div class="pulse-dot"></div>
                <BaseIcon name="solar:verified-check-bold" />
                التقرير جاهز
              </span>

              <BaseButton
                class="frosted-btn"
                size="sm"
                @click="router.push({ name: 'show_farm', params: { id: currentFarmId } })"
              >
                <BaseIcon name="solar:arrow-left-outline" />
                رجوع للمزرعة
              </BaseButton>
            </div>

            <div class="report-show__main-title fade-in-up delay-1">
              <p class="report-show__eyebrow">تقرير مهام الشهر</p>
              <h1>{{ reportMonthLabel }}</h1>
              <p>
                جدول الري والتسميد والرش الخاص بمزرعة
                <strong>{{ farmRecord?.name || selectedReport?.farm?.name || '--' }}</strong>
              </p>
            </div>

            <div class="report-show__hero-cards fade-in-up delay-2">
              <article class="report-show__mini-card frosted">
                <div class="report-show__mini-icon">
                  <BaseIcon name="tabler:trees" />
                </div>
                <div>
                  <span>نوع النخيل</span>
                  <strong>{{ selectedReport?.palm_type?.name || '--' }}</strong>
                </div>
              </article>

              <article class="report-show__mini-card frosted">
                <div class="report-show__mini-icon">
                  <BaseIcon name="solar:calendar-outline" />
                </div>
                <div>
                  <span>عدد الأسابيع</span>
                  <strong>{{ mappedWeeks.length }}</strong>
                </div>
              </article>

              <article class="report-show__mini-card frosted">
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

        <section class="report-show__summary-grid fade-in-up delay-3">
          <article class="report-show__summary-card float-hover">
            <div class="report-show__section-head">
              <div class="report-show__section-icon icon-blue">
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

          <article class="report-show__summary-card float-hover">
            <div class="report-show__section-head">
              <div class="report-show__section-icon icon-emerald">
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

        <section class="report-show__weeks-section fade-in-up delay-4">
          <div class="report-show__weeks-head">
            <div>
              <p>تفاصيل المهام</p>
              <h2>أسابيع شهر {{ reportMonthOnly }}</h2>
            </div>

            <BaseButton
              color="blue"
              size="sm"
              class="download-btn shadow-hover"
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
              :class="{ 'is-open': openedWeeks.includes(week.id) }"
            >
              <button
                type="button"
                class="report-show__week-main ripple"
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
                  <div class="arrow-icon">
                    <BaseIcon name="solar:alt-arrow-down-outline" />
                  </div>
                </div>
              </button>

              <div class="report-show__days-wrapper">
                <div class="report-show__days-list">
                  <article
                    v-for="day in week.days"
                    :key="day.id"
                    class="report-show__day-card"
                    :class="{ 'is-open': openedDays.includes(day.id) }"
                  >
                    <button type="button" class="report-show__day-main ripple" @click="toggleDay(day.id)">
                      <div class="report-show__day-head">
                        <div>
                          <span>{{ day.day }}</span>
                          <strong>{{ formatDayDate(day.date) }}</strong>
                        </div>
                      </div>
                      <div class="day-arrow">
                        <BaseIcon name="solar:alt-arrow-down-outline" />
                      </div>
                    </button>

                    <div class="report-show__tasks-wrapper">
                      <div class="report-show__tasks-inner">
                        <div class="report-show__tasks-grid">
                          <!-- الري -->
                          <div
                            v-if="day.irrigation_amount_per_palm_tree !== t('farms.form.no_quantity')"
                            class="report-show__task-box report-show__task-box--water float-hover-light"
                          >
                            <div class="report-show__task-icon icon-water">
                              <BaseIcon name="solar:waterdrops-outline" />
                            </div>
                            <div class="report-show__task-content">
                              <p>الري</p>
                              <h4>{{ day.irrigation_amount_per_palm_tree }}</h4>
                              <span>الإجمالي: {{ day.total_amount_of_irrigation }}</span>
                            </div>
                          </div>

                          <!-- التسميد (يدعم المتعدد) -->
                          <template v-if="day.fertilizations?.length">
                            <div
                              v-for="(fert, index) in day.fertilizations"
                              :key="`fert-${index}`"
                              class="report-show__task-box report-show__task-box--fertilizer float-hover-light"
                            >
                              <div class="report-show__task-icon icon-fert">
                                <BaseIcon name="solar:leaf-outline" />
                              </div>
                              <div class="report-show__task-content">
                                <p>التسميد {{ day.fertilizations.length > 1 ? (index + 1) : '' }}</p>
                                <h4>{{ fert.type_of_fertilization }}</h4>
                                <span>للنخلة: {{ fert.fertilizer_quantity_per_palm_tree }}</span>
                              </div>
                            </div>
                          </template>

                          <!-- الرش -->
                          <div
                            v-if="day.spraying !== t('farms.form.no_quantity')"
                            class="report-show__task-box report-show__task-box--spray float-hover-light"
                          >
                            <div class="report-show__task-icon icon-spray">
                              <BaseIcon name="solar:test-tube-outline" />
                            </div>
                            <div class="report-show__task-content">
                              <p>الرش</p>
                              <h4>{{ day.spraying }}</h4>
                              <span>الكمية: {{ day.amount_of_spray }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="report-show__empty glass-empty fade-in-up delay-4">
            <div class="empty-icon-wrap">
              <BaseIcon name="solar:calendar-minimalistic-outline" />
            </div>
            <h3>لا توجد مهام ظاهرة لهذا الشهر</h3>
            <p>قد يكون التقرير موجودًا، لكن لا توجد أيام بها ري أو تسميد أو رش.</p>
          </div>
        </section>
      </div>

      <div v-else class="report-show__empty report-show__empty--page glass-empty">
        <div class="empty-icon-wrap danger">
          <BaseIcon name="solar:danger-triangle-outline" />
        </div>
        <h3>التقرير غير موجود</h3>
        <p>تأكد من رابط التقرير أو رقم التقرير المرسل في رسالة الواتساب.</p>
        <BaseButton
          color="blue"
          class="frosted-btn frosted-btn--dark shadow-hover"
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
const openedDays = ref([]);

const toggleDay = (dayId) => {
  if (openedDays.value.includes(dayId)) {
    openedDays.value = openedDays.value.filter((id) => id !== dayId);
    return;
  }
  openedDays.value = [...openedDays.value, dayId];
};

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
/*
  =========================================
  Premium Glassmorphism & UI Enhancements
  =========================================
*/

/* --- Variables & Core Utilities --- */
:root {
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  --glass-blur: blur(12px);
  --primary-gradient: linear-gradient(135deg, #0f2f5f, #0b63c7);
  --accent-blue: #3b82f6;
  --accent-green: #10b981;
  --accent-purple: #8b5cf6;
}

.report-show {
  --anim-speed: 0.4s;
  --anim-ease: cubic-bezier(0.16, 1, 0.3, 1);

  font-family: 'Inter', system-ui, -apple-system, sans-serif;

  &__content {
    display: flex;
    flex-direction: column;
    gap: 24px;
    position: relative;
    z-index: 1;
  }

  /* --- Animations --- */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulseDot {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    }
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
    }
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    }
  }

  @keyframes blobMove1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
  }

  @keyframes blobMove2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-30px, 40px) scale(1.2); }
    66% { transform: translate(20px, -20px) scale(0.8); }
  }

  .fade-in-up {
    animation: fadeInUp var(--anim-speed) var(--anim-ease) forwards;
    opacity: 0;
  }

  .delay-1 { animation-delay: 0.1s; }
  .delay-2 { animation-delay: 0.2s; }
  .delay-3 { animation-delay: 0.3s; }
  .delay-4 { animation-delay: 0.4s; }

  /* --- Hero Section --- */
  &__hero {
    position: relative;
    overflow: hidden;
    border-radius: 32px;
    padding: 32px;
    min-height: 380px;
    background: #0f172a;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.25);
    color: white;
    isolation: isolate;

    &.glass-panel {
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
  }

  &__hero-blobs {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    filter: blur(60px);
    opacity: 0.6;

    .blob {
      position: absolute;
      border-radius: 50%;
      animation: 10s infinite alternate ease-in-out;
    }

    .blob-1 {
      top: -10%; left: -10%; width: 50%; height: 60%;
      background: radial-gradient(circle, #3b82f6, transparent);
      animation-name: blobMove1;
    }

    .blob-2 {
      bottom: -20%; right: -10%; width: 60%; height: 70%;
      background: radial-gradient(circle, #0ea5e9, transparent);
      animation-name: blobMove2;
    }

    .blob-3 {
      top: 40%; left: 40%; width: 40%; height: 40%;
      background: radial-gradient(circle, #6366f1, transparent);
      opacity: 0.4;
    }
  }

  &__hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(120deg, rgba(255, 255, 255, 0.05), transparent 40%),
      url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+') repeat;
    z-index: -1;
    opacity: 0.5;
  }

  &__hero-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
    height: 100%;
  }

  &__hero-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__status-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 18px;
    border-radius: 999px;
    font-size: 1.35rem;
    font-weight: 800;
    
    &.frosted {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      background-color: #60a5fa;
      border-radius: 50%;
      animation: pulseDot 2s infinite;
    }
  }

  .frosted-btn {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    &--dark {
      background: rgba(15, 23, 42, 0.05);
      color: var(--blue-700);
      border: 1px solid var(--blue-200);

      &:hover {
        background: rgba(59, 130, 246, 0.1);
      }
    }
  }

  &__main-title {
    margin-top: auto;
    max-width: 800px;

    h1 {
      margin-top: 12px;
      font-size: clamp(4rem, 8vw, 7.5rem);
      line-height: 1.1;
      font-weight: 950;
      letter-spacing: -1.5px;
      background: linear-gradient(to right, #ffffff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    p:last-child {
      margin-top: 16px;
      max-width: 650px;
      color: rgba(255, 255, 255, 0.85);
      font-size: 1.65rem;
      line-height: 1.8;

      strong {
        color: white;
        background: rgba(255,255,255,0.15);
        padding: 2px 8px;
        border-radius: 6px;
      }
    }
  }

  &__eyebrow {
    color: #93c5fd;
    font-size: 1.5rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  &__hero-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-top: 16px;
  }

  &__mini-card {
    display: flex;
    align-items: center;
    gap: 16px;
    border-radius: 24px;
    padding: 16px 20px;
    transition: transform 0.3s ease, background 0.3s ease;

    &.frosted {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    &:hover {
      transform: translateY(-4px);
      background: rgba(255, 255, 255, 0.12);
    }

    span {
      display: block;
      color: rgba(255, 255, 255, 0.7);
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 4px;
    }

    strong {
      display: block;
      color: white;
      font-size: 1.6rem;
      font-weight: 900;
    }
  }

  &__mini-icon {
    width: 52px;
    height: 52px;
    border-radius: 18px;
    color: white;
    font-size: 2.2rem;
    background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05));
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 1px 1px rgba(255,255,255,0.3);
  }

  /* --- Summary Cards --- */
  &__summary-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .float-hover {
    transition: transform var(--anim-speed) var(--anim-ease), box-shadow var(--anim-speed) var(--anim-ease);
    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
    }
  }

  &__summary-card {
    background-color: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
  }

  &__section-head {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;

    p {
      color: var(--gray-500);
      font-size: 1.3rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    h3 {
      margin-top: 4px;
      color: var(--gray-950);
      font-size: 1.85rem;
      font-weight: 900;
    }
  }

  &__section-icon {
    width: 56px;
    height: 56px;
    border-radius: 20px;
    font-size: 2.4rem;
    display: flex;
    align-items: center;
    justify-content: center;

    &.icon-blue {
      color: var(--blue-700);
      background: linear-gradient(135deg, #dbeafe, #eff6ff);
      box-shadow: 0 8px 16px rgba(59, 130, 246, 0.15);
    }

    &.icon-emerald {
      color: #047857;
      background: linear-gradient(135deg, #d1fae5, #ecfdf5);
      box-shadow: 0 8px 16px rgba(16, 185, 129, 0.15);
    }
  }

  &__summary-text {
    color: var(--gray-600);
    font-size: 1.5rem;
    line-height: 1.9;
  }

  /* --- Weeks Section --- */
  &__weeks-section {
    background-color: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: 32px;
    padding: 28px;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
  }

  &__weeks-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;

    p {
      color: var(--blue-600);
      font-size: 1.35rem;
      font-weight: 800;
      margin-bottom: 6px;
    }

    h2 {
      color: var(--gray-950);
      font-size: 2.6rem;
      font-weight: 950;
      letter-spacing: -0.5px;
    }
  }

  .shadow-hover {
    transition: all 0.3s ease;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.25);
    }
  }

  &__weeks-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__week-card {
    border-radius: 24px;
    border: 1px solid var(--gray-200);
    background: var(--white);
    transition: all 0.4s var(--anim-ease);
    overflow: hidden;

    &.is-open {
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
      border-color: var(--blue-300);

      .report-show__week-main {
        background: linear-gradient(to right, #f8fafc, #ffffff);
      }

      .arrow-icon {
        transform: rotate(180deg);
        background: var(--blue-100);
        color: var(--blue-700);
      }
    }
  }

  &__week-main {
    width: 100%;
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 20px;
    cursor: pointer;
    text-align: right;
    transition: background 0.3s ease;

    &:hover {
      background: #f8fafc;
    }

    &.ripple {
      position: relative;
      overflow: hidden;
    }
  }

  &__week-number {
    width: 60px;
    height: 60px;
    border-radius: 20px;
    background: linear-gradient(135deg, var(--blue-600), var(--blue-800));
    color: white;
    font-size: 2.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.2);
  }

  &__week-copy {
    flex: 1;

    h3 {
      color: var(--gray-900);
      font-size: 1.85rem;
      font-weight: 900;
    }

    p {
      margin-top: 6px;
      color: var(--gray-500);
      font-size: 1.3rem;
      font-weight: 700;
    }
  }

  &__week-meta {
    display: flex;
    align-items: center;
    gap: 12px;

    span {
      padding: 8px 14px;
      border-radius: 999px;
      background-color: var(--blue-50);
      color: var(--blue-700);
      font-size: 1.3rem;
      font-weight: 800;
    }
  }

  .arrow-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--gray-100);
    color: var(--gray-500);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    transition: transform 0.4s var(--anim-ease), background 0.3s, color 0.3s;
  }

  /* --- Days List --- */
  &__days-wrapper {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.4s var(--anim-ease);
  }

  .is-open .report-show__days-wrapper {
    grid-template-rows: 1fr;
  }

  &__days-list {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 0 20px 20px;
  }

  &__day-card {
    border-radius: 24px;
    background: #fdfdfd;
    border: 1px solid var(--gray-100);
    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    overflow: hidden;
    transition: all 0.4s var(--anim-ease);

    &.is-open {
      border-color: var(--blue-200);
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);

      .day-arrow {
        transform: rotate(180deg);
        background: var(--blue-100);
        color: var(--blue-700);
      }
    }
  }

  &__day-main {
    width: 100%;
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    cursor: pointer;
    text-align: right;
    transition: background 0.3s ease;

    &:hover {
      background: #f8fafc;
    }

    &.ripple {
      position: relative;
      overflow: hidden;
    }
  }

  &__day-head {
    display: flex;
    align-items: center;
    gap: 16px;

    span {
      display: block;
      color: var(--blue-600);
      font-size: 1.25rem;
      font-weight: 900;
    }

    strong {
      display: block;
      margin-top: 4px;
      color: var(--gray-950);
      font-size: 1.65rem;
      font-weight: 950;
    }
  }

  .day-arrow {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--gray-50);
    color: var(--gray-400);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    transition: transform 0.4s var(--anim-ease), background 0.3s, color 0.3s;
  }

  &__tasks-wrapper {
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: max-height 0.5s ease, opacity 0.3s ease;
  }

  &__day-card.is-open &__tasks-wrapper {
    max-height: 2000px;
    opacity: 1;
  }

  &__tasks-inner {
    min-height: 0;
  }

  /* --- Tasks Grid --- */
  &__tasks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    padding: 0 20px 20px;
  }

  .float-hover-light {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
    }
  }

  &__task-box {
    display: flex;
    gap: 16px;
    border-radius: 20px;
    padding: 18px;
    border: 1px solid rgba(0,0,0,0.04);
    
    p {
      color: var(--gray-600);
      font-size: 1.25rem;
      font-weight: 800;
      margin-bottom: 6px;
    }

    h4 {
      color: var(--gray-950);
      font-size: 1.55rem;
      font-weight: 950;
      line-height: 1.4;
    }

    span {
      display: block;
      margin-top: 8px;
      color: var(--gray-500);
      font-size: 1.2rem;
      font-weight: 700;
    }

    &--water {
      background: linear-gradient(145deg, #f0f9ff, #ffffff);
      border-color: #e0f2fe;
    }

    &--fertilizer {
      background: linear-gradient(145deg, #ecfdf5, #ffffff);
      border-color: #d1fae5;
    }

    &--spray {
      background: linear-gradient(145deg, #faf5ff, #ffffff);
      border-color: #f3e8ff;
    }
  }

  &__task-icon {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.2rem;
    box-shadow: 0 8px 16px rgba(0,0,0,0.05);

    &.icon-water {
      background: white;
      color: #0ea5e9;
    }
    &.icon-fert {
      background: white;
      color: #10b981;
    }
    &.icon-spray {
      background: white;
      color: #a855f7;
    }
  }

  &__task-content {
    flex: 1;
  }

  /* --- Empty State --- */
  &__empty {
    min-height: 300px;
    border-radius: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    text-align: center;
    padding: 32px;
    border: 1px dashed var(--gray-300);

    &.glass-empty {
      background: linear-gradient(to bottom, #f8fafc, #ffffff);
    }

    &--page {
      min-height: 70vh;
      border: 1px solid var(--gray-200);
    }

    .empty-icon-wrap {
      width: 80px;
      height: 80px;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--blue-100), var(--blue-50));
      color: var(--blue-600);
      font-size: 3.5rem;
      box-shadow: 0 12px 24px rgba(59, 130, 246, 0.15);

      &.danger {
        background: linear-gradient(135deg, #fee2e2, #fef2f2);
        color: #ef4444;
        box-shadow: 0 12px 24px rgba(239, 68, 68, 0.15);
      }
    }

    h3 {
      color: var(--gray-950);
      font-size: 2.2rem;
      font-weight: 950;
      margin-top: 8px;
    }

    p {
      max-width: 500px;
      color: var(--gray-500);
      font-size: 1.5rem;
      line-height: 1.8;
    }
  }
}

/* --- Media Queries --- */
@media (max-width: 900px) {
  .report-show {
    margin-top: -16px;

    &__content {
      gap: 16px;
    }

    &__hero {
      border-radius: 0 0 36px 36px;
      margin: -20px -16px 0;
      padding: 24px 20px;
      min-height: auto;
    }

    &__hero-top {
      flex-wrap: nowrap;
    }

    &__status-pill {
      font-size: 1.2rem;
      padding: 8px 14px;
      white-space: nowrap;
    }

    &__main-title {
      text-align: right;
      
      h1 {
        font-size: 4.5rem;
      }
      p:last-child {
        font-size: 1.4rem;
      }
    }

    &__hero-cards {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    &__mini-card {
      padding: 14px 16px;
      min-height: 80px;

      span { font-size: 1.15rem; }
      strong { font-size: 1.45rem; }
    }

    &__mini-icon {
      width: 48px;
      height: 48px;
      font-size: 2rem;
    }

    &__summary-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    &__summary-card {
      padding: 20px;
      border-radius: 24px;
    }

    &__section-head {
      h3 { font-size: 1.65rem; }
    }

    &__section-icon {
      width: 50px;
      height: 50px;
      font-size: 2.2rem;
    }

    &__weeks-section {
      padding: 20px;
      border-radius: 28px;
    }

    &__weeks-head {
      align-items: flex-start;
      flex-direction: column;
      gap: 12px;

      h2 { font-size: 2.2rem; }
    }

    &__week-main {
      padding: 16px;
      gap: 14px;
    }

    &__week-number {
      width: 50px;
      height: 50px;
      font-size: 2rem;
    }

    &__week-copy h3 { font-size: 1.6rem; }
    &__week-copy p { font-size: 1.2rem; }

    &__week-meta {
      flex-direction: column-reverse;
      align-items: flex-end;
      gap: 8px;

      span {
        font-size: 1.15rem;
        padding: 6px 10px;
      }
    }

    &__days-list {
      padding: 0 16px 16px;
      gap: 12px;
    }

    &__day-card {
      padding: 16px;
    }

    &__day-head strong { font-size: 1.45rem; }

    &__tasks-grid {
      grid-template-columns: 1fr;
    }
  }
}

@media (min-width: 901px) {
  .report-show__content {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
}
</style>
