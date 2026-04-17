<template>
  <BasePageWrapper
    titleKey="إدارة الأنواع"
    subtitleKey="إضافة وتعديل أنواع التسميد والمبيدات"
    iconName="solar:settings-outline"
  >
    <div class="types-page">
      <section class="types-page__hero">
        <div>
          <span class="types-page__eyebrow">لوحة الإدارة</span>
          <h2 class="types-page__hero-title">إدارة الأنواع</h2>
          <p class="types-page__hero-text">
            من هنا تقدر تضيف وتعدل أنواع التسميد وأنواع المبيدات من غير حذف.
          </p>
        </div>
      </section>

      <div class="types-page__grid">
        <section class="types-page__card">
          <div class="types-page__head">
            <h3 class="types-page__title">أنواع التسميد</h3>
          </div>

          <form class="types-page__form" @submit.prevent="saveFertilizerType">
            <div class="types-page__form-grid">
              <input
                v-model="fertilizerForm.name"
                class="types-page__input"
                type="text"
                placeholder="اسم نوع التسميد"
              />

              <label class="types-page__checkbox">
                <input v-model="fertilizerForm.is_active" type="checkbox" />
                <span>نشط</span>
              </label>
            </div>

            <div class="types-page__actions">
              <button type="submit" class="types-page__btn types-page__btn--primary">
                {{ fertilizerForm.id ? "حفظ التعديل" : "إضافة نوع" }}
              </button>

              <button
                v-if="fertilizerForm.id"
                type="button"
                class="types-page__btn types-page__btn--ghost"
                @click="resetFertilizerForm"
              >
                إلغاء
              </button>
            </div>
          </form>

          <div class="types-page__list">
            <div
              v-for="item in fertilizerTypes"
              :key="item.id"
              class="types-page__list-item"
            >
              <div class="types-page__list-copy">
                <strong>{{ item.name }}</strong>
                <span>{{ item.is_active ? "نشط" : "غير نشط" }}</span>
              </div>

              <button
                class="types-page__btn types-page__btn--small"
                @click="editFertilizerType(item)"
              >
                تعديل
              </button>
            </div>
          </div>
        </section>

        <section class="types-page__card">
          <div class="types-page__head">
            <h3 class="types-page__title">أنواع المبيدات</h3>
          </div>

          <form class="types-page__form" @submit.prevent="savePesticideType">
            <div class="types-page__form-grid">
              <input
                v-model="pesticideForm.name"
                class="types-page__input"
                type="text"
                placeholder="اسم نوع المبيد"
              />

              <label class="types-page__checkbox">
                <input v-model="pesticideForm.is_active" type="checkbox" />
                <span>نشط</span>
              </label>
            </div>

            <div class="types-page__actions">
              <button type="submit" class="types-page__btn types-page__btn--primary">
                {{ pesticideForm.id ? "حفظ التعديل" : "إضافة نوع" }}
              </button>

              <button
                v-if="pesticideForm.id"
                type="button"
                class="types-page__btn types-page__btn--ghost"
                @click="resetPesticideForm"
              >
                إلغاء
              </button>
            </div>
          </form>

          <div class="types-page__list">
            <div
              v-for="item in pesticideTypes"
              :key="item.id"
              class="types-page__list-item"
            >
              <div class="types-page__list-copy">
                <strong>{{ item.name }}</strong>
                <span>{{ item.is_active ? "نشط" : "غير نشط" }}</span>
              </div>

              <button
                class="types-page__btn types-page__btn--small"
                @click="editPesticideType(item)"
              >
                تعديل
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </BasePageWrapper>
</template>

<script setup>
import { onMounted, ref } from "vue";
import FertilizerTypesServices from "@/services/fertilizerTypes.services";
import PesticideTypesServices from "@/services/pesticideTypes.services";

const fertilizerTypes = ref([]);
const pesticideTypes = ref([]);

