<template>
  <BasePageWrapper
    titleKey="التوصيات والمعاينات الفنية"
    subtitleKey="Technical Inspections & Recommendations"
    iconName="solar:document-medicine-outline"
  >
    <section class="ir-page" dir="rtl">

      <!-- ═══════════════════════════════════ HERO ═══ -->
      <div class="ir-hero">
        <div class="ir-hero__glow ir-hero__glow--a"></div>
        <div class="ir-hero__glow ir-hero__glow--b"></div>

        <div class="ir-hero__content">
          <div class="ir-hero__badge">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <circle cx="4" cy="4" r="4" fill="#818cf8"/>
            </svg>
            متابعة المعاينات الشهرية
          </div>
          <h1>التوصيات <span class="ir-hero__accent">&amp;</span> المعاينات الفنية</h1>
          <p>تابع السجلات التاريخية لمعاينات المزارع الخاصة بك وتوصيات الدعم الفني.</p>

          <div class="ir-hero__chips">
            <div class="ir-hero__chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>{{ totalFarms }} مزرعة</span>
            </div>
            <div class="ir-hero__chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <span>{{ totalInspections }} سجل</span>
            </div>
          </div>
        </div>

        <div class="ir-hero__stats">
          <div class="ir-stat">
            <div class="ir-stat__icon ir-stat__icon--green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <span class="ir-stat__label">المزارع</span>
              <strong class="ir-stat__value">{{ totalFarms }}</strong>
            </div>
          </div>
          <div class="ir-stat">
            <div class="ir-stat__icon ir-stat__icon--amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div>
              <span class="ir-stat__label">إجمالي السجلات</span>
              <strong class="ir-stat__value">{{ totalInspections }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════ TOOLBAR ═══ -->
      <div class="ir-toolbar">
        <div class="ir-toolbar__search">
          <svg class="ir-toolbar__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            v-model="search"
            type="text"
            autocomplete="off"
            placeholder="ابحث باسم المزرعة أو التوصية…"
          />
          <button v-if="search" class="ir-toolbar__clear" type="button" @click="search = ''">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- ═══════════════════════════════════ LOADING ═══ -->
      <div v-if="loading" class="ir-state">
        <div class="ir-spinner"></div>
        <p>جاري تحميل البيانات…</p>
      </div>

      <!-- ═══════════════════════════════════ ERROR ═══ -->
      <div v-else-if="errorMessage" class="ir-state ir-state--error">
        <div class="ir-state__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3>حدث خطأ أثناء التحميل</h3>
        <p>{{ errorMessage }}</p>
        <button type="button" @click="loadData">حاول مرة أخرى</button>
      </div>

      <!-- ═══════════════════════════════════ EMPTY ═══ -->
      <div v-else-if="filteredFarms.length === 0" class="ir-state ir-state--empty">
        <div class="ir-state__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <h3>لا توجد نتائج</h3>
        <p>{{ search ? 'لا يوجد ما يطابق بحثك.' : 'لا توجد معاينات مسجلة لمزارعك حتى الآن.' }}</p>
      </div>

      <!-- ═══════════════════════════════════ FARMS GRID ═══ -->
      <div v-else class="ir-farms-grid">
        <div
          v-for="farmGroup in filteredFarms"
          :key="farmGroup.farmId"
          class="ir-farm-block"
        >
          <!-- Farm Block Header -->
          <div class="ir-farm-block__header">
            <div class="ir-farm-block__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div class="ir-farm-block__info">
              <span class="ir-farm-block__label">مزرعة</span>
              <h3>{{ farmGroup.farmName }}</h3>
            </div>
            <div class="ir-farm-block__badge">
              {{ farmGroup.inspections.length }}
              <span>سجل</span>
            </div>
          </div>

          <!-- Preview records (max 2) -->
          <div v-if="farmGroup.inspections.length > 0" class="ir-preview-records">
            <div
              v-for="record in farmGroup.inspections.slice(0, 2)"
              :key="record.id"
              class="ir-preview-record"
            >
              <div class="ir-preview-record__head">
                <div class="ir-preview-record__date">
                  <span class="ir-preview-record__month">{{ getMonthName(record.month) }}</span>
                  <span class="ir-preview-record__year">{{ record.year }}</span>
                </div>
              </div>

              <div class="ir-preview-record__body">
                <div v-if="record.technical_inspection" class="ir-preview-record__field">
                  <span class="ir-preview-record__field-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    المعاينة الفنية
                  </span>
                  <div class="ir-thought-bubble-container">
                    <p class="ir-preview-record__field-text ir-preview-record__field-text--clamp1">{{ record.technical_inspection }}</p>
                    <div class="ir-thought-bubble">
                      {{ record.technical_inspection }}
                      <div class="ir-bubble-tail-1"></div>
                      <div class="ir-bubble-tail-2"></div>
                    </div>
                  </div>
                </div>
                
                <div class="ir-preview-record__divider" v-if="record.technical_inspection && record.technical_recommendations"></div>

                <div v-if="record.technical_recommendations" class="ir-preview-record__field">
                  <span class="ir-preview-record__field-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    التوصيات الفنية
                  </span>
                  <div class="ir-thought-bubble-container">
                    <p class="ir-preview-record__field-text ir-preview-record__field-text--clamp1">{{ record.technical_recommendations }}</p>
                    <div class="ir-thought-bubble">
                      {{ record.technical_recommendations }}
                      <div class="ir-bubble-tail-1"></div>
                      <div class="ir-bubble-tail-2"></div>
                    </div>
                  </div>
                </div>
                
                <p v-if="!record.technical_inspection && !record.technical_recommendations" class="ir-preview-record__empty">
                  لا يوجد محتوى مسجل.
                </p>
              </div>
            </div>
          </div>
          <div v-else class="ir-preview-records ir-preview-records--empty">
            <p class="ir-preview-record__empty">لا توجد معاينات مسجلة لهذه المزرعة.</p>
          </div>

          <!-- Footer: show more button -->
          <div class="ir-farm-block__footer">
            <button
              v-if="farmGroup.inspections.length > 0"
              class="ir-show-more-btn"
              type="button"
              @click="goToFarmDetails(farmGroup)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              عرض كل السجلات
              <span class="ir-show-more-btn__count">{{ farmGroup.inspections.length }}</span>
              <svg class="ir-show-more-btn__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

    </section>
  </BasePageWrapper>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import axiosClient from "@/api/axiosClient";

const router = useRouter();

// ══════════════════════════════════════ STATE ══
const loading      = ref(false);
const errorMessage = ref("");
const search       = ref("");

const allFarms       = ref([]);
const allInspections = ref([]);

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

// ══════════════════════════════════════ COMPUTED ══
const totalFarms       = computed(() => allFarms.value.length);
const totalInspections = computed(() => {
  return filteredFarms.value.reduce((acc, farm) => acc + farm.inspections.length, 0);
});

/**
 * Build hierarchical: farms → inspections
 * Filtered by search term
 */
const filteredFarms = computed(() => {
  const term = normalizeSearch(search.value);

  // Group inspections by farm
  const farmGroups = {};

  allFarms.value.forEach((farm) => {
    farmGroups[farm.id] = {
      farmId:      farm.id,
      farmName:    farm.name || farm.farm_name || `مزرعة #${farm.id}`,
      inspections: [],
    };
  });

  allInspections.value.forEach((record) => {
    if (farmGroups[record.farm_id]) {
      farmGroups[record.farm_id].inspections.push(record);
    }
  });

  // Filter based on search and return array
  return Object.values(farmGroups)
    .filter(farmGroup => {
      if (!term) return true;
      const text = normalizeSearch([
        farmGroup.farmName,
        ...farmGroup.inspections.map(i => `${i.technical_inspection || ""} ${i.technical_recommendations || ""}`)
      ].join(" "));
      return text.includes(term);
    })
    .sort((a, b) => a.farmName.localeCompare(b.farmName, "ar"));
});

// ══════════════════════════════════════ LIFECYCLE ══
onMounted(loadData);

// ══════════════════════════════════════ DATA ══
async function loadData() {
  loading.value   = true;
  errorMessage.value = "";

  try {
    const [farmsRes, inspRes] = await Promise.all([
      axiosClient.get("/farms",                { params: { per_page: 1000 } }), // backend filters user's farms automatically based on token
      axiosClient.get("/monthly-inspections",  { params: { per_page: 1000 } }),
    ]);

    allFarms.value       = extractArray(farmsRes?.data);
    
    // Sort inspections newest to oldest
    allInspections.value = extractArray(inspRes?.data).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    // IF USER ONLY HAS 1 FARM, REDIRECT TO DETAILS IMMEDIATELY
    if (allFarms.value.length === 1) {
      const farm = allFarms.value[0];
      const farmGroup = {
        farmId: farm.id,
        farmName: farm.name || farm.farm_name || `مزرعة #${farm.id}`,
        inspections: allInspections.value.filter(i => i.farm_id === farm.id),
        isSingle: true
      };
      localStorage.setItem("ir_farm_details", JSON.stringify(farmGroup));
      router.replace({ name: "client_inspections_farm_details", params: { farmId: farm.id } });
      return;
    }
  } catch (err) {
    console.error(err);
    errorMessage.value = err?.response?.data?.message || err?.message || "فشل تحميل البيانات.";
  } finally {
    loading.value = false;
  }
}

function extractArray(payload) {
  if (Array.isArray(payload))           return payload;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data))     return payload.data;
  return [];
}

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

