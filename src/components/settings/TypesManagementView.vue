<template>
  <BasePageWrapper
    titleKey="إدارة الأنواع"
    subtitleKey="تحكم كامل وشامل بأنواع التسميد والمبيدات"
    iconName="solar:box-minimalistic-bold-duotone"
  >
    <div class="tm-page">
      <!-- Premium Hero Section -->
      <section class="tm-hero">
        <div class="tm-hero__content">
          <div class="tm-hero__badge">نظام الإدارة المتقدم</div>
          <h1 class="tm-hero__title">إدارة الأنواع المخصصة</h1>
          <p class="tm-hero__desc">
            أضف، عدّل، وتحكم بكافة أنواع التسميد والمبيدات من لوحة تحكم واحدة مصممة خصيصاً لتوفير تجربة مستخدم لا مثيل لها.
          </p>
        </div>
        <div class="tm-hero__stats">
          <div class="tm-stat-card tm-stat-card--primary">
            <div class="tm-stat-card__icon">
              <BaseIcon name="solar:leaf-bold-duotone" />
            </div>
            <div class="tm-stat-card__info">
              <span class="tm-stat-card__label">أنواع التسميد</span>
              <strong class="tm-stat-card__value">{{ fertilizerTypes.length }}</strong>
            </div>
          </div>
          <div class="tm-stat-card tm-stat-card--secondary">
            <div class="tm-stat-card__icon">
              <BaseIcon name="solar:bug-bold-duotone" />
            </div>
            <div class="tm-stat-card__info">
              <span class="tm-stat-card__label">أنواع المبيدات</span>
              <strong class="tm-stat-card__value">{{ pesticideTypes.length }}</strong>
            </div>
          </div>
        </div>
      </section>

      <!-- Feedback Toast -->
      <transition name="tm-slide-down">
        <div v-if="feedback.message" class="tm-feedback" :class="`tm-feedback--${feedback.type}`">
          <BaseIcon :name="feedback.type === 'success' ? 'solar:check-circle-bold' : 'solar:danger-triangle-bold'" />
          <span>{{ feedback.message }}</span>
        </div>
      </transition>

      <div class="tm-grid">
        <!-- Fertilizer Panel -->
        <section class="tm-panel">
          <div class="tm-panel__header">
            <div class="tm-panel__header-icon tm-panel__header-icon--green">
              <BaseIcon name="solar:leaf-outline" />
            </div>
            <h2 class="tm-panel__title">التسميد</h2>
          </div>

          <div class="tm-form-group">
            <div class="tm-input-wrapper">
              <input 
                v-model="fertilizerForm.name" 
                class="tm-input" 
                placeholder=" "
                @keydown.enter.prevent="saveFertilizerType"
              />
              <label class="tm-label">اسم نوع التسميد الجديد</label>
              <div class="tm-input-focus-ring"></div>
            </div>
            <button 
              class="tm-btn tm-btn--primary" 
              :class="{ 'tm-btn--loading': fertilizerSaving }"
              :disabled="fertilizerSaving || !fertilizerForm.name.trim()"
              @click="saveFertilizerType"
            >
              <BaseIcon v-if="!fertilizerSaving" name="solar:add-square-bold" />
              <span class="tm-spinner" v-else></span>
              <span>إضافة</span>
            </button>
          </div>

          <div class="tm-list-container">
            <transition-group name="tm-list" tag="ul" class="tm-list">
              <li v-for="item in fertilizerTypes" :key="item.id" class="tm-list-item">
                <div class="tm-list-item__content">
                  <div class="tm-list-item__avatar">
                    {{ item.name.charAt(0) }}
                  </div>
                  <div class="tm-list-item__info">
                    <span class="tm-list-item__name">{{ item.name }}</span>
                    <span class="tm-list-item__id">ID: #{{ item.id }}</span>
                  </div>
                </div>
                <button class="tm-action-btn" @click="openFertilizerEditDialog(item)">
                  <BaseIcon name="solar:pen-new-round-bold-duotone" />
                </button>
              </li>
            </transition-group>
            
            <div v-if="!fertilizerTypes.length" class="tm-empty-state">
              <BaseIcon name="solar:ghost-smile-bold-duotone" class="tm-empty-icon" />
              <p>لا توجد أنواع تسميد، ابدأ بإضافة نوع جديد.</p>
            </div>
          </div>
        </section>

        <!-- Pesticide Panel -->
        <section class="tm-panel">
          <div class="tm-panel__header">
            <div class="tm-panel__header-icon tm-panel__header-icon--orange">
              <BaseIcon name="solar:bug-outline" />
            </div>
            <h2 class="tm-panel__title">المبيدات</h2>
          </div>

          <div class="tm-form-group">
            <div class="tm-input-wrapper">
              <input 
                v-model="pesticideForm.name" 
                class="tm-input" 
                placeholder=" "
                @keydown.enter.prevent="savePesticideType"
              />
              <label class="tm-label">اسم نوع المبيد الجديد</label>
              <div class="tm-input-focus-ring"></div>
            </div>
            <button 
              class="tm-btn tm-btn--secondary" 
              :class="{ 'tm-btn--loading': pesticideSaving }"
              :disabled="pesticideSaving || !pesticideForm.name.trim()"
              @click="savePesticideType"
            >
              <BaseIcon v-if="!pesticideSaving" name="solar:add-square-bold" />
              <span class="tm-spinner" v-else></span>
              <span>إضافة</span>
            </button>
          </div>

          <div class="tm-list-container">
            <transition-group name="tm-list" tag="ul" class="tm-list">
              <li v-for="item in pesticideTypes" :key="item.id" class="tm-list-item">
                <div class="tm-list-item__content">
                  <div class="tm-list-item__avatar tm-list-item__avatar--orange">
                    {{ item.name.charAt(0) }}
                  </div>
                  <div class="tm-list-item__info">
                    <span class="tm-list-item__name">{{ item.name }}</span>
                    <span class="tm-list-item__id">ID: #{{ item.id }}</span>
                  </div>
                </div>
                <button class="tm-action-btn" @click="openPesticideEditDialog(item)">
                  <BaseIcon name="solar:pen-new-round-bold-duotone" />
                </button>
              </li>
            </transition-group>
            
            <div v-if="!pesticideTypes.length" class="tm-empty-state">
              <BaseIcon name="solar:ghost-smile-bold-duotone" class="tm-empty-icon" />
              <p>لا توجد أنواع مبيدات، ابدأ بإضافة نوع جديد.</p>
            </div>
          </div>
        </section>
      </div>

      <!-- Modals (Bottom Sheet on Mobile, Centered on Desktop) -->
      <!-- Fertilizer Edit -->
      <transition name="tm-modal">
        <div v-if="fertilizerEditDialog" class="tm-modal-backdrop" @click.self="closeFertilizerDialog">
          <div class="tm-modal">
            <div class="tm-modal__drag-handle"></div>
            <div class="tm-modal__header">
              <div class="tm-modal__icon tm-panel__header-icon--green">
                <BaseIcon name="solar:leaf-bold-duotone" />
              </div>
              <h3 class="tm-modal__title">تعديل نوع التسميد</h3>
              <button class="tm-modal__close" @click="closeFertilizerDialog">
                <BaseIcon name="solar:close-circle-bold-duotone" />
              </button>
            </div>
            <div class="tm-modal__body">
              <div class="tm-input-wrapper">
                <input 
                  ref="fertilizerEditInput"
                  v-model="fertilizerEditForm.name" 
                  class="tm-input" 
                  placeholder=" "
                  @keydown.enter.prevent="saveFertilizerEdit"
                />
                <label class="tm-label">الاسم الجديد للتسميد</label>
                <div class="tm-input-focus-ring"></div>
              </div>
            </div>
            <div class="tm-modal__footer">
              <button class="tm-btn tm-btn--ghost" @click="closeFertilizerDialog">إلغاء</button>
              <button 
                class="tm-btn tm-btn--primary" 
                :class="{ 'tm-btn--loading': fertilizerSaving }"
                :disabled="fertilizerSaving || !fertilizerEditForm.name.trim()"
                @click="saveFertilizerEdit"
              >
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Pesticide Edit -->
      <transition name="tm-modal">
        <div v-if="pesticideEditDialog" class="tm-modal-backdrop" @click.self="closePesticideDialog">
          <div class="tm-modal">
            <div class="tm-modal__drag-handle"></div>
            <div class="tm-modal__header">
              <div class="tm-modal__icon tm-panel__header-icon--orange">
                <BaseIcon name="solar:bug-bold-duotone" />
              </div>
              <h3 class="tm-modal__title">تعديل نوع المبيد</h3>
              <button class="tm-modal__close" @click="closePesticideDialog">
                <BaseIcon name="solar:close-circle-bold-duotone" />
              </button>
            </div>
            <div class="tm-modal__body">
              <div class="tm-input-wrapper">
                <input 
                  ref="pesticideEditInput"
                  v-model="pesticideEditForm.name" 
                  class="tm-input" 
                  placeholder=" "
                  @keydown.enter.prevent="savePesticideEdit"
                />
                <label class="tm-label">الاسم الجديد للمبيد</label>
                <div class="tm-input-focus-ring"></div>
              </div>
            </div>
            <div class="tm-modal__footer">
              <button class="tm-btn tm-btn--ghost" @click="closePesticideDialog">إلغاء</button>
              <button 
                class="tm-btn tm-btn--secondary" 
                :class="{ 'tm-btn--loading': pesticideSaving }"
                :disabled="pesticideSaving || !pesticideEditForm.name.trim()"
                @click="savePesticideEdit"
              >
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </BasePageWrapper>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import FertilizerTypesServices from "@/services/fertilizerTypes.services";
import PesticideTypesServices from "@/services/pesticideTypes.services";