const fertilizerForm = ref({
  id: null,
  name: "",
  is_active: true,
});

const pesticideForm = ref({
  id: null,
  name: "",
  is_active: true,
});

const fetchAll = async () => {
  const [fertRes, pestRes] = await Promise.all([
    FertilizerTypesServices.getAll(),
    PesticideTypesServices.getAll(),
  ]);

  fertilizerTypes.value = fertRes?.data || [];
  pesticideTypes.value = pestRes?.data || [];
};

const resetFertilizerForm = () => {
  fertilizerForm.value = {
    id: null,
    name: "",
    is_active: true,
  };
};

const resetPesticideForm = () => {
  pesticideForm.value = {
    id: null,
    name: "",
    is_active: true,
  };
};

const editFertilizerType = (item) => {
  fertilizerForm.value = {
    id: item.id,
    name: item.name,
    is_active: !!item.is_active,
  };
};

const editPesticideType = (item) => {
  pesticideForm.value = {
    id: item.id,
    name: item.name,
    is_active: !!item.is_active,
  };
};

const saveFertilizerType = async () => {
  if (!fertilizerForm.value.name.trim()) return;

  const payload = {
    name: fertilizerForm.value.name.trim(),
    is_active: fertilizerForm.value.is_active,
  };

  if (fertilizerForm.value.id) {
    await FertilizerTypesServices.updateType(fertilizerForm.value.id, payload);
  } else {
    await FertilizerTypesServices.createType(payload);
  }

  resetFertilizerForm();
  await fetchAll();
};

const savePesticideType = async () => {
  if (!pesticideForm.value.name.trim()) return;

  const payload = {
    name: pesticideForm.value.name.trim(),
    is_active: pesticideForm.value.is_active,
  };

  if (pesticideForm.value.id) {
    await PesticideTypesServices.updateType(pesticideForm.value.id, payload);
  } else {
    await PesticideTypesServices.createType(payload);
  }

  resetPesticideForm();
  await fetchAll();
};

onMounted(async () => {
  await fetchAll();
});
</script>

<style scoped lang="scss">
.types-page {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__hero {
    padding: 24px;
    border-radius: 24px;
    background: linear-gradient(180deg, #ffffff, #f7fbff);
    border: 1px solid rgba(148, 163, 184, 0.16);
  }

  &__eyebrow {
    display: inline-flex;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 700;
    color: #2563eb;
  }

  &__hero-title {
    margin: 0 0 10px;
    font-size: 28px;
    font-weight: 800;
    color: #0f172a;
  }

  &__hero-text {
    margin: 0;
    font-size: 15px;
    line-height: 1.9;
    color: #475569;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  &__card {
    padding: 22px;
    border-radius: 24px;
    background: #fff;
    border: 1px solid rgba(148, 163, 184, 0.16);
  }

  &__head {
    margin-bottom: 16px;
  }

  &__title {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 18px;
  }

  &__form-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    align-items: center;
  }

  &__input {
    width: 100%;
    min-height: 48px;
    padding: 0 14px;
    border-radius: 14px;
    border: 1px solid #dbe3ef;
    background: #fff;
    font-size: 15px;
    outline: none;
    color: #0f172a;
  }

  &__input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }

  &__checkbox {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
  }

  &__actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__btn {
    border: none;
    border-radius: 12px;
    padding: 10px 16px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;

    &--primary {
      background: #2563eb;
      color: #fff;
    }

    &--ghost {
      background: #eef2ff;
      color: #1e3a8a;
    }

    &--small {
      background: #eff6ff;
      color: #1d4ed8;
      padding: 8px 12px;
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
    padding: 14px 16px;
    border: 1px solid rgba(226, 232, 240, 0.95);
    border-radius: 16px;
    background: #f8fbff;
  }

  &__list-copy {
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
}

@media (max-width: 900px) {
  .types-page {
    &__grid {
      grid-template-columns: 1fr;
    }

    &__form-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>