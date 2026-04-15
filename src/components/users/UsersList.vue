<template>
  <div class="users-list">
    <section class="users-list__hero">
      <div class="users-list__hero-content">
        <p class="users-list__eyebrow">
          {{ t("users.title") }}
        </p>

        <h2 class="users-list__hero-title">
          إدارة المستخدمين بشكل احترافي وواضح
        </h2>

        <p class="users-list__hero-text">
          عرض المستخدمين، متابعة حالتهم، والوصول السريع للتفاصيل والإجراءات.
        </p>
      </div>

      <div class="users-list__hero-stats">
        <div class="users-list__stat-card">
          <span class="users-list__stat-label">إجمالي المستخدمين</span>
          <strong class="users-list__stat-value">
            {{ meta?.total || requestsList.length || 0 }}
          </strong>
        </div>
      </div>
    </section>

    <section class="users-list__table-shell">
      <BaseTable
        :headers="TABLE_HEADERS"
        :items="usersList"
        :meta="meta"
        :isLoading="uiFlags.isFetchingList"
        pagination
        @onPageChange="fetchRecords"
        @on-search="handleTableSearch"
      >
        <template #name="{ item }">
          <router-link
            class="users-list__user-link"
            :to="{ name: 'users_show', params: { id: item.id } }"
          >
            <div class="users-list__user">
              <div class="users-list__avatar">
                {{ getInitials(item.name) }}
              </div>

              <div class="users-list__user-info">
                <span class="users-list__name">{{ item.name }}</span>
              </div>
            </div>
          </router-link>
        </template>

        <template #whatsapp_number="{ item }">
          <a
            class="users-list__whatsapp"
            :href="`https://wa.me/20${item.whatsapp_number}`"
            target="_blank"
            rel="noopener"
          >
            {{ item.whatsapp_number }}
          </a>
        </template>

        <template #email="{ item }">
          <span class="users-list__email">
            {{ item.email || "-" }}
          </span>
        </template>

        <template #created_at="{ item }">
          <span class="users-list__date">
            {{ item.created_at }}
          </span>
        </template>

        <template #status_text="{ item }">
          <div :class="['users-list__status-badge', `users-list__status-badge--${item.status}`]">
            <span :class="['users-list__dot', `users-list__dot--${item.status}`]"></span>
            {{ item.status_text }}
          </div>
        </template>

        <template #actions="{ item }">
          <div class="users-list__actions">
            <BaseButton
              dropdown
              variant="soft"
              color="gray"
              size="icon-sm"
              :dropdownItems="getRowActions(item.status)"
              @dropdown-select="(action) => triggerShowModal(item, action.key)"
            >
              <BaseIcon name="pepicons-pop:dots-y" />
            </BaseButton>
          </div>
        </template>
      </BaseTable>
    </section>

<UsersChangeStatusModal
  ref="changeStatusModalRef"
  @success="() => fetchRecords(1)"
/>
  </div>
</template>

<script setup>
// ===== IMPORTS =====
import { computed, onMounted, useTemplateRef } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";

// ===== STORES =====
import { useUsersStore } from "@/stores/users.store";

// ===== COMPONENTS =====
import UsersChangeStatusModal from "./UsersChangeStatusModal.vue";

// ===== HELPERS =====
import { debounceHelper } from "@/helpers/debounceHelper";

// ===== STORE INSTANCES =====
const usersStore = useUsersStore();

// ===== COMPOSABLES =====
const { t, locale } = useI18n();

// ===== CONSTANTS =====
const TABLE_HEADERS = computed(() => [
  {
    text: t("users.table.headers.user_name"),
    value: "name",
    width: 240,
  },
  {
    text: t("users.table.headers.whatsapp_number"),
    value: "whatsapp_number",
    width: 170,
  },
  {
    text: t("users.table.headers.email"),
    value: "email",
    width: 220,
  },
  {
    text: t("users.table.headers.created_at"),
    value: "created_at",
    width: 150,
    alignment: "center",
  },
  {
    text: t("users.table.headers.status"),
    value: "status_text",
    width: 150,
    alignment: "center",
  },
  {
    text: t("users.table.headers.actions"),
    value: "actions",
    alignment: "center",
    width: 100,
  },
]);

// ===== REACTIVE STATE =====
const changeStatusModalRef = useTemplateRef("changeStatusModalRef");
const { records, uiFlags, meta } = storeToRefs(usersStore);

// ===== COMPUTED =====
const usersList = computed(() => {
  return (records.value || []).map((record) => {
    return {
      ...record,
      created_at: formatDate(record.created_at),
      status_text: t(`users.status.${record.status}`),
    };
  });
});

// ===== LIFECYCLE =====
onMounted(() => {
  fetchRecords(1);
});

// ===== METHODS =====
const fetchRecords = (page, search_term = undefined) => {
  usersStore.fetchRecords({
    page,
    name: search_term || undefined,
    role: "farm_owner",
  });
};

const handleTableSearch = debounceHelper(async function (query) {
  fetchRecords(1, query);
}, 500);

const getRowActions = (status) => {
  const actions = [];

  if (["pending", "rejected"].includes(status)) {
    actions.push({ key: "active", label: t("users.actions.active") });
  }

  if (["active"].includes(status)) {
    actions.push({ key: "rejected", label: t("users.actions.rejected") });
  }

  actions.push({
    key: "delete",
    label: t("users.actions.delete"),
    danger: true,
  });

  return actions;
};

const triggerShowModal = (user, action) => {
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
.users-list {
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

  &__table-shell {
    padding: 14px;
    border-radius: 24px;
    border: 1px solid var(--blue-100);
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
    overflow: hidden;
  }

  &__user-link {
    text-decoration: none;
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

  &__name {
    display: block;
    font-size: 1.45rem;
    font-weight: 700;
    color: var(--blue-700);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__whatsapp {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    font-size: 1.32rem;
    font-weight: 700;
    color: var(--blue-600);
    transition: 0.2s ease;

    &:hover {
      color: var(--blue-700);
      text-decoration: underline;
    }
  }

  &__email {
    font-size: 1.28rem;
    color: var(--slate-700);
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

  &__status-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 36px;
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 1.18rem;
    font-weight: 700;
    white-space: nowrap;
    border: 1px solid transparent;

    &--active {
      color: #166534;
      background: #ecfdf3;
      border-color: #bbf7d0;
    }

    &--rejected {
      color: #b42318;
      background: #fff1f3;
      border-color: #fecdd3;
    }

    &--pending {
      color: #b54708;
      background: #fff7ed;
      border-color: #fed7aa;
    }
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;

    &--active {
      background: #22c55e;
      box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.14);
    }

    &--rejected {
      background: #ef4444;
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12);
    }

    &--pending {
      background: #f59e0b;
      box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.12);
    }
  }

  &__actions {
    display: flex;
    justify-content: center;
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

:deep(tbody tr) {
  transition: background-color 0.2s ease;
}

:deep(tbody tr:hover) {
  background: rgba(59, 130, 246, 0.04) !important;
}

:deep(input[type="search"]),
:deep(input) {
  border-radius: 14px !important;
}

@media (max-width: 992px) {
  .users-list {
    &__hero {
      flex-direction: column;
      align-items: stretch;
    }
  }
}

@media (max-width: 576px) {
  .users-list {
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

    &__table-shell {
      padding: 10px;
      border-radius: 20px;
    }

    &__avatar {
      width: 38px;
      height: 38px;
      font-size: 1.05rem;
    }
  }
}
</style>