<template>
  <!-- 1) Fix scrolling: Use standard block layout with padding, avoid full-height flex locking -->
  <div class="inspections-page">
    
    <!-- Header -->
    <section class="inspections-page__hero">
      <div class="inspections-page__hero-content">
        <p class="inspections-page__eyebrow">المعاينة والتوصيات الفنية</p>
        <h1 class="inspections-page__hero-title">إنشاء وتعديل المعاينة الفنية والتوصيات الشهرية للمزارع</h1>
      </div>
    </section>

    <!-- Filters Section (Owner & Farm) -->
    <section class="inspections-page__section">
      <div class="inspections-page__grid">
        <div class="inspections-page__field-card">
          <BaseSelect
            v-model="filters.owner"
            :label="t('reports.form.labels.owner')"
            :placeholder="t('reports.form.placeholders.owner')"
            :options="mappedUsersRecords"
            :loading="usersUiFlags.isFetchingList"
          />
        </div>

        <div class="inspections-page__field-card">
          <BaseSelect
            v-model="filters.farm_id"
            :label="t('reports.form.labels.farm')"
            :placeholder="t('reports.form.placeholders.farm')"
            :options="mappedFarmsRecords"
            :disabled="!filters.owner"
          />
        </div>
      </div>
      
      <!-- Create Flow Button -->
      <div v-if="filters.farm_id && !isFormOpen" class="inspections-page__actions-top">
        <BaseButton size="lg" @click="openCreateForm">
          إنشاء معاينة فنية جديدة
        </BaseButton>
      </div>
    </section>

    <!-- Edit/Create Form Section -->
    <section v-if="isFormOpen" class="inspections-page__section inspections-page__section--form">
      <!-- Form Header -->
      <div class="form-header">
        <div class="form-header__icon-wrap">
          <BaseIcon :name="isEditing ? 'solar:pen-new-square-bold-duotone' : 'solar:add-square-bold-duotone'" width="28" height="28" />
        </div>
        <div class="form-header__text">
          <h2 class="form-header__title">{{ isEditing ? 'تعديل معاينة شهرية' : 'إنشاء معاينة فنية جديدة' }}</h2>
          <p class="form-header__subtitle">{{ isEditing ? 'قم بتعديل المعاينة الفنية والتوصيات لهذا الشهر' : 'اختر الشهر ثم أضف المعاينة الفنية والتوصيات' }}</p>
        </div>
        <button type="button" class="form-header__close" @click="closeForm" title="إغلاق">
          <BaseIcon name="solar:close-circle-outline" width="24" height="24" />
        </button>
      </div>

      <!-- Step 1: Month Selection -->
      <div class="form-step">
        <div class="form-step__indicator">
          <div class="form-step__dot" :class="{ 'is-done': form.month }">
            <BaseIcon name="solar:calendar-bold" width="18" height="18" v-if="!form.month" />
            <BaseIcon name="solar:check-read-outline" width="18" height="18" v-else />
          </div>
          <div class="form-step__line" :class="{ 'is-active': form.month }"></div>
        </div>
        <div class="form-step__content">
          <h3 class="form-step__title">اختيار الشهر</h3>
          <p class="form-step__desc">حدد الشهر المراد إنشاء أو تعديل المعاينة الفنية له</p>
          <div class="form-step__field">
            <BaseDatePicker
              :label="t('reports.form.labels.month')"
              v-model="form.month"
              month-picker
              locale="ar"
              placeholder="اختر الشهر"
              @update:modelValue="onMonthChange"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingReport" class="inspections-page__state-box inspections-page__state-box--loading" style="margin: 0 0 0 52px;">
        <BaseSpinner />
        <p>جاري البحث عن تقرير هذا الشهر...</p>
      </div>

      <!-- Step 2: Editors -->
      <template v-if="form.month && !isLoadingReport">
        <div class="form-step">
          <div class="form-step__indicator">
            <div class="form-step__dot" :class="{ 'is-done': stripHtml(form.technical_inspection).trim().length > 0 }">
              <BaseIcon name="solar:clipboard-check-bold" width="18" height="18" />
            </div>
            <div class="form-step__line" :class="{ 'is-active': stripHtml(form.technical_inspection).trim().length > 0 }"></div>
          </div>
          <div class="form-step__content">
            <h3 class="form-step__title">المعاينة الفنية</h3>
            <p class="form-step__desc">اكتب ملاحظات المعاينة الفنية للمزرعة في هذا الشهر</p>
            <div class="form-step__editor">
              <BaseTextEditor
                :label="t('reports.form.labels.review')"
                :placeholder="t('reports.form.placeholders.review')"
                v-model="form.technical_inspection"
              />
            </div>
          </div>
        </div>

        <div class="form-step form-step--last">
          <div class="form-step__indicator">
            <div class="form-step__dot" :class="{ 'is-done': stripHtml(form.technical_recommendations).trim().length > 0 }">
              <BaseIcon name="solar:lightbulb-bolt-bold" width="18" height="18" />
            </div>
          </div>
          <div class="form-step__content">
            <h3 class="form-step__title">التوصيات الفنية</h3>
            <p class="form-step__desc">أضف التوصيات والإرشادات الفنية للمزرعة</p>
            <div class="form-step__editor">
              <BaseTextEditor
                :label="t('reports.form.labels.recommendations')"
                :placeholder="t('reports.form.placeholders.recommendations')"
                v-model="form.technical_recommendations"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Empty state when no month selected -->
      <div v-if="!form.month && !isLoadingReport" class="form-empty-hint">
        <BaseIcon name="solar:hand-shake-outline" width="40" height="40" />
        <p>اختر الشهر أعلاه للبدء في إنشاء المعاينة الفنية</p>
      </div>

      <!-- Form Actions -->
      <div class="form-footer">
        <button type="button" class="form-footer__btn form-footer__btn--cancel" @click="closeForm">
          <BaseIcon name="solar:close-circle-outline" width="20" height="20" />
          <span>إلغاء</span>
        </button>
        <button 
          type="button"
          class="form-footer__btn form-footer__btn--save" 
          @click="saveChanges"
          :disabled="!isSaveValid || inspectionsUiFlags.isCreating || inspectionsUiFlags.isUpdating"
        >
          <BaseSpinner v-if="inspectionsUiFlags.isCreating || inspectionsUiFlags.isUpdating" />
          <BaseIcon v-else name="solar:check-read-bold" width="20" height="20" />
          <span>{{ inspectionsUiFlags.isCreating || inspectionsUiFlags.isUpdating ? 'جاري الحفظ...' : 'حفظ المعاينة' }}</span>
        </button>
      </div>
    </section>

    <!-- Previous Records -->
    <section v-if="filters.farm_id && !isFormOpen" class="inspections-page__section">
      <div class="inspections-page__section-head">
        <h2 class="inspections-page__section-title">
          <BaseIcon name="solar:calendar-bold-duotone" width="28" height="28" />
          الشهور السابقة
        </h2>
        <span class="inspections-page__records-count" v-if="farmReports.length > 0">
          {{ farmReports.length }} معاينة
        </span>
      </div>

      <div v-if="farmReports.length === 0" class="inspections-page__state-box inspections-page__state-box--empty">
        <BaseIcon name="solar:document-add-outline" :size="48" color="#94a3b8" />
        <p>لا توجد معاينات محفوظة لهذه المزرعة حتى الآن.</p>
      </div>

      <!-- Grouped by Year -->
      <div v-else class="inspections-page__years">
        <div v-for="(reports, year) in groupedReports" :key="year" class="inspections-page__year-group">
          <div class="inspections-page__year-header">
            <div class="inspections-page__year-accent"></div>
            <h3 class="inspections-page__year-title">{{ year }}</h3>
            <span class="inspections-page__year-count">{{ reports.length }} شهور</span>
          </div>
          
          <div class="inspections-page__list">
            <div 
              v-for="reportItem in reports" 
              :key="reportItem.id"
              class="inspections-page__row-card"
            >
              <!-- Month Badge -->
              <div class="inspections-page__row-badge">
                <div class="inspections-page__badge-inner">
                  <span class="badge-num">{{ formatMonthOnly(reportItem.month) }}</span>
                  <span class="badge-label">شهر</span>
                </div>
              </div>
              
              <!-- Content Columns -->
              <div class="inspections-page__row-content">
                <div class="inspections-page__preview-group">
                  <div class="inspections-page__preview-label">
                    <BaseIcon name="solar:clipboard-check-outline" width="18" height="18" />
                    <h4>المعاينة الفنية</h4>
                  </div>
                  <p :class="{ 'is-empty': !stripHtml(reportItem.technical_inspection) }">
                    {{ stripHtml(reportItem.technical_inspection) || 'لم يتم إضافة معاينة بعد' }}
                  </p>
                </div>
                <div class="inspections-page__preview-divider"></div>
                <div class="inspections-page__preview-group">
                  <div class="inspections-page__preview-label">
                    <BaseIcon name="solar:lightbulb-bolt-outline" width="18" height="18" />
                    <h4>التوصيات الفنية</h4>
                  </div>
                  <p :class="{ 'is-empty': !stripHtml(reportItem.technical_recommendations) }">
                    {{ stripHtml(reportItem.technical_recommendations) || 'لم يتم إضافة توصيات بعد' }}
                  </p>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="inspections-page__row-actions">
                <button 
                  class="inspections-page__action-btn inspections-page__action-btn--edit"
                  @click="editReport(reportItem)"
                  title="عرض / تعديل"
                >
                  <BaseIcon name="solar:pen-new-square-outline" width="20" height="20" />
                  <span>تعديل</span>
                </button>
                <button 
                  class="inspections-page__action-btn inspections-page__action-btn--delete"
                  @click="clearOldReport(reportItem)"
                  title="مسح"
                >
                  <BaseIcon name="solar:trash-bin-trash-outline" width="20" height="20" />
                  <span>مسح</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Initial Empty State -->
    <section v-else-if="!filters.farm_id" class="inspections-page__section">
      <div class="inspections-page__state-box inspections-page__state-box--empty">
        <BaseIcon name="solar:filters-outline" :size="48" color="#94a3b8" />
        <p>اختر المالك والمزرعة لعرض الشهور السابقة.</p>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";

