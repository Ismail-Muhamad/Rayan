<template>
  <div class="user">
    <BaseLoader v-if="usersUiFlags.isFetchingItem || farmsUiFlags.isFetchingList" />

    <div v-else class="user__content">
      <section class="user__hero">
        <div class="user__hero-main">
          <div class="user__avatar">
            {{ getInitials(userRecord?.name) }}
          </div>

          <div class="user__hero-text">
            <p class="user__eyebrow">
              {{ t("users.table.headers.user_info") }}
            </p>

            <h1 class="user__hero-title">
              {{ userRecord?.name || "-" }}
            </h1>

            <div class="user__hero-meta">
              <span class="user__meta-chip">
                {{ t(`users.status.${userRecord?.status}`) }}
              </span>

              <span class="user__meta-chip user__meta-chip--light">
                {{ formatDate(userRecord?.created_at) }}
              </span>
            </div>
          </div>
        </div>

        <div class="user__hero-side">
          <div class="user__stat-card">
            <span class="user__stat-label">
              {{ t("users.table.headers.farms_info") }}
            </span>
            <strong class="user__stat-value">
              {{ farmsInfo.length }}
            </strong>
          </div>
        </div>
      </section>

      <section class="user__section">
        <div class="user__section-head">
          <h2 class="user__section-title">
            {{ t("users.table.headers.user_info") }}
          </h2>
        </div>

        <button class="user__reset-btn" @click="openResetPasswordDialog">
          إعادة تعيين الرقم السري
        </button>

        <div class="user__grid">
          <div v-for="info in userInfo" :key="info.key" class="user__info-card">
            <span class="user__info-label">{{ info.title }}</span>
            <strong class="user__info-value">{{ info.value || "-" }}</strong>
          </div>
        </div>
      </section>

      <section class="user__section">
        <div class="user__section-head">
          <h2 class="user__section-title">
            {{ t("users.table.headers.farms_info") }}
          </h2>
        </div>

        <div v-if="farmsInfo.length" class="user__farms">
          <div v-for="(item, index) in farmsInfo" :key="item.id" class="user__farm-card">
            <div class="user__farm-head" style="cursor: pointer" @click="toggleFarm(item.id)">
              <div>
                <p class="user__farm-label">
                  {{ t("users.table.headers.farm_info", { number: index + 1 }) }}
                </p>
                <h3 class="user__farm-title">
                  {{ item.farmName || "-" }}
                </h3>
              </div>

              <div style="display: flex; align-items: center; gap: 16px;">
                <span class="user__farm-count">
                  {{ item.palm_types.length }}
                  {{ t("farms.table.headers.palm_types") }}
                </span>
                <BaseIcon
                  :name="expandedFarms.has(item.id) ? 'solar:alt-arrow-up-outline' : 'solar:alt-arrow-down-outline'"
                  width="24"
                  height="24"
                  style="color: var(--blue-500);"
                />
              </div>
            </div>

            <div v-show="expandedFarms.has(item.id)">
            <div class="user__grid">
              <div v-for="info in item.farm" :key="info.key" class="user__info-card user__info-card--soft">
                <span class="user__info-label">{{ info.title }}</span>
                <strong class="user__info-value">{{ info.value || "-" }}</strong>
              </div>
            </div>

            <div class="user__palm">
              <h4 class="user__sub-title">
                {{ t("farms.table.headers.palm_types") }}
              </h4>

              <div class="user__palm-grid">
                <article
                  v-for="(palmType, idx) in item.palm_types"
                  :key="`${palmType.palm_type}-${idx}`"
                  class="user__palm-card"
                >
                  <div class="user__palm-card-top">
                    <div>
                      <p class="user__palm-label">
                        {{ t("farms.table.headers.palm_type") }}
                      </p>
                      <h3 class="user__palm-name">{{ palmType.palm_type }}</h3>
                    </div>

                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="user__pill user__pill--emerald">
                        {{ palmType.palm_count }}
                      </span>
                      <button type="button" @click.stop="openEditPalmModal(item, palmType)" style="border:none; background:rgba(59, 130, 246, 0.1); border-radius:8px; width:32px; height:32px; display:grid; place-items:center; cursor:pointer; color: var(--blue-600)">
                        <BaseIcon name="solar:pen-outline" width="18" height="18" />
                      </button>
                      <button type="button" @click.stop="deletePalm(item, palmType)" style="border:none; background:rgba(239, 68, 68, 0.1); border-radius:8px; width:32px; height:32px; display:grid; place-items:center; cursor:pointer; color: var(--red-600)">
                        <BaseIcon name="solar:trash-bin-minimalistic-outline" width="18" height="18" />
                      </button>
                    </div>
                  </div>

                  <div class="user__palm-meta">
                    <span class="user__pill user__pill--slate">
                      {{ t("farms.table.headers.palm_count") }}:
                      {{ palmType.palm_count }}
                    </span>

                    <span class="user__pill user__pill--amber">
                      {{ t("farms.table.headers.palm_age") }}:
                      {{ palmType.palm_age }}
                    </span>
                  </div>
                </article>
              </div>
            </div>
            </div>
          </div>
        </div>

        <div v-else class="user__empty">
          لا توجد مزارع مرتبطة بهذا المستخدم حالياً
        </div>
      </section>

      <div v-if="isResetPasswordDialogOpen" class="user__dialog-backdrop" @click.self="closeResetPasswordDialog">
        <div class="user__dialog">
          <h3 class="user__dialog-title">تغيير الرقم السري</h3>

          <p class="user__dialog-text">
            اكتب الرقم السري الجديد للعميل
          </p>

          <input v-model="newPassword" type="text" class="user__dialog-input" placeholder="اكتب الرقم السري الجديد"
            @keyup.enter="submitResetPassword" />

          <div class="user__dialog-actions">
            <button type="button" class="user__dialog-btn user__dialog-btn--cancel" @click="closeResetPasswordDialog">
              إلغاء
            </button>

            <button type="button" class="user__dialog-btn user__dialog-btn--submit"
              :disabled="isSubmittingResetPassword" @click="submitResetPassword">
              {{ isSubmittingResetPassword ? "جاري الحفظ..." : "حفظ" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Palm Type Modal -->
      <div v-if="isPalmTypeModalOpen" class="user__dialog-backdrop" @click.self="closeEditPalmModal">
        <div class="user__dialog">
          <h3 class="user__dialog-title">تعديل نوع النخيل</h3>
          
          <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 16px;">
            <div>
              <label style="display: block; margin-bottom: 6px; font-weight: 600; font-size: 0.95rem; color: var(--slate-700);">نوع النخيل</label>
              <input v-model="palmForm.name" type="text" class="user__dialog-input" />
            </div>

            <div>
              <label style="display: block; margin-bottom: 6px; font-weight: 600; font-size: 0.95rem; color: var(--slate-700);">العدد</label>
              <input v-model.number="palmForm.number_of_trees" type="number" class="user__dialog-input" />
            </div>

            <div>
              <label style="display: block; margin-bottom: 6px; font-weight: 600; font-size: 0.95rem; color: var(--slate-700);">العمر</label>
              <input v-model.number="palmForm.palm_age" type="number" class="user__dialog-input" />
            </div>
          </div>

          <div class="user__dialog-actions">
            <button type="button" class="user__dialog-btn user__dialog-btn--cancel" @click="closeEditPalmModal">
              إلغاء
            </button>
            <button type="button" class="user__dialog-btn user__dialog-btn--submit"
              :disabled="isSubmittingPalm" @click="submitEditPalm">
              {{ isSubmittingPalm ? "جاري الحفظ..." : "حفظ" }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import UsersServices from "@/services/users.services";
import BaseIcon from "@/components/shared/BaseIcon.vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import { useUsersStore } from "@/stores/users.store";
import { useFarmsStore } from "@/stores/farms.store";

const usersStore = useUsersStore();
const farmsStore = useFarmsStore();

const route = useRoute();
const { t, locale } = useI18n();

const isResetPasswordDialogOpen = ref(false);
const newPassword = ref("");
const isSubmittingResetPassword = ref(false);

const currentRouteId = computed(() => route.params.id);

const { record: userRecord, uiFlags: usersUiFlags } = storeToRefs(usersStore);
const { records: farmsList, uiFlags: farmsUiFlags } = storeToRefs(farmsStore);

const userInfo = computed(() => {
  return [
    {
      key: "name",
      title: t("users.table.headers.user_name"),
      value: userRecord.value?.name,
    },
    {
      key: "whatsapp_number",
      title: t("users.table.headers.whatsapp_number"),
      value: userRecord.value?.whatsapp_number,
    },
    {
      key: "email",
      title: t("users.table.headers.email"),
      value: userRecord.value?.email,
    },
    {
      key: "created_at",
      title: t("users.table.headers.created_at"),
      value: formatDate(userRecord.value?.created_at),
    },
    {
      key: "status_text",
      title: t("users.table.headers.status"),
      value: t(`users.status.${userRecord.value?.status}`),
    },
  ];
});

const farmsInfo = computed(() => {
  return (farmsList.value || []).map((farm) => {
    return {
      id: farm.id,
      farmName: farm.name,
      farm: [
        {
          key: "farm_name",
          title: t("farms.table.headers.farm_name"),
          value: farm.name,
        },
        {
          key: "location",
          title: t("farms.table.headers.location"),
          value: farm.location,
        },
      ],
      palm_types: (farm.palm_types || []).map((palmType) => {
        return {
          id: palmType.id,
          name: palmType.name,
          number_of_trees: palmType.number_of_trees,
          palm_type: palmType.name,
          palm_count: palmType.number_of_trees,
          palm_age: palmType.palm_age,
        };
      }),
    };
  });
});

onMounted(async () => {
  await usersStore.fetchRecord(currentRouteId.value);

  await farmsStore.fetchRecords({
    owner_id: currentRouteId.value,
    per_page: 100,
  });
});

const expandedFarms = ref(new Set());

watch(farmsList, (newFarms) => {
  if (newFarms && newFarms.length > 0) {
    const newSet = new Set();
    newSet.add(newFarms[0].id);
    expandedFarms.value = newSet;
  }
}, { immediate: true });

const toggleFarm = (id) => {
  const newSet = new Set(expandedFarms.value);
  if (newSet.has(id)) {
    newSet.delete(id);
  } else {
    newSet.add(id);
  }
  expandedFarms.value = newSet;
};

const openResetPasswordDialog = () => {
  newPassword.value = "";
  isResetPasswordDialogOpen.value = true;
};

const closeResetPasswordDialog = () => {
  newPassword.value = "";
  isResetPasswordDialogOpen.value = false;
};

const submitResetPassword = async () => {
  const password = newPassword.value?.trim();

  if (!password || password.length < 4) {
    window.alert("من فضلك اكتب رقم سري جديد لا يقل عن 4 حروف أو أرقام");
    return;
  }

  try {
    isSubmittingResetPassword.value = true;

    const response = await UsersServices.resetPassword(currentRouteId.value, {
      password,
      password_confirmation: password,
    });

    console.log("reset password success =>", response);
    window.alert("تم تغيير الرقم السري بنجاح");
    closeResetPasswordDialog();
  } catch (error) {
    console.error("reset password error =>", error);
    console.error("reset password response =>", error?.response);
    console.error("reset password response data =>", error?.response?.data);
    console.error("reset password status =>", error?.response?.status);

    window.alert(
      JSON.stringify(
        {
          status: error?.response?.status,
          data: error?.response?.data,
          message: error?.message,
        },
        null,
        2
      )
    );
  } finally {
    isSubmittingResetPassword.value = false;
  }
};

const isPalmTypeModalOpen = ref(false);
const editingFarmId = ref(null);
const isSubmittingPalm = ref(false);
const palmForm = ref({
  id: null,
  name: "",
  number_of_trees: "",
  palm_age: "",
});

const openEditPalmModal = (farm, palmType) => {
  editingFarmId.value = farm.id;
  palmForm.value = {
    id: palmType.id,
    name: palmType.name || palmType.palm_type,
    number_of_trees: palmType.number_of_trees || palmType.palm_count,
    palm_age: palmType.palm_age,
  };
  isPalmTypeModalOpen.value = true;
};

const closeEditPalmModal = () => {
  isPalmTypeModalOpen.value = false;
};

const submitEditPalm = async () => {
  if (!palmForm.value.name || !palmForm.value.number_of_trees || !palmForm.value.palm_age) {
    window.alert("الرجاء إكمال جميع الحقول");
    return;
  }

  isSubmittingPalm.value = true;
  try {
    const farm = farmsList.value.find(f => f.id === editingFarmId.value);
    if (!farm) return;

    const updatedPalmTypes = (farm.palm_types || []).map(p => {
      if (p.id === palmForm.value.id) {
        return {
          id: p.id,
          name: palmForm.value.name,
          number_of_trees: palmForm.value.number_of_trees,
          palm_age: palmForm.value.palm_age
        };
      }
      return {
        id: p.id,
        name: p.name,
        number_of_trees: p.number_of_trees,
        palm_age: p.palm_age
      };
    });

    const payload = {
      name: farm.name,
      location: farm.location,
      palm_types: updatedPalmTypes
    };

    await farmsStore.updateRecord(farm.id, payload);
    await farmsStore.fetchRecords({ owner_id: currentRouteId.value, per_page: 100 });
    closeEditPalmModal();
  } catch (err) {
    console.error("error updating palm", err);
    window.alert("حدث خطأ أثناء تعديل نوع النخيل");
  } finally {
    isSubmittingPalm.value = false;
  }
};

const deletePalm = async (farmItem, palmType) => {
  if (!window.confirm("هل أنت متأكد من حذف نوع النخيل هذا؟")) return;

  try {
    const farm = farmsList.value.find(f => f.id === farmItem.id);
    if (!farm) return;

    const updatedPalmTypes = (farm.palm_types || [])
      .filter(p => p.id !== palmType.id)
      .map(p => ({
        id: p.id,
        name: p.name,
        number_of_trees: p.number_of_trees,
        palm_age: p.palm_age
      }));

    const payload = {
      name: farm.name,
      location: farm.location,
      palm_types: updatedPalmTypes
    };

    await farmsStore.updateRecord(farm.id, payload);
    await farmsStore.fetchRecords({ owner_id: currentRouteId.value, per_page: 100 });
  } catch (err) {
    console.error("error deleting palm", err);
    window.alert("حدث خطأ أثناء حذف نوع النخيل");
  }
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat(
    locale.value === "ar" ? "ar-EG" : "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(new Date(date));
};

const getInitials = (name) => {
  if (!name) return "?";

  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
};
</script>

<style lang="scss" scoped>
.user {
  min-height: 100%;
  padding: 4px;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 28%),
    linear-gradient(180deg, #f8fbff 0%, #f4f8ff 100%);

  &__content {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  &__hero {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 24px;
    border-radius: 24px;
    border: 1px solid rgba(59, 130, 246, 0.14);
    background: linear-gradient(135deg, var(--blue-700) 0%, var(--blue-500) 100%);
    box-shadow: 0 18px 40px rgba(37, 99, 235, 0.16);

    &::before {
      content: "";
      position: absolute;
      top: -70px;
      right: -70px;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
    }

    &::after {
      content: "";
      position: absolute;
      bottom: -80px;
      left: -50px;
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
    }
  }

  &__hero-main,
  &__hero-side {
    position: relative;
    z-index: 1;
  }

  &__hero-main {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__avatar {
    width: 72px;
    height: 72px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: var(--white);
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.22) 0%,
        rgba(255, 255, 255, 0.1) 100%);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  &__eyebrow {
    margin: 0 0 8px;
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.78);
  }

  &__hero-title {
    margin: 0 0 10px;
    font-size: clamp(2rem, 2.6vw, 3rem);
    line-height: 1.25;
    font-weight: 800;
    color: var(--white);
  }

  &__hero-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__meta-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 36px;
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--white);
    background: rgba(255, 255, 255, 0.14);
    border: 1px solid rgba(255, 255, 255, 0.16);

    &--light {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  &__stat-card {
    min-width: 180px;
    padding: 18px 20px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(10px);
  }

  &__stat-label {
    display: block;
    margin-bottom: 8px;
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
  }

  &__stat-value {
    display: block;
    font-size: 2.3rem;
    font-weight: 800;
    color: var(--white);
  }

  &__section {
    padding: 18px;
    border-radius: 24px;
    border: 1px solid var(--blue-100);
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
  }

  &__section-head {
    margin-bottom: 16px;
  }

  &__section-title {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--blue-800);
  }

  &__reset-btn {
    margin-bottom: 16px;
    min-height: 44px;
    padding: 10px 16px;
    border: none;
    border-radius: 14px;
    font-size: 1rem;
    font-weight: 700;
    color: var(--white);
    background: linear-gradient(135deg, var(--blue-700) 0%, var(--blue-500) 100%);
    cursor: pointer;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }

  &__info-card {
    padding: 18px;
    border-radius: 20px;
    border: 1px solid var(--blue-100);
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);

    &--soft {
      background: #fbfdff;
    }
  }

  &__info-label {
    display: block;
    margin-bottom: 8px;
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--blue-600);
  }

  &__info-value {
    display: block;
    font-size: 1.45rem;
    line-height: 1.7;
    color: var(--slate-900);
    word-break: break-word;
  }

  &__farms {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  &__farm-card {
    padding: 18px;
    border-radius: 22px;
    border: 1px solid #e7f0ff;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  }

  &__farm-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 16px;
  }

  &__farm-label {
    margin: 0 0 6px;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--blue-500);
  }

  &__farm-title {
    margin: 0;
    font-size: 1.7rem;
    font-weight: 800;
    color: var(--slate-900);
  }

  &__farm-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 36px;
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--blue-700);
    background: #eff6ff;
    border: 1px solid var(--blue-100);
    white-space: nowrap;
  }

  &__palm {
    margin-top: 18px;
  }

  &__palm-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  &__palm-card {
    padding: 16px;
    border-radius: 18px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
      border-color: var(--blue-200);
    }
  }

  &__palm-card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  &__palm-label {
    margin: 0 0 4px;
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--slate-500);
  }

  &__palm-name {
    margin: 0;
    font-size: 1.45rem;
    font-weight: 800;
    color: var(--slate-900);
  }

  &__palm-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__pill {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 99px;
    font-size: 1.15rem;
    font-weight: 700;
    
    &--emerald {
      color: #059669;
      background: #d1fae5;
    }

    &--slate {
      color: #475569;
      background: #f1f5f9;
    }

    &--amber {
      color: #d97706;
      background: #fef3c7;
    }
  }

  &__sub-title {
    margin: 0 0 12px;
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--blue-700);
  }

  &__empty {
    padding: 28px 18px;
    border-radius: 18px;
    text-align: center;
    font-size: 1.35rem;
    font-weight: 600;
    color: var(--blue-700);
    background: #f8fbff;
    border: 1px dashed var(--blue-200);
  }

  &__dialog-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(15, 23, 42, 0.45);
  }

  &__dialog {
    width: 100%;
    max-width: 460px;
    padding: 22px;
    border-radius: 20px;
    background: #ffffff;
    box-shadow: 0 20px 50px rgba(15, 23, 42, 0.2);
  }

  &__dialog-title {
    margin: 0 0 10px;
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--slate-900);
  }

  &__dialog-text {
    margin: 0 0 16px;
    font-size: 1rem;
    color: var(--slate-700);
  }

  &__dialog-input {
    width: 100%;
    min-height: 46px;
    padding: 12px 14px;
    border: 1px solid var(--blue-100);
    border-radius: 14px;
    font-size: 1rem;
    outline: none;
  }

  &__dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 18px;
  }

  &__dialog-btn {
    min-height: 42px;
    padding: 10px 16px;
    border: none;
    border-radius: 12px;
    font-size: 0.98rem;
    font-weight: 700;
    cursor: pointer;

    &--cancel {
      color: var(--slate-700);
      background: #e2e8f0;
    }

    &--submit {
      color: var(--white);
      background: linear-gradient(135deg, var(--blue-700) 0%, var(--blue-500) 100%);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
}

:deep(.base-table),
:deep(.table-wrapper),
:deep(table) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(thead tr th) {
  padding-top: 15px !important;
  padding-bottom: 15px !important;
  font-size: 1.15rem !important;
  font-weight: 800 !important;
  color: var(--blue-800) !important;
  background: linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%) !important;
  border-bottom: 1px solid var(--blue-100) !important;
}

