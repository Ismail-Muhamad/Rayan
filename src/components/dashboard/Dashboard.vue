<template>
  <BasePageWrapper
    titleKey="dashboard.title"
    subtitleKey="dashboard.subtitle"
    iconName="solar:clipboard-list-outline"
  >
    <div class="dashboard">
      <section class="dashboard__hero">
        <div class="dashboard__hero-content">
          <p class="dashboard__eyebrow">
            {{ t("dashboard.title") }}
          </p>

          <h2 class="dashboard__hero-title">
            لوحة المتابعة الرئيسية
          </h2>

          <p class="dashboard__hero-text">
            الجدول بالأعلى لرسائل العملاء، وتحت هتلاقي طلبات التسجيل الجديدة
            المعلقة اللي محتاجة مراجعة وتفعيل.
          </p>
        </div>

        <div class="dashboard__hero-stats">
          <div class="dashboard__stat-card">
            <span class="dashboard__stat-label">طلبات معلّقة</span>
            <strong class="dashboard__stat-value">
              {{ pendingUsersList.length }}
            </strong>
          </div>
        </div>
      </section>

      <section class="dashboard__table-shell">
        <div class="dashboard__section-head">
          <h3 class="dashboard__section-title">جدول الرسايل</h3>
          <span class="dashboard__section-count">
            {{ requestsList.length }}
          </span>
        </div>

        <BaseTable
          :headers="REQUESTS_TABLE_HEADERS"
          :items="requestsList"
          :meta="requestsMeta"
          :isLoading="requestsUiFlags.isFetchingList"
          pagination
          @onPageChange="handleRequestsPageChange"
          @on-search="handleRequestsSearch"
          :search-placeholder="t('GLOBAL.TABLE.SEARCH')"
        >
          <template #user_name="{ item }">
            <div class="dashboard__user">
              <div class="dashboard__avatar">
                {{ getInitials(item.user_name) }}
              </div>

              <div class="dashboard__user-info">
                <strong class="dashboard__user-name">
                  {{ item.user_name }}
                </strong>
              </div>
            </div>
          </template>

          <template #whatsapp_number="{ item }">
            <a
              class="dashboard__link"
              :href="`https://wa.me/20${item.whatsapp_number}`"
              target="_blank"
              rel="noopener"
            >
              {{ item.whatsapp_number || "-" }}
            </a>
          </template>

          <template #phone_number="{ item }">
            <span class="dashboard__email">
              {{ item.phone_number || "-" }}
            </span>
          </template>

          <template #service="{ item }">
            <span class="dashboard__badge">
              {{ item.service }}
            </span>
          </template>

          <template #created_at="{ item }">
            <span class="dashboard__date">
              {{ item.created_at }}
            </span>
          </template>

          <template #message="{ item }">
            <span class="dashboard__email">
              {{ item.message || "-" }}
            </span>
          </template>
        </BaseTable>
      </section>

      <section class="dashboard__cards-shell">
        <div class="dashboard__section-head">
          <h3 class="dashboard__section-title">كروت العملاء المنتظرين التفعيل</h3>
          <span class="dashboard__section-count">
            {{ pendingUsersList.length }}
          </span>
        </div>

        <div v-if="pendingUsersList.length" class="dashboard__cards">
          <article
            v-for="item in pendingUsersList"
            :key="item.id"
            class="dashboard__request-card"
          >
            <div class="dashboard__request-top">
              <div class="dashboard__user">
                <div class="dashboard__avatar">
                  {{ getInitials(item.name) }}
                </div>

                <div class="dashboard__user-info">
                  <strong class="dashboard__user-name">
                    {{ item.name }}
                  </strong>

                  <span class="dashboard__card-date">
                    {{ item.created_at }}
                  </span>
                </div>
              </div>

              <span class="dashboard__status-badge">
                في انتظار التفعيل
              </span>
            </div>

            <div class="dashboard__request-grid">
              <div class="dashboard__info-box">
                <span class="dashboard__info-label">البريد الإلكتروني</span>
                <span class="dashboard__email">{{ item.email || "-" }}</span>
              </div>

              <div class="dashboard__info-box">
                <span class="dashboard__info-label">واتساب</span>
                <a
                  class="dashboard__link"
                  :href="`https://wa.me/20${item.whatsapp_number}`"
                  target="_blank"
                  rel="noopener"
                >
                  {{ item.whatsapp_number || "-" }}
                </a>
              </div>
            </div>

            <div class="dashboard__farms-box">
              <div class="dashboard__info-head">
                <span class="dashboard__info-label">المزارع المسجلة</span>
                <span class="dashboard__mini-badge">
                  {{ item.farms.length }}
                </span>
              </div>

              <div v-if="item.farms.length" class="dashboard__farms-list">
                <div
                  v-for="farm in item.farms"
                  :key="farm.id"
                  class="dashboard__farm-card"
                >
                  <div class="dashboard__farm-head">
                    <div>
                      <strong class="dashboard__farm-title">
                        {{ farm.name || "-" }}
                      </strong>
                      <p class="dashboard__farm-location">
                        {{ farm.location || "-" }}
                      </p>
                    </div>

                    <span class="dashboard__mini-badge">
                      {{ farm.palm_types?.length || 0 }} نوع
                    </span>
                  </div>

                  <div
                    v-if="farm.palm_types && farm.palm_types.length"
                    class="dashboard__palm-types"
                  >
                    <div
                      v-for="(palm, index) in farm.palm_types"
                      :key="`${farm.id}-${index}`"
                      class="dashboard__palm-card"
                    >
                      <span class="dashboard__palm-name">
                        {{ palm.name || "-" }}
                      </span>

                      <div class="dashboard__palm-meta">
                        <span>الأشجار: {{ palm.number_of_trees || 0 }}</span>
                        <span>العمر: {{ palm.palm_age || "-" }}</span>
                      </div>
                    </div>
                  </div>

                  <div v-else class="dashboard__empty-inline">
                    لا توجد أنواع نخيل
                  </div>
                </div>
              </div>

              <div v-else class="dashboard__empty-inline">
                لا توجد مزارع مرتبطة بهذا العميل حالياً
              </div>
            </div>

            <div class="dashboard__card-actions">
              <BaseButton
                size="sm"
                color="green"
                @click="openStatusModal(item, 'active')"
              >
                قبول الحساب
              </BaseButton>

              <BaseButton
                size="sm"
                color="red"
                variant="outline"
                @click="openStatusModal(item, 'rejected')"
              >
                رفض الحساب
              </BaseButton>
            </div>
          </article>
        </div>

        <div v-else class="dashboard__empty">
          لا توجد طلبات تسجيل معلقة حالياً
        </div>
      </section>

      <UsersChangeStatusModal
        ref="changeStatusModalRef"
        @success="refetchDashboardData"
      />
    </div>
  </BasePageWrapper>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import FarmsServices from "@/services/farms.services";