import BaseSelect from "@/components/shared/BaseSelect.vue";
import BaseDatePicker from "@/components/shared/BaseDatePicker.vue";
import BaseTextEditor from "@/components/shared/BaseTextEditor.vue";
import BaseButton from "@/components/shared/BaseButton.vue";
import BaseIcon from "@/components/shared/BaseIcon.vue";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";

import { useUsersStore } from "@/stores/users.store";
import { useFarmsStore } from "@/stores/farms.store";
import { useMonthlyInspectionsStore } from "@/stores/monthlyInspections.store";

const { t } = useI18n();

const usersStore = useUsersStore();
const farmsStore = useFarmsStore();
const inspectionsStore = useMonthlyInspectionsStore();

const { uiFlags: usersUiFlags, records: usersRecords } = storeToRefs(usersStore);
const { records: farmsRecords } = storeToRefs(farmsStore);
const { uiFlags: inspectionsUiFlags } = storeToRefs(inspectionsStore);

// Filters State
const filters = ref({
  owner: null,
  farm_id: null,
});

// Form State
const isFormOpen = ref(false);
const isEditing = ref(false);
const isLoadingReport = ref(false);
const currentReportId = ref(null);
const currentFullReport = ref(null);

const form = ref({
  month: null,
  technical_inspection: null,
  technical_recommendations: null,
});