:deep(tbody td) {
  padding-top: 15px !important;
  padding-bottom: 15px !important;
  vertical-align: middle !important;
  border-bottom: 1px solid #edf3ff !important;
}

:deep(tbody tr:hover) {
  background: rgba(59, 130, 246, 0.04) !important;
}

:deep(ul) {
  display: block;
  list-style-type: disc;
  margin-block-start: 1em;
  margin-block-end: 1em;
  padding-inline-start: 40px;
  unicode-bidi: isolate;
}

:deep(ol) {
  display: block;
  list-style-type: decimal;
  margin-block-start: 1em;
  margin-block-end: 1em;
  padding-inline-start: 40px;
  unicode-bidi: isolate;
}

@media (max-width: 992px) {
  .user {
    &__hero {
      flex-direction: column;
      align-items: stretch;
    }

    &__hero-main {
      align-items: flex-start;
    }

    &__farm-head {
      flex-direction: column;
      align-items: flex-start;
    }
  }
}

@media (max-width: 576px) {
  .user {

    &__hero,
    &__section {
      padding: 16px;
      border-radius: 20px;
    }

    &__avatar {
      width: 60px;
      height: 60px;
      font-size: 1.6rem;
    }

    &__hero-title {
      font-size: 1.8rem;
    }

    &__section-title {
      font-size: 1.5rem;
    }

    &__farm-title {
      font-size: 1.45rem;
    }
  }
}
</style>