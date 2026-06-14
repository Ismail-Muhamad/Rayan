<template>
  <div class="users-list">
    <!-- Hero Section -->
    <UsersListHero :totalUsers="meta?.total || requestsList?.length || 0" />

    <!-- Toolbar Section -->
    <UsersListToolbar @search="handleToolbarSearch" />

    <!-- Cards Section -->
    <UsersListCards
      :items="usersList"
      :meta="meta"
      :isLoading="uiFlags.isFetchingList"
      @page-change="fetchRecords"
      @row-action="triggerShowModal"
    />

    <!-- Modal -->
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
import UsersListHero from "./components/UsersListHero.vue";
import UsersListToolbar from "./components/UsersListToolbar.vue";
import UsersListCards from "./components/UsersListCards.vue";
import UsersChangeStatusModal from "../UsersChangeStatusModal.vue";

// ===== HELPERS =====
import { debounceHelper } from "@/helpers/debounceHelper";

// ===== STORE INSTANCES =====
const usersStore = useUsersStore();

// ===== COMPOSABLES =====
const { t, locale } = useI18n();

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

const handleToolbarSearch = debounceHelper(async function (query) {
  fetchRecords(1, query);
}, 500);

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
</script>

<style lang="scss" scoped>
.users-list {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 30%),
    radial-gradient(circle at bottom left, rgba(79, 70, 229, 0.05), transparent 30%),
    linear-gradient(180deg, #f8fbff 0%, #f4f8ff 100%);
}
</style>