const farmReports = ref([]);

const mappedUsersRecords = computed(() => {
  return (usersRecords.value || []).map((user) => ({
    label: user.name,
    id: user.id,
  }));
});

const mappedFarmsRecords = computed(() => {
  return (farmsRecords.value || [])
    .filter((farm) => String(farm.owner_id) === String(filters.value.owner))
    .map((farm) => ({
      label: farm.name,
      id: farm.id,
    }));
});

// Form validation
const stripHtml = (html) => {
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const isSaveValid = computed(() => {
  if (!filters.value.farm_id || !form.value.month) {
    return false;
  }
  
  const hasReview = stripHtml(form.value.technical_inspection).trim().length > 0;
  const hasRec = stripHtml(form.value.technical_recommendations).trim().length > 0;
  
  return hasReview || hasRec;
});

// Grouped reports by year
const groupedReports = computed(() => {
  const groups = {};
  
  // Only include reports that actually have technical_inspection or technical_recommendations
  const validReports = farmReports.value.filter(r => {
    return stripHtml(r.technical_inspection).trim().length > 0 || stripHtml(r.technical_recommendations).trim().length > 0;
  });
  
  const sortedReports = [...validReports].sort((a, b) => {
    return new Date(b.year, b.month) - new Date(a.year, a.month);
  });
  
  sortedReports.forEach(report => {
    const year = report.year;
    if (!groups[year]) groups[year] = [];
    groups[year].push(report);
  });
  
  // Sort years descending
  const sortedGroups = {};
  Object.keys(groups).sort((a, b) => b - a).forEach(year => {
    sortedGroups[year] = groups[year];
  });
  
  return sortedGroups;
});

const fetchOwnerFarms = async (ownerId) => {
  if (!ownerId) {
    farmsStore.$patch({ records: [] });
    return;
  }
  await farmsStore.fetchRecords({ owner_id: ownerId, per_page: 1000 });
};

const fetchFarmReports = async (farmId) => {
  farmReports.value = [];
  if (!farmId) return;
  const response = await inspectionsStore.fetchRecords({ farm_id: farmId, per_page: 1000 });
  if (response && response.length) {
    farmReports.value = response;
  }
};

const formatMonthOnly = (monthVal) => {
  return monthVal + 1;
};



const formatYearOnly = (year) => {
  return year;
};

const openCreateForm = () => {
  isFormOpen.value = true;
  isEditing.value = false;
  form.value.month = null;
  form.value.technical_inspection = null;
  form.value.technical_recommendations = null;
  currentReportId.value = null;
  currentFullReport.value = null;
};

const closeForm = () => {
  isFormOpen.value = false;
  isEditing.value = false;
  form.value.month = null;
  form.value.technical_inspection = null;
  form.value.technical_recommendations = null;
  currentReportId.value = null;
  currentFullReport.value = null;
  
  // Refresh reports silently
  if (filters.value.farm_id) {
    fetchFarmReports(filters.value.farm_id);
  }
};

const onMonthChange = async () => {
  currentReportId.value = null;
  currentFullReport.value = null;
  
  if (!isEditing.value) {
    form.value.technical_inspection = null;
    form.value.technical_recommendations = null;
  }
  
  if (!filters.value.farm_id || !form.value.month) return;
  
  isLoadingReport.value = true;
  
  let targetMonth, targetYear;
  if (form.value.month instanceof Date) {
    targetMonth = form.value.month.getMonth();
    targetYear = form.value.month.getFullYear();
  } else {
    targetMonth = form.value.month.month;
    targetYear = form.value.month.year;
  }
  
  // Ensure we have the latest list
  await fetchFarmReports(filters.value.farm_id);
  
  const existingReport = farmReports.value.find(r => {
    return r.month === targetMonth && r.year === targetYear;
  });
  
  if (existingReport) {
    const fullReport = await inspectionsStore.fetchRecord(existingReport.id);
    if (fullReport) {
      currentFullReport.value = fullReport;
      currentReportId.value = fullReport.id;
      
      // If we're opening an existing report to edit, populate fields
      if (!form.value.technical_inspection && !form.value.technical_recommendations) {
        form.value.technical_inspection = fullReport.technical_inspection || "";
        form.value.technical_recommendations = fullReport.technical_recommendations || "";
      }
    }
  }
  
  isLoadingReport.value = false;
};

const saveChanges = async () => {
  if (!isSaveValid.value) return;
  
  const payloadToSave = {
    farm_id: filters.value.farm_id,
    year: form.value.month.year,
    month: form.value.month.month,
    technical_inspection: form.value.technical_inspection,
    technical_recommendations: form.value.technical_recommendations,
  };
  
  if (currentReportId.value) {
    const updateResponse = await inspectionsStore.updateRecord(currentReportId.value, payloadToSave);
    if (updateResponse?.isUpdated) {
      toast.success("تم الحفظ بنجاح");
      closeForm();
    }
  } else {
    const createResponse = await inspectionsStore.createRecord(payloadToSave);
    if (createResponse?.id) {
      toast.success("تم الإنشاء بنجاح");
      closeForm();
    }
  }
};

const editReport = async (reportItem) => {
  isFormOpen.value = true;
  isEditing.value = true;
  
  form.value.month = {
    month: reportItem.month,
    year: reportItem.year,
  };
  
  // Pre-fill so it doesn't wait for network
  form.value.technical_inspection = reportItem.technical_inspection || "";
  form.value.technical_recommendations = reportItem.technical_recommendations || "";
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  await onMonthChange();
};

const clearOldReport = async (reportItem) => {
  if (!confirm("هل أنت متأكد من مسح المعاينة والتوصيات لهذا الشهر بشكل نهائي؟")) {
    return;
  }
  
  const deleteResponse = await inspectionsStore.deleteRecord(reportItem.id);
  if (deleteResponse?.isDeleted) {
    toast.success("تم المسح بنجاح");
    await fetchFarmReports(filters.value.farm_id);
  }
};

onMounted(async () => {
  await usersStore.fetchRecords({ role: "farm_owner", per_page: 1000 });
});

watch(() => filters.value.owner, async (newOwner, oldOwner) => {
  if (!newOwner) {
    filters.value.farm_id = null;
    farmsStore.$patch({ records: [] });
    farmReports.value = [];
    closeForm();
    return;
  }
  if (newOwner !== oldOwner) {
    filters.value.farm_id = null;
    farmReports.value = [];
    closeForm();
  }
  await fetchOwnerFarms(newOwner);
});

watch(() => filters.value.farm_id, async (newFarmId, oldFarmId) => {
  if (newFarmId !== oldFarmId) {
    closeForm();
  }
  if (newFarmId) {
    await fetchFarmReports(newFarmId);
  } else {
    farmReports.value = [];
  }
});
</script>

<style lang="scss" scoped>
/* Ensure standard block layout and natural vertical scrolling */
.inspections-page {
  display: block;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding-bottom: 80px;

  &__hero {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    padding: 32px;
    margin-bottom: 24px;
    border-radius: 28px;
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    color: white;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(37, 99, 235, 0.15);
    
    &::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
      pointer-events: none;
    }
  }

  &__hero-content {
    flex: 1;
    position: relative;
    z-index: 1;
  }

  &__eyebrow {
    margin: 0 0 12px 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__hero-title {
    margin: 0 0 12px 0;
    font-size: 2.4rem;
    font-weight: 900;
    line-height: 1.2;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &__section {
    background: #ffffff;
    border-radius: 28px;
    padding: 32px;
    margin-bottom: 24px;
    box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04);
    border: 1px solid rgba(226, 232, 240, 0.8);
    
    &--form {
      border: 1px solid #dbeafe;
      background: linear-gradient(180deg, #fafcff 0%, #f0f6ff 100%);
      padding: 0;
    }
  }

  &__section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f1f5f9;
  }

  &__section-title {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--blue-800);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  &__stack {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__field-card {
    padding: 20px;
    border-radius: 20px;
    border: 1px solid var(--blue-100);
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
  }
  
  &__actions-top {
    margin-top: 24px;
    display: flex;
    justify-content: flex-start;
  }

  &__form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e2e8f0;
  }

  /* Records count badge in section header */
  &__records-count {
    display: inline-flex;
    align-items: center;
    padding: 6px 16px;
    border-radius: 100px;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    color: var(--blue-700);
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.3px;
  }

  /* Previous Records Layout */
  &__years {
    display: flex;
    flex-direction: column;
    gap: 36px;
  }

  &__year-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  &__year-accent {
    width: 5px;
    height: 32px;
    border-radius: 100px;
    background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
    flex-shrink: 0;
  }

  &__year-title {
    margin: 0;
    font-size: 1.7rem;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: -0.3px;
  }
  
  &__year-count {
    margin-right: auto;
    font-size: 0.9rem;
    font-weight: 600;
    color: #94a3b8;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__row-card {
    display: flex;
    align-items: stretch;
    background: #ffffff;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
      border-color: #bfdbfe;
    }
  }

  &__row-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 110px;
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    padding: 20px 16px;
  }

  &__badge-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    
    .badge-num {
      font-size: 2.4rem;
      font-weight: 900;
      color: #ffffff;
      line-height: 1;
      letter-spacing: -1px;
    }
    
    .badge-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.7);
      letter-spacing: 0.5px;
    }
  }

  &__row-content {
    flex: 1;
    display: flex;
    align-items: stretch;
    gap: 0;
    padding: 22px 24px;
  }

  &__preview-divider {
    width: 1px;
    background: linear-gradient(180deg, transparent 0%, #e2e8f0 20%, #e2e8f0 80%, transparent 100%);
    margin: 0 24px;
    flex-shrink: 0;
  }

  &__preview-group {
    flex: 1;
    min-width: 0;

    h4 {
      margin: 0 0 10px 0;
      font-size: 1rem;
      font-weight: 700;
      color: #475569;
    }
    
    p {
      margin: 0;
      font-size: 0.95rem;
      color: #1e293b;
      line-height: 1.7;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      
      &.is-empty {
        color: #94a3b8;
        font-style: italic;
      }
    }
  }

  &__preview-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    color: #64748b;
    
    h4 {
      margin: 0;
    }
  }

  &__row-actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    padding: 16px 20px;
    border-right: 1px solid #f1f5f9;
    min-width: 120px;
  }

  &__action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 14px;
    font-size: 0.9rem;
    font-weight: 700;
    font-family: inherit;
    border: none;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;

    &--edit {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      color: #1d4ed8;
      
      &:hover {
        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
      }
    }

    &--delete {
      background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
      color: #be123c;
      
      &:hover {
        background: linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(225, 29, 72, 0.12);
      }
    }
  }
  
  /* State Boxes (Loading, Empty, Warning) */
  &__state-box {
    margin-top: 16px;
    padding: 24px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    
    &--loading {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #64748b;
      justify-content: center;
      font-weight: 600;
    }
    
    &--warning {
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #b45309;
    }
    
    &--empty {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      color: #64748b;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      min-height: 200px;
      font-weight: 600;
      font-size: 1.1rem;
    }
  }
  
  &__state-icon {
    flex-shrink: 0;
  }
  
  &__state-content {
    h3 {
      margin: 0 0 4px 0;
      font-size: 1.2rem;
      font-weight: 800;
    }
    p {
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
    }
  }
}