const fertilizerTypes = ref([]);
const pesticideTypes = ref([]);

const fertilizerSaving = ref(false);
const pesticideSaving = ref(false);

const fertilizerEditDialog = ref(false);
const pesticideEditDialog = ref(false);

const fertilizerEditInput = ref(null);
const pesticideEditInput = ref(null);

const feedback = ref({
  type: "",
  message: "",
});

const fertilizerForm = ref({ name: "" });
const pesticideForm = ref({ name: "" });

const fertilizerEditForm = ref({ id: null, name: "" });
const pesticideEditForm = ref({ id: null, name: "" });

const setFeedback = (type, message) => {
  feedback.value = { type, message };
  setTimeout(() => {
    if (feedback.value.message === message) {
      feedback.value = { type: "", message: "" };
    }
  }, 4000);
};

const normalizeText = (value) => String(value || "").trim();

const fetchAll = async () => {
  const [fertRes, pestRes] = await Promise.all([
    FertilizerTypesServices.get(),
    PesticideTypesServices.get(),
  ]);
  fertilizerTypes.value = fertRes?.data || [];
  pesticideTypes.value = pestRes?.data || [];
};

const resetFertilizerForm = () => { fertilizerForm.value.name = ""; };
const resetPesticideForm = () => { pesticideForm.value.name = ""; };

