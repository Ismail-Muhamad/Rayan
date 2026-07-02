<template>
  <div class="rayaan-report-host">
    <div
      v-if="reportData"
      id="monthly-print-report"
      class="rayaan-monthly-report"
      dir="rtl"
    >
      <section class="report-page report-page--cover">
        <div class="cover-hero">
          <div class="brand-block">
            <img src="/apple-touch-icon.png" class="brand-mark" alt="Rayaan Logo" />
            <div>
              <h1>ريآن للإستشارات والتوريدات الزراعية</h1>
              <p>شريكك الحقيقي في إدارة مزرعتك</p>
            </div>
          </div>

          <div class="report-badge">تقرير شهري</div>
        </div>

        <div class="cover-title">
          <p class="eyebrow">ملخص المهام المزرعية</p>
          <h2>التقرير الشهري للمهام الزراعية</h2>
          <div class="month-chip">
            {{ monthLabel }}
          </div>
        </div>

        <div class="info-panel">
          <div class="info-item">
            <span>اسم المزرعة</span>
            <strong>{{ safe(reportData.farm?.name) }}</strong>
          </div>
          <div class="info-item">
            <span>اسم العميل</span>
            <strong>{{ safe(reportData.customerName) }}</strong>
          </div>
          <div class="info-item">
            <span>الموقع</span>
            <strong>{{ safe(reportData.farm?.location) }}</strong>
          </div>
          <div class="info-item">
            <span>صنف النخيل</span>
            <strong>{{ safe(reportData.palmType?.name) }}</strong>
          </div>
          <div class="info-item">
            <span>عدد النخيل</span>
            <strong>{{ number(reportData.palmType?.number_of_trees || reportData.palmType?.palm_count) }} نخلة</strong>
          </div>
          <div class="info-item">
            <span>عمر النخيل</span>
            <strong>{{ safe(reportData.palmType?.palm_age) }} سنة</strong>
          </div>
        </div>

        <div class="summary-grid summary-grid--cover">
          <article class="metric-card metric-card--blue">
            <span>إجمالي المهام</span>
            <strong>{{ number(summary.total) }}</strong>
          </article>
          <article class="metric-card metric-card--green">
            <span>المهام المنجزة</span>
            <strong>{{ number(summary.completed) }}</strong>
          </article>
          <article class="metric-card metric-card--orange">
            <span>المهام المتبقية</span>
            <strong>{{ number(summary.pending) }}</strong>
          </article>
          <article class="metric-card metric-card--purple">
            <span>نسبة الإنجاز</span>
            <strong>{{ summary.completionRate }}%</strong>
          </article>
        </div>

        <div class="performance-box">
          <h3>الملخص التنفيذي للشهر</h3>
          <p>
            خلال {{ monthLabel }} تم تسجيل {{ number(summary.total) }} مهمة زراعية على صنف
            {{ safe(reportData.palmType?.name) }}. تم إنجاز {{ number(summary.completed) }} مهمة،
            ويتبقى {{ number(summary.pending) }} مهمة تحتاج متابعة. تقييم الأداء العام لهذا الشهر:
            <strong>{{ performanceLabel }}</strong>.
          </p>
        </div>

        <h2 class="section-title">ملخص المهام حسب النوع</h2>
        <div class="type-cards">
          <article class="type-card">
            <h3>الري</h3>
            <div class="type-stats">
              <span>إجمالي: {{ number(typeSummary.irrigation.total) }}</span>
              <span>منجز: {{ number(typeSummary.irrigation.completed) }}</span>
              <span>متبقي: {{ number(typeSummary.irrigation.pending) }}</span>
            </div>
            <p>إجمالي المياه المسجل: <strong>{{ quantityOrDash(irrigationTotal) }}</strong></p>
          </article>
          <article class="type-card">
            <h3>التسميد</h3>
            <div class="type-stats">
              <span>إجمالي: {{ number(typeSummary.fertilization.total) }}</span>
              <span>منجز: {{ number(typeSummary.fertilization.completed) }}</span>
              <span>متبقي: {{ number(typeSummary.fertilization.pending) }}</span>
            </div>
            <p>عدد المواد/الأسمدة المجمعة: <strong>{{ number(fertilizerGroups.length) }}</strong></p>
          </article>
          <article class="type-card">
            <h3>الرش</h3>
            <div class="type-stats">
              <span>إجمالي: {{ number(typeSummary.spraying.total) }}</span>
              <span>منجز: {{ number(typeSummary.spraying.completed) }}</span>
              <span>متبقي: {{ number(typeSummary.spraying.pending) }}</span>
            </div>
            <p>عدد المبيدات/المواد المجمعة: <strong>{{ number(sprayingGroups.length) }}</strong></p>
          </article>
        </div>

        <div class="cover-footer" style="margin-top: 15px; margin-bottom: 30px;">
          <span>تاريخ إنشاء التقرير: {{ currentDate }}</span>
          <span>تم الإنشاء بواسطة نظام ريآن لإدارة مزارع النخيل</span>
        </div>

        <h2 class="section-title">ملخص الأسابيع</h2>
        <table class="report-table">
          <thead>
            <tr>
              <th>الأسبوع</th>
              <th>المدى</th>
              <th>إجمالي</th>
              <th>منجز</th>
              <th>متبقي</th>
              <th>نسبة الإنجاز</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="week in weeklySummary" :key="week.key">
              <td class="strong-cell">{{ week.name }}</td>
              <td dir="ltr" style="text-align: right;">{{ week.range }}</td>
              <td>{{ number(week.total) }}</td>
              <td class="done-cell">{{ number(week.completed) }}</td>
              <td class="pending-cell">{{ number(week.pending) }}</td>
              <td dir="ltr" style="text-align: right;">{{ week.rate }}%</td>
            </tr>
          </tbody>
        </table>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
          <div>
            <h2 class="section-title" style="margin-top: 0;">التسميد المجمع</h2>
            <GroupedTable :items="fertilizerGroups" empty-text="لا توجد بيانات تسميد قابلة للتجميع." />
          </div>
          <div>
            <h2 class="section-title" style="margin-top: 0;">الرش المجمع</h2>
            <GroupedTable :items="sprayingGroups" empty-text="لا توجد بيانات رش قابلة للتجميع." />
          </div>
        </div>

        <h2 class="section-title section-title--warning" style="margin-top: 15px;">المهام غير المنفذة (متبقية)</h2>
        <TaskTable :items="pendingTasks" empty-text="لا توجد مهام معلقة، كل مهام الشهر منفذة." show-status compact />

        <div v-if="completedTasks.length > 0">
          <h2 class="section-title" style="margin-top: 15px;">المهام المنفذة</h2>
          <TaskTable :items="completedTasks" empty-text="لا توجد مهام منفذة." show-status compact />
        </div>

        <div class="recommendation-box" style="margin-top: 15px;">
          <h3>ملاحظات وتوصيات</h3>
          <p v-if="monthlyOperations.length">
            <span v-for="op in monthlyOperations" :key="op.title || op.name">{{ op.title || op.name || 'عملية عامة' }}: {{ op.description || op.notes || '-' }} | </span>
          </p>
          <p v-else>
            لا توجد ملاحظات أو عمليات عامة خاصة لهذا الشهر.
          </p>
        </div>

        <ReportFooter style="margin-top: auto;" />
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h } from 'vue';