/* Form Wizard Styles */
.form-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 28px 32px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: #ffffff;

  &__icon-wrap {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    flex-shrink: 0;
  }

  &__text {
    flex: 1;
  }

  &__title {
    margin: 0 0 4px 0;
    font-size: 1.6rem;
    font-weight: 800;
    color: #ffffff;
  }

  &__subtitle {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.75);
  }

  &__close {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }
  }
}

.form-step {
  display: flex;
  gap: 20px;
  padding: 0 32px;
  margin-top: 28px;

  &--last {
    margin-bottom: 8px;
  }

  &__indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 4px;
  }

  &__dot {
    width: 40px;
    height: 40px;
    border-radius: 14px;
    background: #f1f5f9;
    border: 2px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    flex-shrink: 0;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);

    &.is-done {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      border-color: #3b82f6;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
    }
  }

  &__line {
    width: 2px;
    flex: 1;
    min-height: 20px;
    background: #e2e8f0;
    border-radius: 100px;
    margin: 8px 0;
    transition: background 0.35s;

    &.is-active {
      background: linear-gradient(180deg, #3b82f6 0%, #93c5fd 100%);
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
    padding-bottom: 8px;
  }

  &__title {
    margin: 0 0 4px 0;
    font-size: 1.2rem;
    font-weight: 800;
    color: #1e293b;
  }

  &__desc {
    margin: 0 0 16px 0;
    font-size: 0.9rem;
    font-weight: 500;
    color: #94a3b8;
    line-height: 1.5;
  }

  &__field {
    max-width: 340px;
    padding: 16px;
    border-radius: 16px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
  }

  &__editor {
    padding: 20px;
    border-radius: 18px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
    transition: border-color 0.25s;

    &:focus-within {
      border-color: #93c5fd;
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
    }
  }
}

.form-empty-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 32px;
  color: #94a3b8;
  text-align: center;

  p {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
  }
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 14px;
  padding: 20px 32px;
  margin-top: 24px;
  border-top: 1px solid #e2e8f0;
  background: rgba(248, 250, 252, 0.6);

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 28px;
    border-radius: 14px;
    font-size: 1rem;
    font-weight: 700;
    font-family: inherit;
    border: none;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

    &--cancel {
      background: #f1f5f9;
      color: #64748b;

      &:hover {
        background: #e2e8f0;
        color: #475569;
      }
    }

    &--save {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        box-shadow: none;
      }
    }
  }
}

