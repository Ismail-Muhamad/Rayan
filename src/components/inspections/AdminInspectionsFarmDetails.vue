<template>
  <BasePageWrapper
    titleKey="تفاصيل المعاينات والتوصيات"
    subtitleKey="Farm Inspection Details"
    iconName="solar:document-medicine-outline"
  >
    <section class="ird-page" dir="rtl">

      <!-- Back Button -->
      <div class="ird-back-row">
        <button class="ird-back-btn" type="button" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          العودة للقائمة
        </button>
      </div>

      <!-- Hero -->
      <div class="ird-hero">
        <div class="ird-hero__glow"></div>

        <div class="ird-hero__top">
          <div class="ird-hero__breadcrumb">
            <span>{{ pageData.userName }}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            <span>{{ pageData.farmName }}</span>
          </div>
        </div>

        <div class="ird-hero__body">
          <div class="ird-hero__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div class="ird-hero__info">
            <p class="ird-hero__eyebrow">مزرعة</p>
            <h1>{{ pageData.farmName }}</h1>
            <p class="ird-hero__sub">جميع سجلات المعاينات والتوصيات الفنية</p>
          </div>
        </div>

        <div class="ird-hero__stats">
          <div class="ird-stat">
            <strong>{{ allRecords.length }}</strong>
            <span>إجمالي السجلات</span>
          </div>
          <div class="ird-stat">
            <strong>{{ recordsWithInspection }}</strong>
            <span>معاينات مسجلة</span>
          </div>
          <div class="ird-stat">
            <strong>{{ recordsWithRecommendations }}</strong>
            <span>توصيات مسجلة</span>
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="ird-toolbar">
        <div class="ird-toolbar__search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            v-model="search"
            type="text"
            autocomplete="off"
            placeholder="ابحث في السجلات…"
          />
          <button v-if="search" type="button" @click="search = ''">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="ird-custom-select" :class="{ 'is-open': isYearDropdownOpen }" tabindex="0" @blur="closeYearDropdown">
          <div class="ird-custom-select__trigger" @click="isYearDropdownOpen = !isYearDropdownOpen">
            <div class="ird-custom-select__value">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>{{ selectedYear ? selectedYear : 'كل السنوات' }}</span>
            </div>
            <div class="ird-custom-select__arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>
          
          <Transition name="ird-dropdown">
            <div v-if="isYearDropdownOpen" class="ird-custom-select__menu">
              <button 
                class="ird-custom-select__option" 
                :class="{ 'is-active': selectedYear === null }"
                @click="selectedYear = null; isYearDropdownOpen = false"
                type="button"
              >
                <span>كل السنوات</span>
                <svg v-if="selectedYear === null" class="ird-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
              </button>
              <button 
                v-for="y in availableYears" 
                :key="y" 
                class="ird-custom-select__option"
                :class="{ 'is-active': selectedYear === y }"
                @click="selectedYear = y; isYearDropdownOpen = false"
                type="button"
              >
                <span>{{ y }}</span>
                <svg v-if="selectedYear === y" class="ird-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
              </button>
            </div>
          </Transition>
        </div>

        <button class="ird-add-btn" type="button" @click="openAddModal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          إضافة معاينة
        </button>
      </div>

      <!-- Empty -->
      <div v-if="filteredRecords.length === 0" class="ird-empty">
        <div class="ird-empty__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <h3>لا توجد سجلات</h3>
        <p>{{ search ? 'لا يوجد ما يطابق بحثك.' : 'لا توجد معاينات مسجلة لهذه المزرعة.' }}</p>
        <button type="button" @click="openAddModal">إضافة معاينة</button>
      </div>

      <!-- Records Grid -->
      <div v-else class="ird-records-grid">
        <article
          v-for="record in filteredRecords"
          :key="record.id"
          class="ird-record-card"
        >
          <!-- Card Top -->
          <div class="ird-record-card__top">
            <div class="ird-record-card__date">
              <span class="ird-record-card__month">{{ getMonthName(record.month) }}</span>
              <span class="ird-record-card__year">{{ record.year }}</span>
            </div>

            <div class="ird-record-card__actions">
              <button class="ird-act-btn ird-act-btn--edit" type="button" title="تعديل" @click="openEditModal(record)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="ird-act-btn ird-act-btn--delete" type="button" title="حذف" @click="openDeleteModal(record)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Inspection -->
          <div class="ird-record-card__body" @click="openViewModal(record)">
            <div v-if="record.technical_inspection" class="ird-record-field">
              <div class="ird-record-field__label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                المعاينة الفنية
              </div>
              <div class="ird-thought-bubble-container">
                <p class="ird-record-field__text ird-record-field__text--clamp3">{{ record.technical_inspection }}</p>
                <div class="ird-thought-bubble" @click.stop>
                  {{ record.technical_inspection }}
                  <div class="ird-bubble-tail-1"></div>
                  <div class="ird-bubble-tail-2"></div>
                </div>
              </div>
            </div>

            <div class="ird-record-field__divider" v-if="record.technical_inspection && record.technical_recommendations"></div>

            <div v-if="record.technical_recommendations" class="ird-record-field">
              <div class="ird-record-field__label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                التوصيات الفنية
              </div>
              <div class="ird-thought-bubble-container">
                <p class="ird-record-field__text ird-record-field__text--clamp3">{{ record.technical_recommendations }}</p>
                <div class="ird-thought-bubble" @click.stop>
                  {{ record.technical_recommendations }}
                  <div class="ird-bubble-tail-1"></div>
                  <div class="ird-bubble-tail-2"></div>
                </div>
              </div>
            </div>

            <p v-if="!record.technical_inspection && !record.technical_recommendations" class="ird-record-field__empty">
              لا يوجد محتوى مسجل لهذا الشهر.
            </p>
          </div>
        </article>
      </div>

    </section>

    <!-- ═══ VIEW MODAL ═══ -->
    <Teleport to="body">
      <Transition name="ird-fade">
        <div v-if="showViewModal" class="ird-backdrop" @click.self="closeViewModal">
          <Transition name="ird-scale">
            <div v-if="showViewModal" class="ird-modal">
              <div class="ird-modal__header">
                <div class="ird-modal__header-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div>
                  <h2>تفاصيل المعاينة - {{ getMonthName(viewTarget?.month) }} {{ viewTarget?.year }}</h2>
                  <p>{{ pageData.farmName }}</p>
                </div>
                <button class="ird-modal__close" type="button" @click="closeViewModal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div class="ird-modal__body">
                <div v-if="viewTarget?.technical_inspection" class="ird-record-field">
                  <div class="ird-record-field__label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    المعاينة الفنية
                  </div>
                  <p class="ird-record-field__text">{{ viewTarget.technical_inspection }}</p>
                </div>

                <div class="ird-record-field__divider" v-if="viewTarget?.technical_inspection && viewTarget?.technical_recommendations"></div>

                <div v-if="viewTarget?.technical_recommendations" class="ird-record-field">
                  <div class="ird-record-field__label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    التوصيات الفنية
                  </div>
                  <p class="ird-record-field__text">{{ viewTarget.technical_recommendations }}</p>
                </div>

                <p v-if="!viewTarget?.technical_inspection && !viewTarget?.technical_recommendations" class="ird-record-field__empty">
                  لا يوجد محتوى مسجل لهذا الشهر.
                </p>
              </div>

              <div class="ird-modal__footer">
                <button class="ird-btn ird-btn--ghost" type="button" @click="closeViewModal">إغلاق</button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- ═══ ADD/EDIT MODAL ═══ -->
    <Teleport to="body">
      <Transition name="ird-fade">
        <div v-if="showFormModal" class="ird-backdrop" @click.self="closeFormModal">
          <Transition name="ird-scale">
            <div v-if="showFormModal" class="ird-modal">

              <div class="ird-modal__header">
                <div class="ird-modal__header-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div>
                  <h2>{{ isEditing ? 'تعديل المعاينة' : 'إضافة معاينة جديدة' }}</h2>
                  <p>{{ pageData.farmName }}</p>
                </div>
                <button class="ird-modal__close" type="button" @click="closeFormModal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div class="ird-modal__body">
                <div class="ird-form-row">
                  <div class="ird-form-group">
                    <label class="ird-form-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      السنة <span class="ird-required">*</span>
                    </label>
                    <select v-model="form.year" class="ird-form-select">
                      <option value="">اختر السنة</option>
                      <option v-for="y in yearsList" :key="y" :value="y">{{ y }}</option>
                    </select>
                    <span v-if="formErrors.year" class="ird-form-error">{{ formErrors.year }}</span>
                  </div>
                  <div class="ird-form-group">
                    <label class="ird-form-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10H3M16 2v4M8 2v4"/>
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                      </svg>
                      الشهر <span class="ird-required">*</span>
                    </label>
                    <select v-model="form.month" class="ird-form-select">
                      <option value="">اختر الشهر</option>
                      <option v-for="m in monthsList" :key="m.value" :value="m.value">{{ m.label }}</option>
                    </select>
                    <span v-if="formErrors.month" class="ird-form-error">{{ formErrors.month }}</span>
                  </div>
                </div>

                <div class="ird-form-group">
                  <label class="ird-form-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    المعاينة الفنية
                  </label>
                  <textarea
                    v-model="form.technical_inspection"
                    class="ird-form-textarea"
                    placeholder="اكتب نتائج المعاينة الفنية هنا…"
                    rows="4"
                  ></textarea>
                </div>

                <div class="ird-form-group">
                  <label class="ird-form-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    التوصيات الفنية
                  </label>
                  <textarea
                    v-model="form.technical_recommendations"
                    class="ird-form-textarea"
                    placeholder="اكتب التوصيات الفنية هنا…"
                    rows="4"
                  ></textarea>
                </div>
              </div>

              <div class="ird-modal__footer">
                <button class="ird-btn ird-btn--ghost" type="button" @click="closeFormModal">إلغاء</button>
                <button class="ird-btn ird-btn--primary" type="button" :disabled="saving" @click="submitForm">
                  <span v-if="saving" class="ird-btn-spin"></span>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  {{ saving ? 'جاري الحفظ…' : (isEditing ? 'حفظ التعديلات' : 'إضافة المعاينة') }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- ═══ DELETE MODAL ═══ -->
    <Teleport to="body">
      <Transition name="ird-fade">
        <div v-if="showDeleteModal" class="ird-backdrop" @click.self="closeDeleteModal">
          <Transition name="ird-scale">
            <div v-if="showDeleteModal" class="ird-modal ird-modal--sm">
              <div class="ird-modal__header ird-modal__header--danger">
                <div class="ird-modal__header-icon ird-modal__header-icon--danger">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </div>
                <div>
                  <h2>تأكيد الحذف</h2>
                  <p>هذا الإجراء لا يمكن التراجع عنه</p>
                </div>
                <button class="ird-modal__close" type="button" @click="closeDeleteModal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div class="ird-modal__body">
                <div class="ird-delete-body">
                  <div class="ird-delete-body__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <p>
                    هل تريد حذف معاينة
                    <strong>{{ getMonthName(deleteTarget?.month) }} {{ deleteTarget?.year }}</strong>؟
                  </p>
                </div>
              </div>

              <div class="ird-modal__footer">
                <button class="ird-btn ird-btn--ghost" type="button" @click="closeDeleteModal">إلغاء</button>
                <button class="ird-btn ird-btn--danger" type="button" :disabled="deleting" @click="confirmDelete">
                  <span v-if="deleting" class="ird-btn-spin"></span>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  </svg>
                  {{ deleting ? 'جاري الحذف…' : 'نعم، احذف' }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

  </BasePageWrapper>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import axiosClient from "@/api/axiosClient";
import { toast } from "vue-sonner";

const router = useRouter();
const route  = useRoute();

// ═══ State ═══
const saving    = ref(false);
const deleting  = ref(false);
const search          = ref("");
const selectedYear    = ref(new Date().getFullYear());
const isYearDropdownOpen = ref(false);

const showFormModal   = ref(false);
const showDeleteModal = ref(false);
const showViewModal   = ref(false);
const isEditing       = ref(false);
const deleteTarget    = ref(null);
const viewTarget      = ref(null);

// Page data from localStorage (passed by the listing page)
const pageData = ref({
  userId:      "",
  userName:    "",
  farmId:      route.params.farmId || "",
  farmName:    "",
  inspections: [],
});

const allRecords = ref([]);

const form = reactive({
  id:    null,
  year:  new Date().getFullYear(),
  month: new Date().getMonth(),
  technical_inspection:      "",
  technical_recommendations: "",
});

const formErrors = reactive({
  year:  "",
  month: "",
});

// ═══ Constants ═══
const monthsList = [
  { value: 0,  label: "يناير"  },
  { value: 1,  label: "فبراير" },
  { value: 2,  label: "مارس"   },
  { value: 3,  label: "أبريل"  },
  { value: 4,  label: "مايو"   },
  { value: 5,  label: "يونيو"  },
  { value: 6,  label: "يوليو"  },
  { value: 7,  label: "أغسطس"  },
  { value: 8,  label: "سبتمبر" },
  { value: 9,  label: "أكتوبر" },
  { value: 10, label: "نوفمبر" },
  { value: 11, label: "ديسمبر" },
];

const availableYears = computed(() => {
  const years = new Set();
  const records = allRecords.value;
  records.forEach(i => years.add(i.year));
  return Array.from(years).sort((a, b) => b - a);
});

const yearsList = computed(() => {
  const now = new Date().getFullYear();
  const arr = [];
  for (let y = now + 1; y >= 2020; y--) arr.push(y);
  return arr;
});

// ═══ Computed ═══
const recordsWithInspection = computed(() =>
  allRecords.value.filter((r) => r.technical_inspection).length
);
const recordsWithRecommendations = computed(() =>
  allRecords.value.filter((r) => r.technical_recommendations).length
);

const filteredRecords = computed(() => {
  const term = normalizeSearch(search.value);
  const yearFilter = selectedYear.value;
  let records = [...allRecords.value];

  if (yearFilter) {
    records = records.filter(r => r.year === yearFilter);
  }

  if (!term) return records;

  return records.filter((r) => {
    const text = normalizeSearch(
      [(r.technical_inspection || ""), (r.technical_recommendations || "")].join(" ")
    );
    return text.includes(term);
  });
});

// ═══ Lifecycle ═══
onMounted(() => {
  const stored = localStorage.getItem("ir_farm_details");
  if (stored) {
    try {
      const data = JSON.parse(stored);
      pageData.value = data;
      allRecords.value = (data.inspections || []).sort((a, b) =>
        b.year !== a.year ? b.year - a.year : b.month - a.month
      );
    } catch { /* ignore */ }
  }
});

// ═══ Helpers ═══
function getMonthName(idx) {
  const m = monthsList.find((x) => x.value === Number(idx));
  return m ? m.label : `شهر ${idx}`;
}

function normalizeSearch(v) {
  return String(v || "")
    .toLowerCase()
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

function goBack() {
  router.push({ name: "inspections_recommendations" });
}

// ═══ Form Modal ═══
function openAddModal() {
  isEditing.value = false;
  Object.assign(form, {
    id:    null,
    year:  new Date().getFullYear(),
    month: new Date().getMonth(),
    technical_inspection:      "",
    technical_recommendations: "",
  });
  clearErrors();
  showFormModal.value = true;
}

function openEditModal(record) {
  isEditing.value = true;
  Object.assign(form, {
    id:    record.id,
    year:  record.year,
    month: record.month,
    technical_inspection:      record.technical_inspection      || "",
    technical_recommendations: record.technical_recommendations || "",
  });
  clearErrors();
  showFormModal.value = true;
}

function closeFormModal() { showFormModal.value = false; }

function clearErrors() { formErrors.year = ""; formErrors.month = ""; }

function validateForm() {
  clearErrors();
  let ok = true;
  if (!form.year) { formErrors.year = "يرجى اختيار السنة."; ok = false; }
  if (form.month === "" || form.month === null || form.month === undefined) {
    formErrors.month = "يرجى اختيار الشهر.";
    ok = false;
  }
  return ok;
}

async function submitForm() {
  if (!validateForm()) return;
  saving.value = true;

  const payload = {
    farm_id: Number(pageData.value.farmId),
    year:    Number(form.year),
    month:   Number(form.month),
    technical_inspection:      form.technical_inspection      || null,
    technical_recommendations: form.technical_recommendations || null,
  };

  try {
    if (isEditing.value) {
      const res     = await axiosClient.put(`/monthly-inspections/${form.id}`, payload);
      const updated = res?.data?.data || res?.data || payload;
      const idx     = allRecords.value.findIndex((r) => r.id === form.id);
      if (idx !== -1) allRecords.value[idx] = { ...allRecords.value[idx], ...updated };
      toast.success("تم تحديث المعاينة بنجاح ✅");
    } else {
      const res     = await axiosClient.post("/monthly-inspections", payload);
      const created = res?.data?.data || res?.data;
      if (created) {
        allRecords.value.unshift(created);
      }
      toast.success("تم إضافة المعاينة بنجاح ✅");
    }
    closeFormModal();
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      Object.values(err?.response?.data?.errors || {})?.[0]?.[0] ||
      err?.message || "حدث خطأ أثناء الحفظ.";
    toast.error(msg);
  } finally {
    saving.value = false;
  }
}

// ═══ View Modal ═══
function openViewModal(record) { viewTarget.value = record; showViewModal.value = true; }
function closeViewModal()      { showViewModal.value = false; viewTarget.value = null; }

// ═══ Delete Modal ═══
function openDeleteModal(record)   { deleteTarget.value = record; showDeleteModal.value = true; }
function closeDeleteModal()        { showDeleteModal.value = false; deleteTarget.value = null; }

async function confirmDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await axiosClient.delete(`/monthly-inspections/${deleteTarget.value.id}`);
    allRecords.value = allRecords.value.filter((r) => r.id !== deleteTarget.value.id);
    toast.success("تم حذف المعاينة بنجاح 🗑️");
    closeDeleteModal();
  } catch (err) {
    toast.error(err?.response?.data?.message || err?.message || "حدث خطأ أثناء الحذف.");
  } finally {
    deleting.value = false;
  }
}

function closeYearDropdown(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    isYearDropdownOpen.value = false;
  }
}
</script>