const closeFertilizerDialog = () => {
  fertilizerEditDialog.value = false;
  fertilizerEditForm.value = { id: null, name: "" };
};

const closePesticideDialog = () => {
  pesticideEditDialog.value = false;
  pesticideEditForm.value = { id: null, name: "" };
};

const openFertilizerEditDialog = async (item) => {
  fertilizerEditForm.value = { id: item.id, name: item.name };
  fertilizerEditDialog.value = true;
  await nextTick();
  fertilizerEditInput.value?.focus?.();
};

const openPesticideEditDialog = async (item) => {
  pesticideEditForm.value = { id: item.id, name: item.name };
  pesticideEditDialog.value = true;
  await nextTick();
  pesticideEditInput.value?.focus?.();
};

const saveFertilizerType = async () => {
  const name = normalizeText(fertilizerForm.value.name);
  if (!name || fertilizerSaving.value) return;

  fertilizerSaving.value = true;
  feedback.value = { type: "", message: "" };

  try {
    await FertilizerTypesServices.create({ name });
    setFeedback("success", "تم إضافة نوع التسميد بنجاح المتألق!");
    resetFertilizerForm();
    await fetchAll();
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || "حصل خطأ أثناء الحفظ";
    setFeedback("error", message);
  } finally {
    fertilizerSaving.value = false;
  }
};

