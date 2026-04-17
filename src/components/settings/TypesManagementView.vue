<template>
  <BasePageWrapper
    titleKey="إدارة الأنواع"
    subtitleKey="إضافة وتعديل أنواع التسميد والمبيدات"
    iconName="solar:settings-outline"
  >
    <div class="types-page">
      <section class="types-page__hero">
        <div class="types-page__hero-copy">
          <span class="types-page__eyebrow">لوحة الإدارة</span>
          <h2 class="types-page__hero-title">إدارة الأنواع</h2>
          <p class="types-page__hero-text">
            أضف وعدّل أنواع التسميد والمبيدات من شاشة واحدة بشكل مرتب وسريع.
          </p>
        </div>

        <div class="types-page__hero-badge">
          <div class="types-page__hero-badge-icon">
            <BaseIcon name="solar:settings-outline" />
          </div>
          <div>
            <p class="types-page__hero-badge-label">إجمالي الأنواع</p>
            <strong class="types-page__hero-badge-value">
              {{ fertilizerTypes.length + pesticideTypes.length }}
            </strong>
          </div>
        </div>
      </section>

      <div
        v-if="feedback.message"
        class="types-page__feedback"
        :class="{
          'types-page__feedback--success': feedback.type === 'success',
          'types-page__feedback--error': feedback.type === 'error',
        }"
      >
        {{ feedback.message }}
      </div>

      <div class="types-page__grid">
        <section class="types-page__panel">
          <div class="types-page__panel-head">
            <div>
              <p class="types-page__panel-kicker">التسميد</p>
              <h3 class="types-page__panel-title">أنواع التسميد</h3>
            </div>

            <div class="types-page__panel-count">
              {{ fertilizerTypes.length }}
            </div>
          </div>

          <div class="types-page__editor">
            <div class="types-page__editor-top">
              <h4 class="types-page__editor-title">إضافة نوع تسميد</h4>
            </div>

            <div class="types-page__input-shell">
              <input
                v-model="fertilizerForm.name"
                class="types-page__input"
                type="text"
                placeholder="اكتب اسم نوع التسميد"
                @keydown.enter.prevent="saveFertilizerType"
              />
            </div>

            <div class="types-page__actions">
              <button
                type="button"
                class="types-page__btn types-page__btn--primary"
                :disabled="fertilizerSaving"
                @click="saveFertilizerType"
              >
                <BaseIcon
                  v-if="!fertilizerSaving"
                  name="solar:add-circle-outline"
                />
                <span>
                  {{ fertilizerSaving ? "جارٍ الحفظ..." : "إضافة النوع" }}
                </span>
              </button>
            </div>
          </div>

          <div class="types-page__list">
            <div
              v-for="item in fertilizerTypes"
              :key="item.id"
              class="types-page__list-item"
            >
              <div class="types-page__item-copy">
                <strong>{{ item.name }}</strong>
                <span>#{{ item.id }}</span>
              </div>

              <button
                type="button"
                class="types-page__btn types-page__btn--soft"
                @click="openFertilizerEditDialog(item)"
              >
                <BaseIcon name="solar:pen-2-outline" />
                <span>تعديل</span>
              </button>
            </div>

            <div v-if="!fertilizerTypes.length" class="types-page__empty">
              لا توجد أنواع تسميد حتى الآن
            </div>
          </div>
        </section>

        <section class="types-page__panel">
          <div class="types-page__panel-head">
            <div>
              <p class="types-page__panel-kicker">المبيدات</p>
              <h3 class="types-page__panel-title">أنواع المبيدات</h3>
            </div>

            <div class="types-page__panel-count">
              {{ pesticideTypes.length }}
            </div>
          </div>

          <div class="types-page__editor">
            <div class="types-page__editor-top">
              <h4 class="types-page__editor-title">إضافة نوع مبيد</h4>
            </div>

            <div class="types-page__input-shell">
              <input
                v-model="pesticideForm.name"
                class="types-page__input"
                type="text"
                placeholder="اكتب اسم نوع المبيد"
                @keydown.enter.prevent="savePesticideType"
              />
            </div>

            <div class="types-page__actions">
              <button
                type="button"
                class="types-page__btn types-page__btn--primary"
                :disabled="pesticideSaving"
                @click="savePesticideType"
              >
                <BaseIcon
                  v-if="!pesticideSaving"
                  name="solar:add-circle-outline"
                />
                <span>
                  {{ pesticideSaving ? "جارٍ الحفظ..." : "إضافة النوع" }}
                </span>
              </button>
            </div>
          </div>

          <div class="types-page__list">
            <div
              v-for="item in pesticideTypes"
              :key="item.id"
              class="types-page__list-item"
            >
              <div class="types-page__item-copy">
                <strong>{{ item.name }}</strong>
                <span>#{{ item.id }}</span>
              </div>

              <button
                type="button"
                class="types-page__btn types-page__btn--soft"
                @click="openPesticideEditDialog(item)"
              >
                <BaseIcon name="solar:pen-2-outline" />
                <span>تعديل</span>
              </button>
            </div>

            <div v-if="!pesticideTypes.length" class="types-page__empty">
              لا توجد أنواع مبيدات حتى الآن
            </div>
          </div>
        </section>
      </div>

      <!-- Fertilizer Edit Dialog -->
      <transition name="types-fade">
        <div
          v-if="fertilizerEditDialog"
          class="types-page__modal-overlay"
          @click.self="closeFertilizerDialog"
        >
          <div class="types-page__modal-card">
            <div class="types-page__modal-head">
              <div>
                <p class="types-page__modal-kicker">تعديل</p>
                <h3 class="types-page__modal-title">تعديل نوع التسميد</h3>
              </div>

              <button
                type="button"
                class="types-page__modal-close"
                @click="closeFertilizerDialog"
              >
                ×
              </button>
            </div>

            <div class="types-page__modal-body">
              <div class="types-page__input-shell">
                <input
                  ref="fertilizerEditInput"
                  v-model="fertilizerEditForm.name"
                  class="types-page__input"
                  type="text"
                  placeholder="اكتب الاسم الجديد"
                  @keydown.enter.prevent="saveFertilizerEdit"
                />
              </div>
            </div>

            <div class="types-page__modal-actions">
              <button
                type="button"
                class="types-page__btn types-page__btn--ghost"
                @click="closeFertilizerDialog"
              >
                إلغاء
              </button>

              <button
                type="button"
                class="types-page__btn types-page__btn--primary"
                :disabled="fertilizerSaving"
                @click="saveFertilizerEdit"
              >
                <span>
                  {{ fertilizerSaving ? "جارٍ الحفظ..." : "حفظ التعديل" }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Pesticide Edit Dialog -->
      <transition name="types-fade">
        <div
          v-if="pesticideEditDialog"
          class="types-page__modal-overlay"
          @click.self="closePesticideDialog"
        >
          <div class="types-page__modal-card">
            <div class="types-page__modal-head">
              <div>
                <p class="types-page__modal-kicker">تعديل</p>
                <h3 class="types-page__modal-title">تعديل نوع المبيد</h3>
              </div>

              <button
                type="button"
                class="types-page__modal-close"
                @click="closePesticideDialog"
              >
                ×
              </button>
            </div>

            <div class="types-page__modal-body">
              <div class="types-page__input-shell">
                <input
                  ref="pesticideEditInput"
                  v-model="pesticideEditForm.name"
                  class="types-page__input"
                  type="text"
                  placeholder="اكتب الاسم الجديد"
                  @keydown.enter.prevent="savePesticideEdit"
                />
              </div>
            </div>

            <div class="types-page__modal-actions">
              <button
                type="button"
                class="types-page__btn types-page__btn--ghost"
                @click="closePesticideDialog"
              >
                إلغاء
              </button>

              <button
                type="button"
                class="types-page__btn types-page__btn--primary"
                :disabled="pesticideSaving"
                @click="savePesticideEdit"
              >
                <span>
                  {{ pesticideSaving ? "جارٍ الحفظ..." : "حفظ التعديل" }}
                </span>
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

const fertilizerForm = ref({
  name: "",
});

const pesticideForm = ref({
  name: "",
});

const fertilizerEditForm = ref({
  id: null,
  name: "",
});

const pesticideEditForm = ref({
  id: null,
  name: "",
});

const setFeedback = (type, message) => {
  feedback.value = { type, message };

  setTimeout(() => {
    if (feedback.value.message === message) {
      feedback.value = { type: "", message: "" };
    }
  }, 3000);
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

const resetFertilizerForm = () => {
  fertilizerForm.value = {
    name: "",
  };
};

const resetPesticideForm = () => {
  pesticideForm.value = {
    name: "",
  };
};

const closeFertilizerDialog = () => {
  fertilizerEditDialog.value = false;
  fertilizerEditForm.value = {
    id: null,
    name: "",
  };
};

const closePesticideDialog = () => {
  pesticideEditDialog.value = false;
  pesticideEditForm.value = {
    id: null,
    name: "",
  };
};

const openFertilizerEditDialog = async (item) => {
  fertilizerEditForm.value = {
    id: item.id,
    name: item.name,
  };
  fertilizerEditDialog.value = true;

  await nextTick();
  fertilizerEditInput.value?.focus?.();
};

const openPesticideEditDialog = async (item) => {
  pesticideEditForm.value = {
    id: item.id,
    name: item.name,
  };
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
    setFeedback("success", "تم إضافة نوع التسميد بنجاح");

    resetFertilizerForm();
    await fetchAll();
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "حصل خطأ أثناء حفظ نوع التسميد";
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
    setFeedback("success", "تم إضافة نوع المبيد بنجاح");

    resetPesticideForm();
    await fetchAll();
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "حصل خطأ أثناء حفظ نوع المبيد";
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
    setFeedback("success", "تم تعديل نوع التسميد بنجاح");

    closeFertilizerDialog();
    await fetchAll();
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "حصل خطأ أثناء تعديل نوع التسميد";
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
    setFeedback("success", "تم تعديل نوع المبيد بنجاح");

    closePesticideDialog();
    await fetchAll();
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "حصل خطأ أثناء تعديل نوع المبيد";
    setFeedback("error", message);
  } finally {
    pesticideSaving.value = false;
  }
};

const handleEscape = (event) => {
  if (event.key !== "Escape") return;

  if (fertilizerEditDialog.value) {
    closeFertilizerDialog();
  }

  if (pesticideEditDialog.value) {
    closePesticideDialog();
  }
};

watch(fertilizerEditDialog, (value) => {
  document.body.style.overflow =
    value || pesticideEditDialog.value ? "hidden" : "";
});

watch(pesticideEditDialog, (value) => {
  document.body.style.overflow =
    value || fertilizerEditDialog.value ? "hidden" : "";
});

onMounted(async () => {
  window.addEventListener("keydown", handleEscape);

  try {
    await fetchAll();
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "حصل خطأ أثناء تحميل الأنواع";
    setFeedback("error", message);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleEscape);
  document.body.style.overflow = "";
});
</script>

<style scoped lang="scss">
.types-page {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 26px;
    border-radius: 28px;
    border: 1px solid rgba(59, 130, 246, 0.14);
    background:
      radial-gradient(circle at top right, rgba(59, 130, 246, 0.14), transparent 28%),
      radial-gradient(circle at bottom left, rgba(34, 197, 94, 0.12), transparent 34%),
      linear-gradient(180deg, #ffffff, #f7fbff);
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.05);
  }

  &__hero-copy {
    max-width: 760px;
  }

  &__eyebrow {
    display: inline-flex;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 700;
    color: #2563eb;
  }

  &__hero-title {
    margin: 0 0 8px;
    font-size: 32px;
    font-weight: 900;
    color: #0f172a;
  }

  &__hero-text {
    margin: 0;
    font-size: 15px;
    line-height: 1.9;
    color: #475569;
  }

  &__hero-badge {
    min-width: 190px;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px;
    border-radius: 22px;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    color: #fff;
    box-shadow: 0 16px 30px rgba(37, 99, 235, 0.18);
  }

  &__hero-badge-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.14);
    font-size: 24px;
    flex-shrink: 0;
  }

  &__hero-badge-label {
    margin: 0 0 4px;
    font-size: 13px;
    opacity: 0.9;
  }

  &__hero-badge-value {
    font-size: 28px;
    font-weight: 900;
  }

  &__feedback {
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;

    &--success {
      background: rgba(34, 197, 94, 0.1);
      color: #166534;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    &--error {
      background: rgba(239, 68, 68, 0.1);
      color: #b91c1c;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  &__panel {
    padding: 22px;
    border-radius: 26px;
    background: #fff;
    border: 1px solid rgba(148, 163, 184, 0.16);
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.04);
  }

  &__panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
  }

  &__panel-kicker {
    margin: 0 0 6px;
    font-size: 13px;
    font-weight: 700;
    color: #2563eb;
  }

  &__panel-title {
    margin: 0;
    font-size: 24px;
    font-weight: 900;
    color: #0f172a;
  }

  &__panel-count {
    min-width: 46px;
    height: 46px;
    padding: 0 12px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(37, 99, 235, 0.08);
    color: #1d4ed8;
    font-size: 18px;
    font-weight: 900;
  }

  &__editor {
    padding: 16px;
    border-radius: 20px;
    background: linear-gradient(180deg, #f8fbff, #ffffff);
    border: 1px solid rgba(219, 227, 239, 0.9);
    margin-bottom: 18px;
  }

  &__editor-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  &__editor-title {
    margin: 0;
    font-size: 16px;
    font-weight: 800;
    color: #0f172a;
  }

  &__input-shell {
    margin-bottom: 14px;
  }

  &__input {
    width: 100%;
    min-height: 54px;
    padding: 0 16px;
    border-radius: 16px;
    border: 1px solid #dbe3ef;
    background: #fff;
    font-size: 15px;
    outline: none;
    color: #0f172a;
    transition: 0.2s ease;
  }

  &__input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
  }

  &__actions {
    display: flex;
    gap: 10px;
  }

  &__btn {
    border: none;
    border-radius: 14px;
    padding: 11px 16px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: 0.2s ease;

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    &--primary {
      width: 100%;
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      color: #fff;
      box-shadow: 0 14px 24px rgba(37, 99, 235, 0.16);
    }

    &--primary:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    &--soft {
      background: #eff6ff;
      color: #1d4ed8;
      padding: 10px 14px;
      width: auto;
      box-shadow: none;
    }

    &--ghost {
      background: #eef2ff;
      color: #1e3a8a;
      width: auto;
      box-shadow: none;
    }
  }

  &__list {
    display: grid;
    gap: 12px;
  }

  &__list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 15px 16px;
    border: 1px solid rgba(226, 232, 240, 0.95);
    border-radius: 18px;
    background: linear-gradient(180deg, #ffffff, #f8fbff);
  }

  &__item-copy {
    display: flex;
    flex-direction: column;
    gap: 4px;

    strong {
      font-size: 15px;
      color: #0f172a;
    }

    span {
      font-size: 12px;
      color: #64748b;
    }
  }

  &__empty {
    padding: 16px;
    border-radius: 16px;
    text-align: center;
    background: #f8fafc;
    border: 1px dashed rgba(148, 163, 184, 0.35);
    color: #64748b;
    font-size: 14px;
    font-weight: 700;
  }

  &__modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(15, 23, 42, 0.42);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  &__modal-card {
    width: 100%;
    max-width: 520px;
    border-radius: 28px;
    background: linear-gradient(180deg, #ffffff, #f8fbff);
    border: 1px solid rgba(219, 227, 239, 0.95);
    box-shadow: 0 30px 70px rgba(15, 23, 42, 0.2);
    overflow: hidden;
    animation: types-modal-pop 0.18s ease;
  }

  &__modal-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 22px 22px 14px;
    border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  }

  &__modal-kicker {
    margin: 0 0 6px;
    font-size: 13px;
    font-weight: 700;
    color: #2563eb;
  }

  &__modal-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #0f172a;
  }

  &__modal-close {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 12px;
    background: #eff6ff;
    color: #1d4ed8;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    flex-shrink: 0;
  }

  &__modal-body {
    padding: 18px 22px 8px;
  }

  &__modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 0 22px 22px;
  }
}

.types-fade-enter-active,
.types-fade-leave-active {
  transition: opacity 0.18s ease;
}

.types-fade-enter-from,
.types-fade-leave-to {
  opacity: 0;
}

@keyframes types-modal-pop {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 960px) {
  .types-page {
    &__hero {
      flex-direction: column;
      align-items: stretch;
    }

    &__grid {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 640px) {
  .types-page {
    &__hero-title {
      font-size: 26px;
    }

    &__panel-title {
      font-size: 20px;
    }

    &__list-item {
      flex-direction: column;
      align-items: flex-start;
    }

    &__btn--soft {
      width: 100%;
    }

    &__modal-card {
      max-width: 100%;
      border-radius: 22px;
    }

    &__modal-actions {
      flex-direction: column;
    }

    &__btn--ghost,
    &__btn--primary {
      width: 100%;
    }
  }
}
</style>