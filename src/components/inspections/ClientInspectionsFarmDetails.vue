<template>
  <BasePageWrapper
    titleKey="تفاصيل المعاينات والتوصيات"
    subtitleKey="Farm Inspection Details"
    iconName="solar:document-medicine-outline"
  >
    <section class="ird-page" dir="rtl">

      <!-- ═══════════════════════════════════ HERO ═══ -->
      <div class="ird-hero">
        <div class="ird-hero__glow ird-hero__glow--a"></div>
        <div class="ird-hero__glow ird-hero__glow--b"></div>

        <div class="ird-hero__content">
          <div class="ird-hero__breadcrumb">
            <span class="ird-hero__breadcrumb-item">مزارعك</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span class="ird-hero__breadcrumb-item ird-hero__breadcrumb-item--active">مزرعة {{ pageData.farmName }}</span>
          </div>

          <h1>تفاصيل المزرعة</h1>
          <p>جميع سجلات المعاينات الفنية والتوصيات لهذه المزرعة.</p>

          <div class="ird-hero__chips">
            <div class="ird-hero__chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <span>{{ filteredRecords.length }} سجل متاح</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════ TOOLBAR ═══ -->
      <div class="ird-toolbar">
        <div class="ird-toolbar__search">
          <svg class="ird-toolbar__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            v-model="search"
            type="text"
            autocomplete="off"
            placeholder="ابحث في المعاينات والتوصيات…"
          />
          <button v-if="search" class="ird-toolbar__clear" type="button" @click="search = ''">
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
        <button v-if="!pageData.isSingle" class="ird-btn ird-btn--outline" type="button" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M5 12l7-7M5 12l7 7"/>
          </svg>
          رجوع للقائمة
        </button>
      </div>

      <!-- ═══════════════════════════════════ STATE ═══ -->
      <div v-if="filteredRecords.length === 0" class="ird-state ird-state--empty">
        <div class="ird-state__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <h3>لا توجد سجلات</h3>
        <p>{{ search ? 'لم يتم العثور على نتائج تطابق بحثك.' : 'لم يتم إضافة أي معاينات لهذه المزرعة بعد.' }}</p>
      </div>

      <!-- ═══════════════════════════════════ RECORDS GRID ═══ -->
      <div v-else class="ird-records-grid">
        <div v-for="record in filteredRecords" :key="record.id" class="ird-record-card">
          <!-- Header -->
          <div class="ird-record-card__top">
            <div class="ird-record-card__date">
              <span class="ird-record-card__month">{{ getMonthName(record.month) }}</span>
              <span class="ird-record-card__year">{{ record.year }}</span>
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
              لا يوجد محتوى مسجل.
            </p>
          </div>
        </div>
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

  </BasePageWrapper>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// ══════════════════════════════════════ STATE ══
const search          = ref("");
const selectedYear    = ref(new Date().getFullYear());
const isYearDropdownOpen = ref(false);
const showViewModal   = ref(false);
const viewTarget      = ref(null);

// Page data from localStorage (passed by the listing page)
const pageData = ref({
  farmId:      null,
  farmName:    "",
  inspections: [],
  isSingle:    false,
});

// ══════════════════════════════════════ CONSTANTS ══
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

// ══════════════════════════════════════ LIFECYCLE ══
onMounted(() => {
  const stored = localStorage.getItem("ir_farm_details");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      pageData.value = parsed;
    } catch (err) {
      console.error("Failed to parse farm details", err);
    }
  } else {
    // If accessed directly without data, better to go back
    goBack();
  }
});

// ══════════════════════════════════════ COMPUTED ══
const availableYears = computed(() => {
  const years = new Set();
  const records = pageData.value.inspections || [];
  records.forEach(i => years.add(i.year));
  return Array.from(years).sort((a, b) => b - a);
});

const filteredRecords = computed(() => {
  const term = normalizeSearch(search.value);
  const yearFilter = selectedYear.value;
  let records = pageData.value.inspections || [];
  
  // Sort descending by year then month
  records = [...records].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  if (yearFilter) {
    records = records.filter(r => r.year === yearFilter);
  }

  if (!term) {
    return records;
  }

  return records.filter(r => {
    const text = normalizeSearch(`${r.technical_inspection || ""} ${r.technical_recommendations || ""}`);
    return text.includes(term);
  });
});

// ══════════════════════════════════════ MODALS ══
function openViewModal(record) { viewTarget.value = record; showViewModal.value = true; }
function closeViewModal()      { showViewModal.value = false; viewTarget.value = null; }

// ══════════════════════════════════════ HELPERS ══
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
  router.push({ name: "client_inspections_recommendations" });
}

function closeYearDropdown(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    isYearDropdownOpen.value = false;
  }
}
</script>

<style lang="scss" scoped>
/* ════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════ */
.ird-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
  direction: rtl;
}

