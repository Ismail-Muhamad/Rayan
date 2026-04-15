<template>
  <div class="reports-list">
    <section class="reports-list__hero">
      <div class="reports-list__hero-content">
        <p class="reports-list__eyebrow">
          {{ t("reports.title") }}
        </p>

        <h2 class="reports-list__hero-title">
          إدارة التقارير بشكل مرتب وواضح
        </h2>

        <p class="reports-list__hero-text">
          عرض المزارع المرتبطة بالتقارير والوصول السريع للتعديل أو الحذف أو فتح
          التقرير.
        </p>
      </div>

      <div class="reports-list__hero-stats">
        <div class="reports-list__stat-card">
          <span class="reports-list__stat-label">إجمالي التقارير</span>
          <strong class="reports-list__stat-value">
            {{ farmsMeta?.total || farmsList.length || 0 }}
          </strong>
        </div>
      </div>
    </section>

    <section class="reports-list__table-shell">
      <BaseTable
        :headers="TABLE_HEADERS"
        :items="farmsList"
        :meta="farmsMeta"
        :isLoading="farmsUiFlags.isFetchingList"
        pagination
        @onPageChange="fetchRecords"
        @on-search="handleTableSearch"
        hideSearch
      >
        <template #buttons>
          <BaseButton @click="router.push({ name: 'create_report' })">
            {{ t("reports.actions.create") }}
          </BaseButton>
        </template>

        <template #farm_name="{ item }">
          <router-link
            class="reports-list__farm-link"
            :to="{ name: 'show_report', params: { id: item.id } }"
          >
            <div class="reports-list__farm">
              <div class="reports-list__avatar">
                {{ getInitials(item.farm_name) }}
              </div>

              <div class="reports-list__farm-info">
                <span class="reports-list__name">
                  {{ item.farm_name }}
                </span>
              </div>
            </div>
          </router-link>
        </template>

        <template #location="{ item }">
          <span class="reports-list__location">
            {{ item.location || "-" }}
          </span>
        </template>

        <template #owner_name="{ item }">
          <span class="reports-list__owner">
            {{ item.owner_name || "-" }}
          </span>
        </template>

        <template #actions="{ item }">
          <div class="reports-list__actions">
            <BaseButton
              dropdown
              variant="soft"
              color="gray"
              size="icon-sm"
              :dropdownItems="ROW_ACTIONS"
              @dropdown-select="(action) => triggerRowAction(action.key, item)"
            >
              <BaseIcon name="pepicons-pop:dots-y" />
            </BaseButton>
          </div>
        </template>
      </BaseTable>
    </section>

    <ReportsDeleteModal ref="deleteReportModalRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { useFarmsStore } from "@/stores/farms.store";
import ReportsDeleteModal from "./Modals/ReportsDeleteModal.vue";
import { debounceHelper } from "@/helpers/debounceHelper";

const farmsStore = useFarmsStore();

const router = useRouter();
const { t } = useI18n();

const TABLE_HEADERS = computed(() => [
  {
    text: t("reports.table.headers.farm_name"),
    value: "farm_name",
    width: 240,
  },
  {
    text: t("reports.table.headers.location"),
    value: "location",
    width: 220,
  },
  {
    text: t("reports.table.headers.owner_name"),
    value: "owner_name",
    width: 180,
  },
  {
    text: t("users.table.headers.actions"),
    value: "actions",
    alignment: "center",
    width: 100,
  },
]);

const ROW_ACTIONS = computed(() => [
  {
    key: "edit",
    label: t("reports.actions.edit"),
  },
  {
    key: "delete",
    label: t("reports.actions.delete"),
    danger: true,
  },
]);

const deleteReportModalRef = ref(null);

const {
  records: farmsRecords,
  uiFlags: farmsUiFlags,
  meta: farmsMeta,
} = storeToRefs(farmsStore);

const farmsList = computed(() => {
  return (farmsRecords.value || []).map((record) => {
    return {
      ...record,
      farm_name: record?.name,
      location: record?.location,
      owner_name: record?.owner?.name,
    };
  });
});

onMounted(() => {
  fetchRecords(1);
});

const fetchRecords = (page, search_term = undefined) => {
  farmsStore.fetchRecords({
    page,
    name: search_term || undefined,
  });
};

const handleTableSearch = debounceHelper(async function (query) {
  fetchRecords(1, query);
}, 500);

const triggerRowAction = (action, item) => {
  const actionsMap = {
    delete: () => deleteReportModalRef.value.openModal(item),
    edit: () => router.push({ name: "edit_report", params: { id: item.id } }),
  };

  actionsMap[action]?.();
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
.reports-list {
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

  &__farm-link {
    text-decoration: none;
  }

  &__farm {
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

  &__farm-info {
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

  &__location,
  &__owner {
    font-size: 1.3rem;
    color: var(--slate-700);
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
  .reports-list {
    &__hero {
      flex-direction: column;
      align-items: stretch;
    }
  }
}

@media (max-width: 576px) {
  .reports-list {
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