/* Base Overrides */
:deep(.inspections-page__field-card .base-input),
:deep(.inspections-page__field-card .base-select),
:deep(.inspections-page__field-card .base-date-picker),
:deep(.inspections-page__field-card .base-text-editor) {
  width: 100%;
}

:deep(input),
:deep(textarea),
:deep(.dp__main),
:deep(.ql-container),
:deep(.ql-toolbar) {
  border-radius: 14px !important;
}

/* Responsiveness */
@media screen and (max-width: 768px) {
  .inspections-page__row-card {
    flex-direction: column;
  }
  
  .inspections-page__row-badge {
    border-left: none;
    border-bottom: 1px solid #dbeafe;
    padding: 14px;
    min-width: unset;
  }

  .inspections-page__badge-inner {
    flex-direction: row;
    gap: 10px;
  }
  
  .inspections-page__row-content {
    flex-direction: column;
    gap: 0;
    padding: 16px;
  }

  .inspections-page__preview-divider {
    width: 100%;
    height: 1px;
    margin: 16px 0;
    background: linear-gradient(90deg, transparent 0%, #e2e8f0 20%, #e2e8f0 80%, transparent 100%);
  }
  
  .inspections-page__row-actions {
    flex-direction: row;
    border-right: none;
    border-top: 1px solid #f1f5f9;
    padding: 14px 16px;
    min-width: unset;
  }

  .inspections-page__action-btn {
    flex: 1;
  }
  
  .inspections-page__form-actions {
    flex-direction: column;
    button {
      width: 100%;
    }
  }

  .inspections-page__section-head {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>