const savePesticideType = async () => {
  const name = normalizeText(pesticideForm.value.name);
  if (!name || pesticideSaving.value) return;

  pesticideSaving.value = true;
  feedback.value = { type: "", message: "" };

  try {
    await PesticideTypesServices.create({ name });
    setFeedback("success", "تم إضافة نوع المبيد بنجاح!");
    resetPesticideForm();
    await fetchAll();
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || "حصل خطأ أثناء الحفظ";
    setFeedback("error", message);
  } finally {
    pesticideSaving.value = false;
  }
};

const saveFertilizerEdit = async () => {
  const name = normalizeText(fertilizerEditForm.value.name);
  if (!name || fertilizerSaving.value || !fertilizerEditForm.value.id) return;

  fertilizerSaving.value = true;
  feedback.value = { type: "", message: "" };

  try {
    await FertilizerTypesServices.replace(fertilizerEditForm.value.id, { name });
    setFeedback("success", "تم تحديث نوع التسميد بنجاح!");
    closeFertilizerDialog();
    await fetchAll();
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || "حصل خطأ أثناء التحديث";
    setFeedback("error", message);
  } finally {
    fertilizerSaving.value = false;
  }
};

const savePesticideEdit = async () => {
  const name = normalizeText(pesticideEditForm.value.name);
  if (!name || pesticideSaving.value || !pesticideEditForm.value.id) return;

  pesticideSaving.value = true;
  feedback.value = { type: "", message: "" };

  try {
    await PesticideTypesServices.replace(pesticideEditForm.value.id, { name });
    setFeedback("success", "تم تحديث نوع المبيد بنجاح!");
    closePesticideDialog();
    await fetchAll();
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || "حصل خطأ أثناء التحديث";
    setFeedback("error", message);
  } finally {
    pesticideSaving.value = false;
  }
};

const handleEscape = (event) => {
  if (event.key !== "Escape") return;
  if (fertilizerEditDialog.value) closeFertilizerDialog();
  if (pesticideEditDialog.value) closePesticideDialog();
};

watch(fertilizerEditDialog, (value) => {
  document.body.style.overflow = value || pesticideEditDialog.value ? "hidden" : "";
});

watch(pesticideEditDialog, (value) => {
  document.body.style.overflow = value || fertilizerEditDialog.value ? "hidden" : "";
});

onMounted(async () => {
  window.addEventListener("keydown", handleEscape);
  try {
    await fetchAll();
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || "حصل خطأ أثناء تحميل الأنواع";
    setFeedback("error", message);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleEscape);
  document.body.style.overflow = "";
});
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;800&family=Tajawal:wght@400;500;700;800&display=swap');

.tm-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: 'Tajawal', 'Outfit', sans-serif;
  color: #0f172a;
}

/* --- Premium Hero Section --- */
.tm-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 40px;
  border-radius: 32px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #fff;
  overflow: hidden;
  box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.3);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.3), transparent 50%),
                radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.2), transparent 50%);
    pointer-events: none;
  }
}

