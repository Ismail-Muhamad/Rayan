<template>
  <div class="users-list">
    <BaseTable
      :headers="TABLE_HEADERS"
      :items="requestsList"
      :meta="meta"
      :isLoading="uiFlags.isFetchingList"
      pagination
      @onPageChange="fetchRecords"
      @on-search="handleTableSearch"
    >
      <template #name="{ item }">
        <router-link :to="{ name: 'users_show', params: { id: item.id } }">
          <span class="users-list__name">{{ item.name }}</span>
        </router-link>
      </template>
      <template #whatsapp_number="{ item }">
        <a
          class="users-list__whatsapp"
          :href="`https://wa.me/20${item.whatsapp_number}`"
          target="_blank"
          rel="noopener"
          >{{ item.whatsapp_number }}</a
        >
      </template>
      <template #status_text="{ item }">
        <div class="users-list__status">
          <span
            :class="['users-list__dot', `users-list__dot--${item.status}`]"
          ></span>
          {{ item.status_text }}
        </div>
      </template>
      <template #actions="{ item }">
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
      </template>
    </BaseTable>
    <!-- Modals -->
    <UsersChangeStatusModal
      ref="changeStatusModalRef"
      @on-success="fetchRecords"
    />
  </div>
</template>
<script setup>
// ===== IMPORTS =====
// Vue and Libraries
import { ref, computed, onMounted, useTemplateRef } from "vue";
import { storeToRefs } from "pinia";
import { useVuelidate } from "@vuelidate/core";
import { useI18n } from "vue-i18n";
// Stores
import { useUsersStore } from "@/stores/users.store";
// Composables
// Components
import UsersChangeStatusModal from "./UsersChangeStatusModal.vue";
// Constants
// Helpers
import { debounceHelper } from "@/helpers/debounceHelper";
// ===== PROPS & EMITS =====
// ===== STORE INSTANCES =====
const usersStore = useUsersStore();
// ===== COMPOSABLES =====
const { t } = useI18n();
// ===== CONSTANTS =====
const TABLE_HEADERS = [
  {
    text: t("users.table.headers.user_name"),
    value: "name",
    width: 200,
  },
  {
    text: t("users.table.headers.whatsapp_number"),
    value: "whatsapp_number",
    width: 150,
  },
  {
    text: t("users.table.headers.email"),
    value: "email",
    width: 150,
  },
  {
    text: t("users.table.headers.created_at"),
    value: "created_at",
    width: 120,
  },
  { text: t("users.table.headers.status"), value: "status_text", width: 120 },
  {
    text: t("users.table.headers.actions"),
    value: "actions",
    alignment: "center",
  },
];

// ===== REACTIVE STATE & TEMPLATE REFS =====
const changeStatusModalRef = useTemplateRef("changeStatusModalRef");
// ===== VALIDATION RULES =====
// ===== COMPUTED PROPERTIES =====
const { records, uiFlags, meta } = storeToRefs(usersStore);
const requestsList = computed(() => {
  return (records.value || []).map((record) => {
    return {
      ...record,
      created_at: new Date(record.created_at).toLocaleDateString(),
      status_text: t(`users.status.${record.status}`),
    };
  });
});
// ===== LIFECYCLE HOOKS =====

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
  // Fetch records with page 1 and the search term
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
// ===== WATCHERS =====
// ===== EXPOSE PUBLIC METHODS =====
</script>
<style lang="scss" scoped>
.users-list {
  overflow: hidden;
  height: 100%;
  &__name {
    font-size: 1.6rem;
    color: var(--blue-500);
    text-decoration: underline;
  }
  &__whatsapp {
    color: var(--blue-600);
    font-size: 1.6rem;
    text-decoration: underline;
  }
  &__status {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  &__dot {
    height: 16px;
    width: 16px;
    display: inline-block;
    border-radius: 50%;
    &--active {
      background: linear-gradient(139deg, #2be7a3 12.66%, #07b375 80.77%);
    }
    &--rejected {
      background: linear-gradient(141deg, #ff4d4d 12.66%, #ff3535 80.77%);
    }
    &--pending {
      background: linear-gradient(141.17deg, #ffd44f 11.35%, #d5a512 89.33%);
    }
  }
}
</style>