import { useUsersStore } from "@/stores/users.store";
import { useRequestsStore } from "@/stores/requests.store";
import { debounceHelper } from "@/helpers/debounceHelper";
import UsersChangeStatusModal from "@/components/users/UsersChangeStatusModal.vue";

const usersStore = useUsersStore();
const requestsStore = useRequestsStore();

const { t, locale } = useI18n();

const changeStatusModalRef = ref(null);
const pendingUsersFarmsMap = ref({});
const isFetchingPendingUsersFarms = ref(false);

const REQUESTS_TABLE_HEADERS = computed(() => [
  {
    text: t("dashboard.TABLE.USER_NAME"),
    value: "user_name",
    width: 220,
  },
  {
    text: t("dashboard.TABLE.WHATSAPP_NUMBER"),
    value: "whatsapp_number",
    width: 170,
  },
  {
    text: t("dashboard.TABLE.PHONE_NUMBER"),
    value: "phone_number",
    width: 170,
  },
  {
    text: t("dashboard.TABLE.SERVICE"),
    value: "service",
    width: 180,
    alignment: "center",
  },
  {
    text: t("dashboard.TABLE.CREATED_AT"),
    value: "created_at",
    width: 150,
    alignment: "center",
  },
  {
    text: t("dashboard.TABLE.MESSAGE"),
    value: "message",
    alignment: "center",
  },
]);

const {
  records: requestsRecords,
  uiFlags: requestsUiFlags,
  meta: requestsMeta,
} = storeToRefs(requestsStore);

const { records: usersRecords, uiFlags: usersUiFlags, meta: usersMeta } =
  storeToRefs(usersStore);