.tm-hero__content {
  position: relative;
  z-index: 1;
  max-width: 600px;
}

.tm-hero__badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  color: #93c5fd;
}

.tm-hero__title {
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 12px;
  background: linear-gradient(to right, #ffffff, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tm-hero__desc {
  font-size: 16px;
  line-height: 1.7;
  color: #94a3b8;
  margin: 0;
}

.tm-hero__stats {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 240px;
}

.tm-stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease, background 0.3s ease;

  &:hover {
    transform: translateX(-4px);
    background: rgba(255, 255, 255, 0.08);
  }

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  &__info {
    display: flex;
    flex-direction: column;
  }

  &__label {
    font-size: 13px;
    color: #cbd5e1;
    margin-bottom: 4px;
  }

  &__value {
    font-size: 24px;
    font-weight: 800;
    font-family: 'Outfit', sans-serif;
  }

  &--primary .tm-stat-card__icon {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
  }

  &--secondary .tm-stat-card__icon {
    background: rgba(249, 115, 22, 0.15);
    color: #fb923c;
  }
}

/* --- Feedback Toast --- */
.tm-feedback {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 15px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);

  &--success {
    background: #ecfdf5;
    color: #065f46;
    border: 1px solid #a7f3d0;
  }

  &--error {
    background: #fef2f2;
    color: #991b1b;
    border: 1px solid #fecaca;
  }

  svg {
    font-size: 22px;
  }
}

.tm-slide-down-enter-active,
.tm-slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.tm-slide-down-enter-from,
.tm-slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* --- Grid & Panels --- */
.tm-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.tm-panel {
  background: #ffffff;
  border-radius: 32px;
  padding: 32px;
  box-shadow: 0 10px 40px -10px rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tm-panel__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.tm-panel__header-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;

  &--green {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25);
  }

  &--orange {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    color: white;
    box-shadow: 0 8px 20px rgba(249, 115, 22, 0.25);
  }
}

.tm-panel__title {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  color: #0f172a;
}

/* --- Forms & Inputs --- */
.tm-form-group {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.tm-input-wrapper {
  position: relative;
  flex: 1;
}

.tm-input {
  width: 100%;
  height: 56px;
  background: #f8fafc;
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 0 20px;
  font-size: 16px;
  font-weight: 500;
  color: #0f172a;
  outline: none;
  transition: all 0.3s ease;

  &:focus, &:not(:placeholder-shown) {
    background: #ffffff;
    border-color: #cbd5e1;
    padding-top: 16px;
  }

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }
}

.tm-label {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 16px;
  pointer-events: none;
  transition: all 0.3s ease;
}

.tm-input:focus ~ .tm-label,
.tm-input:not(:placeholder-shown) ~ .tm-label {
  top: 14px;
  font-size: 11px;
  font-weight: 700;
  color: #3b82f6;
}

.tm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 56px;
  padding: 0 24px;
  border: none;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    transform: translateY(-2px);
  }

  &--primary {
    background: #0f172a;
    color: #fff;
    box-shadow: 0 10px 20px rgba(15, 23, 42, 0.15);

    &:not(:disabled):hover {
      background: #1e293b;
      box-shadow: 0 14px 25px rgba(15, 23, 42, 0.2);
    }
  }

  &--secondary {
    background: #3b82f6;
    color: #fff;
    box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);

    &:not(:disabled):hover {
      background: #2563eb;
      box-shadow: 0 14px 25px rgba(59, 130, 246, 0.25);
    }
  }

  &--ghost {
    background: #f1f5f9;
    color: #475569;

    &:not(:disabled):hover {
      background: #e2e8f0;
      color: #0f172a;
    }
  }
}

.tm-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: tm-spin 0.8s linear infinite;
}

@keyframes tm-spin {
  to { transform: rotate(360deg); }
}