const props = defineProps({
  reportData: {
    type: Object,
    required: true,
  },
});

const arabicDateFormatter = new Intl.DateTimeFormat('ar-EG', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const currentDate = computed(() => arabicDateFormatter.format(new Date()));

const monthLabel = computed(() => {
  const month = props.reportData?.month;
  if (!month) return 'الشهر المحدد';
  return month.monthName || month.name || `${month.month || ''} ${month.year || ''}`.trim() || 'الشهر المحدد';
});

const flatTasks = computed(() => {
  const weeks = props.reportData?.weeks || [];
  const result = [];

  weeks.forEach((week, weekIndex) => {
    const weekName = week.weekName || week.title || `الأسبوع ${weekIndex + 1}`;
    const days = week.days || [];

    days.forEach((day) => {
      const tasks = day.tasks || [];
      tasks.forEach((task, taskIndex) => {
        const quantitativeData = normalizeQuantitativeData(task);
        result.push({
          ...task,
          id: task.id || `${weekIndex}-${day.date || day.dayName}-${taskIndex}`,
          weekName,
          weekRange: week.range || getWeekRange(days),
          dayName: day.dayName || day.name || '-',
          date: task.date || day.date || null,
          type: normalizeTaskType(task.type || task.task_type),
          title: task.title || task.name || task.operation_key || 'مهمة زراعية',
          notes: task.notes || task.description || task.content || '',
          isDone: Boolean(task.isDone ?? task.is_completed ?? task.completed),
          quantitativeData,
        });
      });
    });
  });

  const directTasks = props.reportData?.tasks || [];
  directTasks.forEach((task, index) => {
    const quantitativeData = normalizeQuantitativeData(task);
    result.push({
      ...task,
      id: task.id || `direct-${index}`,
      weekName: task.weekName || task.week_name || '-',
      weekRange: task.weekRange || task.week_range || '-',
      dayName: task.dayName || task.day_name || '-',
      date: task.date || null,
      type: normalizeTaskType(task.type || task.task_type),
      title: task.title || task.name || task.operation_key || 'مهمة زراعية',
      notes: task.notes || task.description || task.content || '',
      isDone: Boolean(task.isDone ?? task.is_completed ?? task.completed),
      quantitativeData,
    });
  });

  const unique = new Map();
  result.forEach((task) => unique.set(task.id, task));
  return Array.from(unique.values());
});

const monthlyOperations = computed(() => {
  const explicit = props.reportData?.monthlyOperations || props.reportData?.month?.operations || props.reportData?.operations || [];
  return Array.isArray(explicit) ? explicit : [];
});

const summary = computed(() => {
  const total = flatTasks.value.length;
  const completed = flatTasks.value.filter((task) => task.isDone).length;
  const pending = Math.max(total - completed, 0);
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  return { total, completed, pending, completionRate };
});

const performanceLabel = computed(() => {
  const rate = summary.value.completionRate;
  if (rate >= 90) return 'ممتاز';
  if (rate >= 70) return 'جيد';
  if (rate >= 50) return 'متوسط ويحتاج متابعة';
  return 'يحتاج متابعة عاجلة';
});

const activeDaysCount = computed(() => new Set(flatTasks.value.map((task) => task.date).filter(Boolean)).size);

const weeklySummary = computed(() => {
  const weeks = props.reportData?.weeks || [];

  if (weeks.length) {
    return weeks.map((week, index) => {
      const weekName = week.weekName || week.title || `الأسبوع ${index + 1}`;
      const weekTasks = flatTasks.value.filter((task) => task.weekName === weekName);
      const total = weekTasks.length;
      const completed = weekTasks.filter((task) => task.isDone).length;
      const pending = Math.max(total - completed, 0);

      return {
        key: `${weekName}-${index}`,
        name: weekName,
        range: week.range || getWeekRange(week.days || []),
        total,
        completed,
        pending,
        rate: total ? Math.round((completed / total) * 100) : 0,
      };
    });
  }

  return [];
});

const typeSummary = computed(() => ({
  irrigation: buildTypeSummary('irrigation'),
  fertilization: buildTypeSummary('fertilization'),
  spraying: buildTypeSummary('spraying'),
}));

const tasksByType = computed(() => ({
  irrigation: flatTasks.value.filter((task) => task.type === 'irrigation'),
  fertilization: flatTasks.value.filter((task) => task.type === 'fertilization'),
  spraying: flatTasks.value.filter((task) => task.type === 'spraying'),
}));

const pendingTasks = computed(() => flatTasks.value.filter((task) => !task.isDone));
const completedTasks = computed(() => flatTasks.value.filter((task) => task.isDone));

const irrigationTotal = computed(() => {
  return tasksByType.value.irrigation.reduce((total, task) => {
    const q = task.quantitativeData || {};
    const value = numeric(
      q.total_amount_of_irrigation ||
      q.total_irrigation_amount ||
      q.irrigation_total ||
      q.water_total ||
      q.irrigation_amount
    );
    return total + value;
  }, 0);
});

const fertilizerGroups = computed(() => groupByMaterial(tasksByType.value.fertilization, [
  'type_of_fertilization',
  'fertilizer_name',
  'fertilizer_type',
  'fertilizer',
  'material_name',
]));

const sprayingGroups = computed(() => groupByMaterial(tasksByType.value.spraying, [
  'pesticide_name',
  'pesticide_type',
  'pesticide',
  'spraying_material',
  'material_name',
]));

function buildTypeSummary(type) {
  const items = flatTasks.value.filter((task) => task.type === type);
  const total = items.length;
  const completed = items.filter((task) => task.isDone).length;
  return {
    total,
    completed,
    pending: Math.max(total - completed, 0),
  };
}

function normalizeTaskType(type) {
  const value = String(type || '').toLowerCase();
  if (value.includes('irrigation') || value.includes('ري')) return 'irrigation';
  if (value.includes('fertilization') || value.includes('fertilizer') || value.includes('تسميد')) return 'fertilization';
  if (value.includes('spraying') || value.includes('spray') || value.includes('رش')) return 'spraying';
  return value || 'other';
}

function normalizeQuantitativeData(task) {
  const raw = task.quantitativeData || task.quantitative_data || task.data || {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw || {};
}

function groupByMaterial(tasks, nameKeys) {
  const map = new Map();

  tasks.forEach((task) => {
    const q = task.quantitativeData || {};
    const name = getFirstValue(q, nameKeys) || task.title || 'غير محدد';
    const quantity = numeric(
      q.total_quantity ||
      q.quantity_total ||
      q.total_kg ||
      q.fertilizer_quantity_total ||
      q.pesticide_quantity_total ||
      q.quantity ||
      q.fertilizer_quantity_per_palm_tree ||
      q.grams_per_palm_tree
    );

    const current = map.get(name) || {
      name,
      totalTasks: 0,
      completed: 0,
      pending: 0,
      quantity: 0,
    };

    current.totalTasks += 1;
    current.completed += task.isDone ? 1 : 0;
    current.pending += task.isDone ? 0 : 1;
    current.quantity += quantity;
    map.set(name, current);
  });

  return Array.from(map.values());
}

function getFirstValue(source, keys) {
  for (const key of keys) {
    if (source?.[key]) return source[key];
  }
  return '';
}

function getWeekRange(days) {
  const dates = (days || []).map((day) => day.date).filter(Boolean);
  if (!dates.length) return '-';
  return `${formatShortDate(dates[0])} - ${formatShortDate(dates[dates.length - 1])}`;
}

function formatShortDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short' }).format(date);
}

function getTaskTypeName(type) {
  const types = {
    irrigation: 'ري',
    fertilization: 'تسميد',
    spraying: 'رش',
    other: 'أخرى',
  };
  return types[type] || type || 'مهمة';
}

function numeric(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function number(value) {
  return new Intl.NumberFormat('en-US').format(numeric(value));
}

function quantityOrDash(value) {
  const n = numeric(value);
  return n ? `${number(n)} لتر / وحدة مسجلة` : '-';
}

function safe(value) {
  return value || '-';
}

const ReportHeader = defineComponent({
  props: { monthLabel: { type: String, required: true } },
  setup(componentProps) {
    return () => h('header', { class: 'page-header' }, [
      h('div', { class: 'page-brand' }, [
        h('div', { class: 'mini-mark' }, 'ر'),
        h('div', [
          h('strong', 'ريآن للإستشارات والتوريدات الزراعية'),
          h('span', 'التقرير الشهري للمهام الزراعية'),
        ]),
      ]),
      h('div', { class: 'page-month' }, componentProps.monthLabel),
    ]);
  },
});

const ReportFooter = defineComponent({
  setup() {
    return () => h('footer', { class: 'page-footer' }, [
      h('span', 'تم إنشاء هذا التقرير بواسطة نظام ريآن لإدارة مزارع النخيل'),
      h('span', new Date().toLocaleDateString('ar-EG')),
    ]);
  },
});

const TaskTable = defineComponent({
  props: {
    items: { type: Array, default: () => [] },
    emptyText: { type: String, default: 'لا توجد بيانات.' },
    showStatus: { type: Boolean, default: false },
    compact: { type: Boolean, default: false },
  },
  setup(componentProps) {
    return () => {
      if (!componentProps.items.length) {
        return h('div', { class: 'empty-box' }, componentProps.emptyText);
      }

      return h('table', { class: ['report-table', componentProps.compact ? 'report-table--compact' : ''] }, [
        h('thead', [
          h('tr', [
            h('th', 'التاريخ'),
            h('th', 'الأسبوع'),
            h('th', 'النوع'),
            h('th', 'المهمة'),
            h('th', 'ملاحظات'),
            componentProps.showStatus ? h('th', 'الحالة') : null,
          ]),
        ]),
        h('tbody', componentProps.items.map((task) => h('tr', { key: task.id }, [
          h('td', formatShortDate(task.date)),
          h('td', task.weekName || '-'),
          h('td', getTaskTypeName(task.type)),
          h('td', { class: 'strong-cell' }, task.title || '-'),
          h('td', task.notes || '-'),
          componentProps.showStatus
            ? h('td', { class: task.isDone ? 'done-cell' : 'pending-cell' }, task.isDone ? 'منجز' : 'غير منجز')
            : null,
        ]))),
      ]);
    };
  },
});

const GroupedTable = defineComponent({
  props: {
    items: { type: Array, default: () => [] },
    emptyText: { type: String, default: 'لا توجد بيانات.' },
  },
  setup(componentProps) {
    return () => {
      if (!componentProps.items.length) {
        return h('div', { class: 'empty-box' }, componentProps.emptyText);
      }

      return h('table', { class: 'report-table' }, [
        h('thead', [
          h('tr', [
            h('th', 'المادة'),
            h('th', 'عدد المهام'),
            h('th', 'منجز'),
            h('th', 'متبقي'),
            h('th', 'إجمالي الكمية المسجلة'),
          ]),
        ]),
        h('tbody', componentProps.items.map((item) => h('tr', { key: item.name }, [
          h('td', { class: 'strong-cell' }, item.name),
          h('td', number(item.totalTasks)),
          h('td', { class: 'done-cell' }, number(item.completed)),
          h('td', { class: 'pending-cell' }, number(item.pending)),
          h('td', item.quantity ? number(item.quantity) : '-'),
        ]))),
      ]);
    };
  },
});
</script>

<style lang="scss">
.rayaan-report-host {
  direction: ltr;
  position: absolute;
  left: 0;
  top: -99999px;
  width: 210mm;
  overflow: visible;
}

.rayaan-monthly-report {
  width: 210mm;
  direction: rtl;
  color: #0f172a;
  background: #ffffff;
  font-family: 'Cairo', 'Tajawal', 'Arial', sans-serif;
  line-height: 1.65;
}

.report-page {
  position: relative;
  box-sizing: border-box;
  width: 210mm;
  padding: 16mm 14mm 18mm;
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.08), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  overflow: hidden;
}

.report-page:last-child {
  page-break-after: auto;
}

.report-page--cover {
  display: flex;
  flex-direction: column;
  gap: 11mm;
  background:
    radial-gradient(circle at 92% 9%, rgba(34, 197, 94, 0.18), transparent 22%),
    radial-gradient(circle at 12% 18%, rgba(37, 99, 235, 0.15), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.cover-hero,
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 3px solid #2563eb;
}

.brand-block,
.page-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-mark,
.mini-mark {
  display: grid;
  place-items: center;
  color: #ffffff;
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #16a34a 100%);
  box-shadow: 0 12px 26px rgba(37, 99, 235, 0.22);
}

.brand-mark {
  width: 64px;
  height: 64px;
  border-radius: 22px;
  font-size: 34px;
  font-weight: 900;
}

.mini-mark {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  font-size: 22px;
  font-weight: 900;
}

.brand-block h1 {
  margin: 0;
  font-size: 23px;
  font-weight: 900;
  color: #0f172a;
}

.brand-block p,
.page-brand span {
  display: block;
  margin: 3px 0 0;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.page-brand strong {
  display: block;
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}

.report-badge,
.page-month {
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 900;
  font-size: 13px;
}

.cover-title {
  padding: 15mm 0 4mm;
}

.eyebrow {
  margin: 0 0 8px;
  color: #16a34a;
  font-size: 15px;
  font-weight: 900;
}

.cover-title h2 {
  margin: 0;
  font-size: 36px;
  line-height: 1.35;
  font-weight: 900;
  color: #0f172a;
}

.month-chip {
  display: inline-flex;
  margin-top: 12px;
  padding: 9px 18px;
  border-radius: 999px;
  color: #ffffff;
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  font-weight: 900;
}

.info-panel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 14px;
  border-radius: 22px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.info-item {
  padding: 10px 12px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #eaf0f7;
  min-width: 0;
}

.info-item span {
  display: block;
  margin-bottom: 4px;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
}


.info-item strong {
  display: block;
  color: #0f172a;
  font-size: 9px;
  font-weight: 900;
  line-height: 1.7;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 13mm;
}

.summary-grid--cover {
  margin-bottom: 0;
}

.metric-card {
  min-height: 82px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
}

.metric-card span {
  display: block;
  margin-bottom: 9px;
  font-size: 11px;
  font-weight: 900;
  color: #64748b;
}

.metric-card strong {
  display: block;
  font-size: 26px;
  line-height: 1;
  font-weight: 900;
}

.metric-card--blue { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
.metric-card--green { background: #ecfdf5; border-color: #bbf7d0; color: #15803d; }
.metric-card--orange { background: #fff7ed; border-color: #fed7aa; color: #c2410c; }
.metric-card--purple { background: #f5f3ff; border-color: #ddd6fe; color: #7c3aed; }
.metric-card--cyan { background: #ecfeff; border-color: #a5f3fc; color: #0e7490; }
.metric-card--amber { background: #fffbeb; border-color: #fde68a; color: #b45309; }
.metric-card--rose { background: #fff1f2; border-color: #fecdd3; color: #be123c; }
.metric-card--slate { background: #f8fafc; border-color: #cbd5e1; color: #334155; }

.performance-box,
.recommendation-box,
.empty-box {
  border-radius: 20px;
  padding: 16px 18px;
  background: #f8fbff;
  border: 1px solid #dbeafe;
}

.performance-box h3,
.recommendation-box h3 {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 900;
  color: #1e3a8a;
}

.performance-box p,
.recommendation-box p {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.cover-footer,
.page-footer {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
}

.section-title {
  margin: 0 0 10px;
  padding: 9px 12px;
  border-right: 5px solid #2563eb;
  border-radius: 12px;
  background: #eff6ff;
  color: #1e3a8a;
  font-size: 16px;
  font-weight: 900;
  page-break-after: avoid;
}

.section-title:not(:first-of-type) {
  margin-top: 12mm;
}

.section-title--warning {
  border-right-color: #f97316;
  background: #fff7ed;
  color: #c2410c;
}

.report-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  background: #ffffff;
  page-break-inside: auto;
}

.report-table thead {
  display: table-header-group;
}

.report-table tr {
  page-break-inside: avoid;
}

.report-table th {
  padding: 9px 8px;
  background: #1e3a8a;
  color: #ffffff;
  font-size: 11px;
  font-weight: 900;
  text-align: right;
}

.report-table td {
  padding: 9px 8px;
  border-top: 1px solid #e2e8f0;
  color: #334155;
  font-size: 10.5px;
  font-weight: 700;
  vertical-align: top;
}

.report-table--compact td {
  padding: 7px 8px;
}

.strong-cell {
  color: #0f172a !important;
  font-weight: 900 !important;
}

.done-cell {
  color: #15803d !important;
  font-weight: 900 !important;
}

.pending-cell {
  color: #c2410c !important;
  font-weight: 900 !important;
}

.operation-list {
  display: grid;
  gap: 8px;
}

.operation-item {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
}

.operation-item strong {
  display: block;
  color: #0f172a;
  font-size: 13px;
  font-weight: 900;
}

.operation-item span {
  display: block;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
}

.type-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12mm;
}

.type-card {
  border-radius: 18px;
  padding: 14px;
  background: #ffffff;
  border: 1px solid #dbeafe;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
}

.type-card h3 {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 900;
  color: #1e3a8a;
}

.type-stats {
  display: grid;
  gap: 6px;
  margin-bottom: 10px;
}

.type-stats span,
.type-card p {
  margin: 0;
  color: #475569;
  font-size: 11px;
  font-weight: 800;
}

.empty-box {
  color: #64748b;
  font-weight: 800;
  text-align: center;
}

.notes-box {
  padding: 16px;
  min-height: 150mm;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid #dbe3ef;
}

.note-line {
  height: 11mm;
  border-bottom: 1px dashed #cbd5e1;
}

.signatures {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 18mm;
}

.signature-card {
  text-align: center;
  min-height: 45mm;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
}

.signature-card span {
  display: block;
  margin-bottom: 22mm;
  color: #334155;
  font-size: 12px;
  font-weight: 900;
}

.signature-card div {
  border-bottom: 1px solid #94a3b8;
}

.signature-card--stamp div {
  width: 30mm;
  height: 30mm;
  margin: -8mm auto 0;
  border: 2px dashed #cbd5e1;
  border-radius: 50%;
}

@media print {
  @page {
    size: A4;
    margin: 0;
  }

  body * {
    visibility: hidden !important;
  }

  .rayaan-report-host,
  .rayaan-report-host *,
  #monthly-print-report,
  #monthly-print-report * {
    visibility: visible !important;
  }

  .rayaan-report-host {
    position: static !important;
    inset: auto !important;
    width: 210mm !important;
    overflow: visible !important;
  }

  #monthly-print-report {
    position: static !important;
    width: 210mm !important;
  }

  .report-page {
    margin: 0 !important;
    box-shadow: none !important;
    break-after: page;
    page-break-after: always;
  }
}
</style>