/* ════════════════════════════════════════════════════
   HERO
════════════════════════════════════════════════════ */
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
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;

  &--a { width: 300px; height: 300px; background: rgba(99, 102, 241, 0.2); top: -100px; right: -50px; }
  &--b { width: 250px; height: 250px; background: rgba(14, 165, 233, 0.15); bottom: -100px; left: 10%; }
}

.ird-hero__content { position: relative; z-index: 1; }

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

.ird-hero__breadcrumb {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  padding: 8px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  font-size: 13px;
  font-weight: 800;

  svg { width: 14px; height: 14px; stroke: #64748b; }
}

.ird-hero__breadcrumb-item {
  &--active { color: #e2e8f0; font-weight: 950; }
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

.ird-hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.ird-hero__chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 14px;
  font-weight: 900;

  svg { width: 16px; height: 16px; opacity: 0.8; }
}

/* ════════════════════════════════════════════════════
   TOOLBAR
════════════════════════════════════════════════════ */
.ird-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
}

.ird-toolbar__search {
  flex: 1;
  min-width: 280px;
  min-height: 56px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid #dbe3ee;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);

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
}

.ird-toolbar__search-icon { width: 20px; height: 20px; flex: 0 0 20px; stroke: #94a3b8; }

.ird-toolbar__clear {
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;

  svg { width: 16px; height: 16px; stroke: #94a3b8; }
  &:hover svg { stroke: #ef4444; }
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

/* Buttons */
.ird-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 22px;
  height: 50px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 950;
  cursor: pointer;
  transition: 0.2s ease;
  border: 0;

  svg { width: 18px; height: 18px; }

  &--outline {
    background: #fff;
    border: 1px solid #cbd5e1;
    color: #475569;
    &:hover { background: #f8fafc; border-color: #94a3b8; color: #0f172a; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06); }
  }
  
  &--ghost {
    background: transparent;
    color: #475569;
    &:hover { background: #f1f5f9; color: #0f172a; }
  }
}

/* ════════════════════════════════════════════════════
   STATE VIEWS
════════════════════════════════════════════════════ */
.ird-state {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px;
  border-radius: 28px;
  background: #fff;
  border: 1px solid #e5e7eb;
  gap: 14px;

  &__icon {
    width: 64px;
    height: 64px;
    display: grid;
    place-items: center;
    border-radius: 20px;
    background: #f1f5f9;
    svg { width: 32px; height: 32px; stroke: #94a3b8; }
  }

  h3 { margin: 0; color: #0f172a; font-size: 22px; font-weight: 950; }
  p { margin: 0; color: #64748b; font-size: 15px; font-weight: 800; }
}

/* ════════════════════════════════════════════════════
   RECORDS GRID
════════════════════════════════════════════════════ */
.ird-records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 24px;
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
  padding: 6px 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #fff;
  font-size: 13px;
  font-weight: 950;
}

.ird-record-card__year {
  padding: 6px 14px;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
  font-size: 13px;
  font-weight: 900;
  border: 1px solid #e2e8f0;
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
  font-size: 14px;
  font-weight: 800;
}

/* ════════════════════════════════════════════════════
   MODALS
════════════════════════════════════════════════════ */
.ird-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  direction: rtl;
}

.ird-modal {
  width: 100%;
  max-width: 650px;
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.15);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.ird-modal__header {
  padding: 24px 30px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 18px;

  h2 { margin: 0; color: #0f172a; font-size: 22px; font-weight: 950; }
  p { margin: 4px 0 0; color: #64748b; font-size: 14px; font-weight: 700; }
}

.ird-modal__header-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: #e0e7ff;
  svg { width: 26px; height: 26px; stroke: #4f46e5; }
}

.ird-modal__close {
  margin-right: auto;
  margin-left: 0;
  width: 34px;
  height: 34px;
  border: 0;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 10px;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: 0.2s ease;

  svg { width: 18px; height: 18px; }
  &:hover { background: #fee2e2; color: #ef4444; transform: rotate(90deg); }
}

.ird-modal__body {
  padding: 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.ird-modal__footer {
  padding: 20px 30px;
  border-top: 1px solid #f1f5f9;
  background: #fafbfc;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-radius: 0 0 28px 28px;
}

/* Transitions */
.ird-fade-enter-active, .ird-fade-leave-active { transition: opacity 0.3s ease; }
.ird-fade-enter-from, .ird-fade-leave-to { opacity: 0; }

.ird-scale-enter-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.ird-scale-leave-active { transition: all 0.2s ease-in; }
.ird-scale-enter-from { opacity: 0; transform: scale(0.95) translateY(10px); }
.ird-scale-leave-to { opacity: 0; transform: scale(0.98) translateY(5px); }

/* ════════════════════════════════════════════════════
   RESPONSIVE
════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  .ird-hero { padding: 28px 24px; border-radius: 24px; }
  .ird-hero__content h1 { font-size: 28px; }
  .ird-records-grid { grid-template-columns: 1fr; }
}
</style>