/* --- List & Items --- */
.tm-list-container {
  flex: 1;
  background: #f8fafc;
  border-radius: 20px;
  padding: 16px;
  overflow-y: auto;
  max-height: 400px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }
}

.tm-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tm-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.02);
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(-4px);
    border-color: #cbd5e1;
    box-shadow: 0 8px 16px rgba(15, 23, 42, 0.06);
  }

  &__content {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__avatar {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #ecfdf5;
    color: #059669;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 800;
    text-transform: uppercase;

    &--orange {
      background: #fff7ed;
      color: #ea580c;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
  }

  &__name {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
  }

  &__id {
    font-size: 12px;
    color: #94a3b8;
    font-family: 'Outfit', sans-serif;
  }
}

.tm-action-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e0e7ff;
    color: #4f46e5;
  }
}

/* List Transitions */
.tm-list-enter-active,
.tm-list-leave-active {
  transition: all 0.4s ease;
}
.tm-list-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.tm-list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.tm-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;

  .tm-empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: 15px;
    font-weight: 500;
  }
}

/* --- Modals (Bottom Sheet & Dialog) --- */
.tm-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.tm-modal {
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border-radius: 32px;
  box-shadow: 0 40px 80px rgba(15, 23, 42, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &__drag-handle {
    display: none; // Only for mobile bottom sheet
  }

  &__header {
    display: flex;
    align-items: center;
    padding: 24px 32px 16px;
    border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  }

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-left: 16px; // RTL
  }

  &__title {
    font-size: 22px;
    font-weight: 800;
    margin: 0;
    flex: 1;
    color: #0f172a;
  }

  &__close {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: none;
    background: #f1f5f9;
    color: #64748b;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
      background: #fee2e2;
      color: #ef4444;
    }
  }

  &__body {
    padding: 32px;
  }

  &__footer {
    padding: 24px 32px;
    background: #f8fafc;
    border-top: 1px solid rgba(226, 232, 240, 0.8);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

.tm-modal-enter-active,
.tm-modal-leave-active {
  transition: opacity 0.3s ease;
  .tm-modal {
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
}

.tm-modal-enter-from,
.tm-modal-leave-to {
  opacity: 0;
  .tm-modal {
    transform: scale(0.95) translateY(20px);
  }
}


/* --- Responsive Design (Mobile First & Premium) --- */
@media (max-width: 1024px) {
  .tm-grid {
    grid-template-columns: 1fr;
  }
  
  .tm-hero {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    
    &__stats {
      flex-direction: row;
      justify-content: center;
    }
  }
}

@media (max-width: 640px) {
  .tm-page {
    gap: 16px;
  }

  .tm-hero {
    padding: 24px;
    border-radius: 24px;

    &__title {
      font-size: 28px;
    }

    &__desc {
      font-size: 15px;
    }

    &__stats {
      flex-direction: column;
    }
  }

  .tm-panel {
    padding: 20px;
    border-radius: 24px;
  }

  .tm-form-group {
    flex-direction: column;
    
    .tm-btn {
      width: 100%;
    }
  }

  .tm-modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .tm-modal {
    max-width: 100%;
    border-radius: 32px 32px 0 0;
    padding-bottom: env(safe-area-inset-bottom);
    
    &__drag-handle {
      display: block;
      width: 48px;
      height: 6px;
      background: #e2e8f0;
      border-radius: 10px;
      margin: 16px auto 0;
    }
    
    &__header {
      padding: 16px 24px;
    }
    
    &__body {
      padding: 24px;
    }
    
    &__footer {
      padding: 24px;
      flex-direction: column;
      
      .tm-btn {
        width: 100%;
      }
      
      .tm-btn--ghost {
        order: 2;
      }
      .tm-btn--primary, .tm-btn--secondary {
        order: 1;
      }
    }
  }
  
  .tm-modal-enter-from,
  .tm-modal-leave-to {
    .tm-modal {
      transform: translateY(100%);
    }
  }
}
</style>