// ══════════════════════════════════════ NAVIGATION ══
function goToFarmDetails(farmGroup) {
  const data = {
    userId:    "",
    userName:  "",
    farmId:    farmGroup.farmId,
    farmName:  farmGroup.farmName,
    inspections: farmGroup.inspections,
  };
  localStorage.setItem("ir_farm_details", JSON.stringify(data));
  router.push({ name: "client_inspections_farm_details", params: { farmId: farmGroup.farmId } });
}
</script>

<style lang="scss" scoped>
/* ════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════ */
.ir-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
  direction: rtl;
}

/* ════════════════════════════════════════════════════
   HERO
════════════════════════════════════════════════════ */
.ir-hero {
  position: relative;
  overflow: hidden;
  padding: 16px 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
  box-shadow: 0 24px 50px rgba(29, 78, 216, 0.25);
}

.ir-hero__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;

  &--a {
    width: 300px;
    height: 300px;
    background: rgba(99, 102, 241, 0.22);
    top: -80px;
    right: -60px;
  }

  &--b {
    width: 250px;
    height: 250px;
    background: rgba(16, 185, 129, 0.14);
    bottom: -80px;
    left: 30%;
  }
}

.ir-hero__content { position: relative; z-index: 1; }

.ir-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #c7d2fe;
  font-size: 14px;
  font-weight: 900;
  margin-bottom: 20px;

  svg { width: 8px; height: 8px; }
}