const requestsList = computed(() => {
  return (requestsRecords.value || []).map((record) => {
    return {
      ...record,
      created_at: formatDate(record.created_at),
      service: t(`dashboard.SERVICES.${record.service}`),
    };
  });
});

const pendingUsersList = computed(() => {
  const users = usersRecords.value || [];

  return users
    .filter((user) => user.role === "farm_owner" && user.status === "pending")
    .map((user) => {
      const userFarms = pendingUsersFarmsMap.value[user.id] || [];

      return {
        ...user,
        created_at: formatDate(user.created_at),
        farms: userFarms,
        farms_count: userFarms.length,
      };
    });
});

onMounted(async () => {
  await refetchDashboardData();
});

const fetchRequests = async (page = 1, keyword = undefined) => {
  await requestsStore.fetchRecords({
    page,
    name: keyword || undefined,
  });
};

const fetchPendingUsers = async (page = 1, keyword = undefined) => {
  await usersStore.fetchRecords({
    page,
    name: keyword || undefined,
    role: "farm_owner",
    status: "pending",
  });
};

const fetchFarmsForPendingUsers = async () => {
  const users = usersRecords.value || [];

  if (!users.length) {
    pendingUsersFarmsMap.value = {};
    return;
  }

  isFetchingPendingUsersFarms.value = true;

  try {
    const results = await Promise.all(
      users.map(async (user) => {
        try {
          const response = await FarmsServices.get({
            owner_id: user.id,
            per_page: 100,
          });

          return {
            userId: user.id,
            farms: response?.data?.data || response?.data || [],
          };
        } catch (error) {
          return {
            userId: user.id,
            farms: [],
          };
        }
      }),
    );

    pendingUsersFarmsMap.value = results.reduce((acc, item) => {
      acc[item.userId] = item.farms;
      return acc;
    }, {});
  } finally {
    isFetchingPendingUsersFarms.value = false;
  }
};

const refetchDashboardData = async () => {
  await fetchRequests(1);
  await fetchPendingUsers(1);
  await fetchFarmsForPendingUsers();
};

const handleRequestsPageChange = async (page) => {
  await fetchRequests(page);
};

const handleRequestsSearch = debounceHelper(async function (query) {
  await fetchRequests(1, query);
}, 500);