<style lang="scss" scoped>
.ird-page {
  display: flex;
  flex-direction: column;
  gap: 26px;
  direction: rtl;
}

/* ═══ Back ═══ */
.ird-back-row { display: flex; }

.ird-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  border: 1px solid #dbe3ee;
  border-radius: 14px;
  background: #fff;
  color: #334155;
  font-size: 14px;
  font-weight: 950;
  cursor: pointer;
  transition: 0.2s ease;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);

  svg { width: 16px; height: 16px; stroke: #64748b; }

  &:hover {
    background: #f1f5f9;
    transform: translateX(3px);
  }
}

/* ═══ Hero ═══ */
.ird-hero {
  position: relative;
  overflow: hidden;
  padding: 24px 32px;
  border-radius: 24px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
  box-shadow: 0 24px 50px rgba(29, 78, 216, 0.25);
}

.ird-hero__glow {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.2);
  filter: blur(60px);
  top: -80px;
  right: -60px;
  pointer-events: none;
}

.ird-hero__top { margin-bottom: 16px; }

.ird-hero__breadcrumb {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 900;

  svg { width: 14px; height: 14px; stroke: rgba(255,255,255,0.4); }
  span:last-child { color: #c7d2fe; }
}

.ird-hero__body {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.ird-hero__icon {
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);

  svg { width: 28px; height: 28px; stroke: #93c5fd; }
}

.ird-hero__eyebrow {
  color: #818cf8;
  font-size: 13px;
  font-weight: 950;
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ird-hero__info h1 {
  margin: 0 0 6px;
  font-size: clamp(24px, 2.5vw, 34px);
  font-weight: 950;
  line-height: 1.1;
}

.ird-hero__sub {
  margin: 0;
  color: rgba(255, 255, 255, 0.65);
  font-size: 15px;
  font-weight: 700;
}

.ird-hero__stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.ird-stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 24px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.12);

  strong {
    color: #fff;
    font-size: 32px;
    font-weight: 950;
    line-height: 1;
  }

  span {
    color: rgba(255, 255, 255, 0.62);
    font-size: 13px;
    font-weight: 900;
  }
}

/* ═══ Toolbar ═══ */
.ird-toolbar {
  display: flex;
  gap: 14px;
  align-items: center;
}

.ird-toolbar__search {
  flex: 1;
  min-height: 60px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid #dbe3ee;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);

  > svg { width: 20px; height: 20px; flex: 0 0 20px; stroke: #94a3b8; }

  input {
    flex: 1;
    border: 0;
    outline: 0;
    background: transparent;
    color: #0f172a;
    font-size: 15px;
    font-weight: 800;
    &::placeholder { color: #94a3b8; font-weight: 700; }
  }

  button {
    border: 0;
    background: transparent;
    cursor: pointer;
    padding: 4px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    svg { width: 15px; height: 15px; stroke: #94a3b8; }
    &:hover svg { stroke: #ef4444; }
  }
}

/* Custom Select Dropdown */
.ird-custom-select {
  position: relative;
  min-width: 170px;
  outline: none;
}

.ird-custom-select__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px 0 20px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
  cursor: pointer;
  transition: all 0.3s ease;
}

.ird-custom-select__trigger:hover {
  border-color: #cbd5e1;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.ird-custom-select.is-open .ird-custom-select__trigger {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}

.ird-custom-select__value {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;

  svg { width: 18px; height: 18px; stroke: #6366f1; opacity: 0.8; }
}

.ird-custom-select__arrow {
  display: grid;
  place-items: center;
  transition: transform 0.3s ease;
  svg { width: 18px; height: 18px; stroke: #94a3b8; }
}

.ird-custom-select.is-open .ird-custom-select__arrow {
  transform: rotate(180deg);
  svg { stroke: #6366f1; }
}

.ird-custom-select__menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 100%;
  min-width: 200px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ird-custom-select__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: none;
  background: transparent;
  padding: 12px 16px;
  border-radius: 10px;
  color: #475569;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: right;
}

.ird-custom-select__option:hover {
  background: #f8fafc;
  color: #0f172a;
}

.ird-custom-select__option.is-active {
  background: #e0e7ff;
  color: #4f46e5;
}

.ird-check-icon {
  width: 18px;
  height: 18px;
  stroke: #4f46e5;
}

.ird-dropdown-enter-active, .ird-dropdown-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ird-dropdown-enter-from, .ird-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.ird-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 60px;
  padding: 0 26px;
  border: 0;
  border-radius: 18px;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #fff;
  font-size: 14px;
  font-weight: 950;
  cursor: pointer;
  box-shadow: 0 12px 26px rgba(99, 102, 241, 0.3);
  transition: 0.2s ease;
  white-space: nowrap;

  svg { width: 18px; height: 18px; }

  &:hover { transform: translateY(-2px); box-shadow: 0 16px 34px rgba(99, 102, 241, 0.38); }
}

/* ═══ Empty ═══ */
.ird-empty {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
  padding: 48px;
  border-radius: 26px;
  background: #fff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);

  &__icon {
    width: 68px;
    height: 68px;
    display: grid;
    place-items: center;
    border-radius: 20px;
    background: #f1f5f9;
    svg { width: 36px; height: 36px; stroke: #94a3b8; }
  }

  h3 { margin: 0; color: #0f172a; font-size: 24px; font-weight: 950; }
  p  { margin: 0; color: #64748b; font-size: 15px; font-weight: 800; }

  button {
    border: 0;
    padding: 13px 22px;
    border-radius: 13px;
    background: #6366f1;
    color: #fff;
    font-size: 14px;
    font-weight: 950;
    cursor: pointer;
    transition: 0.2s ease;
    &:hover { background: #4f46e5; transform: translateY(-2px); }
  }
}

/* ═══ Records Grid ═══ */
.ird-records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 22px;
}

.ird-record-card {
  display: flex;
  flex-direction: column;
  border-radius: 22px;
  background: #fff;
  border: 1px solid #dbe3ee;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.07);
  position: relative;
  z-index: 1;
  transition: 0.25s ease, z-index 0s;

  &:hover { box-shadow: 0 22px 50px rgba(15, 23, 42, 0.11); transform: translateY(-3px); z-index: 5; }
}

.ird-record-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #f8fafc, #fff);
  border-bottom: 1px solid #f1f5f9;
  border-radius: 22px 22px 0 0;
}

.ird-record-card__date { display: flex; align-items: center; gap: 8px; }

.ird-record-card__month {
  padding: 7px 16px;
  border-radius: 11px;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #fff;
  font-size: 14px;
  font-weight: 950;
  box-shadow: 0 5px 12px rgba(99, 102, 241, 0.22);
}

.ird-record-card__year {
  padding: 7px 14px;
  border-radius: 11px;
  background: #f1f5f9;
  color: #475569;
  font-size: 14px;
  font-weight: 900;
  border: 1px solid #e2e8f0;
}

.ird-record-card__actions { display: flex; gap: 6px; }

.ird-act-btn {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 11px;
  cursor: pointer;
  transition: 0.18s ease;

  svg { width: 14px; height: 14px; }

  &--edit {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    svg { stroke: #3b82f6; }
    &:hover { background: #dbeafe; transform: scale(1.1); }
  }

  &--delete {
    background: #fef2f2;
    border: 1px solid #fecaca;
    svg { stroke: #ef4444; }
    &:hover { background: #fee2e2; transform: scale(1.1); }
  }
}

.ird-record-card__body {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  cursor: pointer;
}

.ird-record-field {}

.ird-record-field__label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0f172a;
  font-size: 15px;
  font-weight: 950;
  margin-bottom: 8px;

  svg { width: 16px; height: 16px; stroke: #6366f1; }
}

.ird-record-field__text {
  margin: 0;
  color: #475569;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.8;
  white-space: pre-wrap;
  
  &--clamp3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

/* Thought Bubble Tooltip */
.ird-thought-bubble-container {
  position: relative;
}

.ird-thought-bubble {
  position: absolute;
  bottom: 100%;
  right: 15px; /* Aligned with text roughly */
  transform: translateY(10px) scale(0.95);
  transform-origin: bottom right;
  margin-bottom: 25px; /* space for tail */
  width: max-content;
  max-width: 360px;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  box-shadow: 0 10px 40px rgba(15, 23, 42, 0.4);
  padding: 14px 20px;
  border-radius: 20px;
  color: #f8fafc;
  font-size: 13.5px;
  font-weight: 700;
  line-height: 1.6;
  opacity: 0;
  visibility: hidden;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 999;
  white-space: pre-wrap;
  word-break: break-word;
  cursor: auto;
}

.ird-bubble-tail-1 {
  position: absolute;
  bottom: -10px;
  right: 20px;
  width: 14px;
  height: 14px;
  background: #1e293b;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(15, 23, 42, 0.1);
}

.ird-bubble-tail-2 {
  position: absolute;
  bottom: -20px;
  right: 28px;
  width: 7px;
  height: 7px;
  background: #0f172a;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(15, 23, 42, 0.1);
}

.ird-thought-bubble-container:hover .ird-thought-bubble {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.ird-record-field__divider {
  height: 1px;
  background: #e2e8f0;
  margin: 6px 0;
  border-radius: 1px;
}

.ird-record-field__empty {
  color: #94a3b8;
  font-size: 13px;
  font-weight: 800;
  text-align: center;
  padding: 8px 0;
}

/* ═══ Modal ═══ */
.ird-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  padding: 20px;
}

.ird-modal {
  width: 100%;
  max-width: 640px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 40px 80px rgba(15, 23, 42, 0.22);
  overflow: hidden;

  &--sm { max-width: 440px; }
}

.ird-modal__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #f8fafc, #fff);

  &--danger {
    background: linear-gradient(135deg, #fef2f2, #fff);
    border-bottom-color: #fecaca;
  }

  h2 { margin: 0; color: #0f172a; font-size: 19px; font-weight: 950; }
  p  { margin: 4px 0 0; color: #64748b; font-size: 13px; font-weight: 800; }
}

.ird-modal__header-icon {
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: #eef2ff;

  svg { width: 20px; height: 20px; stroke: #6366f1; }

  &--danger { background: #fef2f2; svg { stroke: #ef4444; } }
}

.ird-modal__close {
  margin-right: auto;
  margin-left: 0;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: #f1f5f9;
  cursor: pointer;
  transition: 0.15s ease;

  svg { width: 14px; height: 14px; stroke: #64748b; }

  &:hover { background: #e2e8f0; svg { stroke: #0f172a; } }
}

.ird-modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ird-modal__footer {
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.ird-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.ird-form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.ird-form-label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 950;

  svg { width: 14px; height: 14px; stroke: #64748b; flex: 0 0 14px; }
}

.ird-required { color: #ef4444; }

.ird-form-select,
.ird-form-textarea {
  padding: 12px 15px;
  border-radius: 13px;
  border: 1.5px solid #dbe3ee;
  background: #f8fafc;
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  font-family: inherit;
  direction: rtl;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    background: #fff;
  }
}

.ird-form-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.7;
}

.ird-form-error { color: #ef4444; font-size: 12px; font-weight: 900; }

.ird-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 0 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 950;
  border: 0;
  cursor: pointer;
  transition: 0.2s ease;

  svg { width: 15px; height: 15px; }

  &--primary {
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    color: #fff;
    box-shadow: 0 10px 22px rgba(99, 102, 241, 0.26);
    svg { stroke: rgba(255,255,255,0.85); }
    &:hover:not(:disabled) { transform: translateY(-2px); }
    &:disabled { opacity: 0.65; cursor: not-allowed; }
  }

  &--danger {
    background: linear-gradient(135deg, #dc2626, #ef4444);
    color: #fff;
    box-shadow: 0 10px 22px rgba(239, 68, 68, 0.24);
    svg { stroke: rgba(255,255,255,0.85); }
    &:hover:not(:disabled) { transform: translateY(-2px); }
    &:disabled { opacity: 0.65; cursor: not-allowed; }
  }

  &--ghost { background: #f1f5f9; color: #475569; &:hover { background: #e2e8f0; } }
}

.ird-btn-spin {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  animation: ird-spin 0.8s linear infinite;
}

.ird-delete-body {
  text-align: center;
  padding: 8px 0;

  &__icon {
    width: 70px;
    height: 70px;
    margin: 0 auto 16px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #fffbeb;
    border: 2px solid #fde68a;
    svg { width: 32px; height: 32px; stroke: #d97706; }
  }

  p {
    color: #0f172a;
    font-size: 15px;
    font-weight: 800;
    line-height: 1.8;
    margin: 0;
    strong { color: #4f46e5; }
  }
}

@keyframes ird-spin { to { transform: rotate(360deg); } }

.ird-fade-enter-active, .ird-fade-leave-active { transition: opacity 0.3s ease; }
.ird-fade-enter-from, .ird-fade-leave-to { opacity: 0; }

.ird-scale-enter-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.ird-scale-leave-active { transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1); }
.ird-scale-enter-from, .ird-scale-leave-to { opacity: 0; transform: scale(0.96) translateY(8px); }

@media (max-width: 760px) {
  .ird-hero { padding: 22px; }
  .ird-hero__body { flex-direction: column; }
  .ird-hero__stats { flex-direction: column; }
  .ird-toolbar { flex-direction: column; align-items: stretch; }
  .ird-add-btn { justify-content: center; }
  .ird-records-grid { grid-template-columns: 1fr; }
  .ird-form-row { grid-template-columns: 1fr; }
}
</style>