.ir-hero__content h1 {
  margin: 0 0 6px;
  font-size: clamp(20px, 2vw, 28px);
  font-weight: 950;
  line-height: 1.1;
  letter-spacing: -0.5px;
}

.ir-hero__accent { color: #bfdbfe; }

.ir-hero__content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
}

.ir-hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.ir-hero__chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e0e7ff;
  font-size: 13px;
  font-weight: 900;

  svg { width: 14px; height: 14px; opacity: 0.8; }
}

/* Stats */
.ir-hero__stats {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  justify-content: center;
  margin-top: 28px;
}

.ir-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  transition: background 0.2s ease;

  &:hover { background: rgba(255, 255, 255, 0.12); }
}

.ir-stat__icon {
  width: 50px;
  height: 50px;
  flex: 0 0 50px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  svg { width: 26px; height: 26px; stroke: #3b82f6; stroke-width: 2.2; }

  &--green  { svg { stroke: #10b981; } }
  &--amber  { svg { stroke: #f59e0b; } }
}

.ir-stat__label {
  display: block;
  color: rgba(255, 255, 255, 0.62);
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 4px;
}

.ir-stat__value {
  display: block;
  color: #fff;
  font-size: 24px;
  font-weight: 950;
  line-height: 1;
}

/* ════════════════════════════════════════════════════
   TOOLBAR
════════════════════════════════════════════════════ */
.ir-toolbar {
  display: flex;
  gap: 14px;
  align-items: center;
}

.ir-toolbar__search {
  flex: 1;
  min-height: 62px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #dbe3ee;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);

  input {
    flex: 1;
    border: 0;
    outline: 0;
    background: transparent;
    color: #0f172a;
    font-size: 16px;
    font-weight: 800;

    &::placeholder { color: #94a3b8; font-weight: 700; }
  }
}

.ir-toolbar__search-icon {
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  stroke: #94a3b8;
}

.ir-toolbar__clear {
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  display: grid;
  place-items: center;

  svg { width: 16px; height: 16px; stroke: #94a3b8; }

  &:hover svg { stroke: #ef4444; }
}

.ir-toolbar__select {
  height: 62px;
  padding: 0 20px;
  border-radius: 20px;
  border: 1px solid #dbe3ee;
  background: #fff;
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
  outline: none;
  cursor: pointer;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
  min-width: 140px;
}

/* ════════════════════════════════════════════════════
   STATE VIEWS
════════════════════════════════════════════════════ */
.ir-state {
  min-height: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px;
  border-radius: 28px;
  background: #fff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  gap: 14px;

  &__icon {
    width: 72px;
    height: 72px;
    display: grid;
    place-items: center;
    border-radius: 22px;
    background: #f1f5f9;

    svg { width: 38px; height: 38px; stroke: #94a3b8; }
  }

  h3 {
    margin: 0;
    color: #0f172a;
    font-size: 26px;
    font-weight: 950;
  }

  p {
    margin: 0;
    color: #64748b;
    font-size: 16px;
    font-weight: 800;
  }

  button {
    margin-top: 6px;
    border: 0;
    padding: 14px 24px;
    border-radius: 14px;
    background: #6366f1;
    color: #fff;
    font-size: 15px;
    font-weight: 950;
    cursor: pointer;
    transition: 0.2s ease;

    &:hover { background: #4f46e5; transform: translateY(-2px); }
  }

  &--error .ir-state__icon { background: #fef2f2; svg { stroke: #ef4444; } }
  &--error button           { background: #ef4444; &:hover { background: #dc2626; } }
}

.ir-spinner {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 5px solid #e0e7ff;
  border-top-color: #6366f1;
  animation: ir-spin 0.9s linear infinite;
}

/* ════════════════════════════════════════════════════
   FARMS GRID
════════════════════════════════════════════════════ */
.ir-farms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 28px;
}

/* ────── Farm Block */
.ir-farm-block {
  display: flex;
  flex-direction: column;
  border-radius: 26px;
  background: #fff;
  border: 1px solid #dbe3ee;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  position: relative;
  z-index: 1;
  transition: box-shadow 0.25s ease, transform 0.25s ease, z-index 0s;

  &:hover { 
    box-shadow: 0 20px 46px rgba(15, 23, 42, 0.1); 
    transform: translateY(-2px); 
    z-index: 5; 
  }
}

.ir-farm-block__header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f0f9ff, #fff);
  border-bottom: 1px solid #e0f2fe;
  border-radius: 26px 26px 0 0;
}

.ir-farm-block__icon {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: linear-gradient(135deg, #0369a1, #0ea5e9);
  box-shadow: 0 8px 18px rgba(14, 165, 233, 0.22);

  svg { width: 24px; height: 24px; stroke: #fff; }
}

.ir-farm-block__info { flex: 1; min-width: 0; }

.ir-farm-block__label {
  display: block;
  color: #0ea5e9;
  font-size: 13px;
  font-weight: 950;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ir-farm-block__info h3 {
  margin: 0;
  color: #0f172a;
  font-size: 20px;
  font-weight: 950;
  line-height: 1.3;
}

.ir-farm-block__badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  min-height: 60px;
  padding: 8px;
  border-radius: 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0369a1;
  font-size: 26px;
  font-weight: 950;
  line-height: 1;

  span { font-size: 11px; font-weight: 950; color: #0ea5e9; margin-top: 2px; }
}

/* ────── Preview records */
.ir-preview-records {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 20px;
  background: #f8fafc;
  flex: 1;

  &--empty {
    padding: 30px 20px;
    align-items: center;
    justify-content: center;
  }
}

.ir-preview-record {
  border-radius: 18px;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
  position: relative;
  z-index: 1;
  transition: z-index 0s;
  
  &:hover {
    z-index: 10;
  }
}

.ir-preview-record__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 20px;
  background: #fcfcfd;
  border-bottom: 1px solid #f1f5f9;
  border-radius: 18px 18px 0 0;
}

.ir-preview-record__date { display: flex; align-items: center; gap: 8px; }

.ir-preview-record__month {
  padding: 6px 14px;
  border-radius: 10px;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #fff;
  font-size: 13px;
  font-weight: 950;
}

.ir-preview-record__year {
  padding: 6px 12px;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
  font-size: 13px;
  font-weight: 900;
  border: 1px solid #e2e8f0;
}

.ir-preview-record__body {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ir-preview-record__field-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0f172a;
  font-size: 15px;
  font-weight: 950;
  margin-bottom: 8px;

  svg { width: 16px; height: 16px; stroke: #6366f1; }
}

.ir-preview-record__field-text {
  margin: 0;
  color: #475569;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.7;

  &--clamp1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

/* Thought Bubble Tooltip */
.ir-thought-bubble-container {
  position: relative;
}

.ir-thought-bubble {
  position: absolute;
  bottom: 100%;
  right: 15px;
  transform: translateY(10px) scale(0.95);
  transform-origin: bottom right;
  margin-bottom: 25px;
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
}

.ir-bubble-tail-1 {
  position: absolute;
  bottom: -10px;
  right: 20px;
  width: 14px;
  height: 14px;
  background: #1e293b;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(15, 23, 42, 0.1);
}

.ir-bubble-tail-2 {
  position: absolute;
  bottom: -20px;
  right: 28px;
  width: 7px;
  height: 7px;
  background: #0f172a;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(15, 23, 42, 0.1);
}

.ir-thought-bubble-container:hover .ir-thought-bubble {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.ir-preview-record__divider {
  height: 1px;
  background: #e2e8f0;
  margin: 6px 0;
  border-radius: 1px;
}

.ir-preview-record__empty {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 800;
  text-align: center;
  padding: 8px 0;
}

/* ────── Farm Block Footer */
.ir-farm-block__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #f1f5f9;
  background: #fafbfc;
  border-radius: 0 0 26px 26px;
}

.ir-show-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #fff;
  font-size: 13px;
  font-weight: 950;
  border: 0;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.2);
  transition: 0.2s ease;

  svg { width: 15px; height: 15px; stroke: #94a3b8; }

  &__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 22px;
    padding: 0 8px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    font-size: 12px;
    font-weight: 950;
  }

  &__arrow { width: 14px !important; height: 14px !important; stroke: #a5b4fc !important; }

  &:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(15, 23, 42, 0.28); }
}

/* ════════════════════════════════════════════════════
   ANIMATIONS
════════════════════════════════════════════════════ */
@keyframes ir-spin {
  to { transform: rotate(360deg); }
}

/* ════════════════════════════════════════════════════
   RESPONSIVE
════════════════════════════════════════════════════ */
@media (max-width: 1100px) {
  .ir-hero { grid-template-columns: 1fr; }
  .ir-hero__stats { flex-direction: row; }
  .ir-stat { flex: 1; }
}

@media (max-width: 860px) {
  .ir-farms-grid { grid-template-columns: 1fr; }
}

@media (max-width: 680px) {
  .ir-hero { padding: 24px; border-radius: 24px; }
  .ir-hero__content h1 { font-size: 32px; }
  .ir-hero__stats { flex-direction: column; }
  .ir-toolbar { flex-direction: column; align-items: stretch; }
}
</style>