const openStatusModal = (user, action) => {
  changeStatusModalRef.value.openModal(user, action);
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
.dashboard {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 4px;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent 26%),
    linear-gradient(180deg, #f8fbff 0%, #f4f8ff 100%);

  &__hero {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 24px;
    border: 1px solid rgba(59, 130, 246, 0.14);
    border-radius: 24px;
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

  &__hero-content,
  &__hero-stats {
    position: relative;
    z-index: 1;
  }

  &__hero-content {
    max-width: 720px;
  }

  &__eyebrow {
    margin: 0 0 8px;
    font-size: 1.2rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.78);
  }

  &__hero-title {
    margin: 0 0 10px;
    font-size: clamp(2.1rem, 2.6vw, 3rem);
    font-weight: 800;
    line-height: 1.3;
    color: var(--white);
  }

  &__hero-text {
    margin: 0;
    font-size: 1.38rem;
    line-height: 1.9;
    color: rgba(255, 255, 255, 0.88);
  }

  &__stat-card {
    min-width: 170px;
    padding: 18px 20px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(10px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
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

  &__table-shell,
  &__cards-shell {
    padding: 14px;
    border-radius: 24px;
    border: 1px solid var(--blue-100);
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
    overflow: hidden;
  }

  &__section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  &__section-title {
    margin: 0;
    font-size: 1.45rem;
    font-weight: 800;
    color: var(--blue-800);
  }

  &__section-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    padding: 0 12px;
    border-radius: 999px;
    background: #eff6ff;
    border: 1px solid var(--blue-100);
    color: var(--blue-700);
    font-size: 1.1rem;
    font-weight: 800;
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
    gap: 16px;
  }

  &__request-card {
    padding: 18px;
    border-radius: 22px;
    border: 1px solid #e7f0ff;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__request-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__avatar {
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 50%;
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--white);
    background: linear-gradient(135deg, var(--blue-600) 0%, var(--blue-400) 100%);
    box-shadow: 0 10px 18px rgba(37, 99, 235, 0.18);
  }

  &__user-info {
    min-width: 0;
  }

  &__user-name {
    display: block;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--slate-900);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__card-date {
    display: inline-block;
    margin-top: 4px;
    font-size: 1.08rem;
    font-weight: 600;
    color: var(--slate-500);
  }

  &__link {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--blue-600);
    transition: 0.2s ease;

    &:hover {
      color: var(--blue-700);
      text-decoration: underline;
    }
  }

  &__email {
    font-size: 1.22rem;
    color: var(--slate-700);
    word-break: break-word;
  }

  &__badge,
  &__status-badge,
  &__mini-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 36px;
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 1.1rem;
    font-weight: 700;
    white-space: nowrap;
  }

  &__badge,
  &__mini-badge {
    color: var(--blue-700);
    background: var(--blue-50);
    border: 1px solid var(--blue-100);
  }

  &__status-badge {
    color: #b54708;
    background: #fff7ed;
    border: 1px solid #fed7aa;
  }

  &__date {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 7px 12px;
    border-radius: 12px;
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--blue-700);
    background: #f3f8ff;
    border: 1px solid var(--blue-100);
  }

  &__actions,
  &__card-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__request-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  &__info-box,
  &__farms-box {
    padding: 14px;
    border-radius: 16px;
    border: 1px solid var(--blue-100);
    background: #ffffff;
  }

  &__info-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }

  &__info-label {
    display: block;
    font-size: 1.08rem;
    font-weight: 700;
    color: var(--blue-600);
  }

  &__farms-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__farm-card {
    padding: 14px;
    border-radius: 16px;
    border: 1px solid #e7f0ff;
    background: #fafdff;
  }

  &__farm-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  &__farm-title {
    display: block;
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--slate-900);
  }

  &__farm-location {
    margin: 4px 0 0;
    font-size: 1.05rem;
    color: var(--slate-600);
  }

  &__palm-types {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__palm-card {
    padding: 12px;
    border-radius: 14px;
    border: 1px solid var(--blue-100);
    background: #fff;
  }

  &__palm-name {
    display: block;
    margin-bottom: 6px;
    font-size: 1.08rem;
    font-weight: 800;
    color: var(--blue-700);
  }

  &__palm-meta {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    font-size: 1rem;
    color: var(--slate-600);
  }

  &__empty,
  &__empty-inline {
    padding: 20px 14px;
    border-radius: 18px;
    text-align: center;
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--blue-700);
    background: #f8fbff;
    border: 1px dashed var(--blue-200);
  }

  &__empty-inline {
    padding: 12px;
    font-size: 1rem;
  }
}

:deep(.base-table),
:deep(.table-wrapper),
:deep(table) {
  border-radius: 18px;
  overflow: hidden;
}

:deep(thead tr th) {
  padding-top: 16px !important;
  padding-bottom: 16px !important;
  font-size: 1.22rem !important;
  font-weight: 800 !important;
  color: var(--blue-800) !important;
  background: linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%) !important;
  border-bottom: 1px solid var(--blue-100) !important;
}

:deep(tbody td) {
  padding-top: 16px !important;
  padding-bottom: 16px !important;
  vertical-align: middle !important;
  border-bottom: 1px solid #edf3ff !important;
}

:deep(tbody tr:hover) {
  background: rgba(59, 130, 246, 0.04) !important;
}

:deep(input[type="search"]),
:deep(input) {
  border-radius: 14px !important;
}

@media (max-width: 992px) {
  .dashboard {
    &__hero {
      flex-direction: column;
      align-items: stretch;
    }

    &__request-top,
    &__farm-head {
      flex-direction: column;
      align-items: stretch;
    }

    &__request-grid {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 576px) {
  .dashboard {
    &__hero {
      padding: 18px;
      border-radius: 20px;
    }

    &__hero-title {
      font-size: 1.9rem;
    }

    &__hero-text {
      font-size: 1.2rem;
    }

    &__table-shell,
    &__cards-shell {
      padding: 10px;
      border-radius: 20px;
    }

    &__avatar {
      width: 38px;
      height: 38px;
      font-size: 1.05rem;
    }

    &__cards {
      grid-template-columns: 1fr;
    }
  }
}
</style>