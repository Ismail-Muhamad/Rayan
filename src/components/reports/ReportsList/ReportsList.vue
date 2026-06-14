<template>
  <div class="reports-list">
    <!-- Hero Section -->
    <ReportsListHero
      :totalFarms="farmsMeta?.total || farmsList.length || 0"
      :totalReports="farmsMeta?.total || farmsList.length || 0"
    />
    <!-- Toolbar: Search + Create -->
    <ReportsListToolbar
      @search="handleToolbarSearch"
      @create="router.push({ name: 'create_report' })"
    />
    <!-- Cards Section -->
    <ReportsListTable
      :items="farmsList"
      :meta="farmsMeta"
      :isLoading="farmsUiFlags.isFetchingList"
      @page-change="fetchRecords"
      @row-action="triggerRowAction"
    />
    <!-- Delete Modal -->
    <ReportsDeleteModal ref="deleteReportModalRef" />
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useFarmsStore } from "@/stores/farms.store";
import { debounceHelper } from "@/helpers/debounceHelper";
import ReportsListHero from "./components/ReportsListHero.vue";
import ReportsListToolbar from "./components/ReportsListToolbar.vue";
import ReportsListTable from "./components/ReportsListTable.vue";
import ReportsDeleteModal from "../Modals/ReportsDeleteModal.vue";
const farmsStore = useFarmsStore();
const router = useRouter();
const { t } = useI18n();
// ─── Store Refs ───
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
// ─── Lifecycle ───
onMounted(() => {
  fetchRecords(1);
});
// ─── Methods ───
const fetchRecords = (page, search_term = undefined) => {
  farmsStore.fetchRecords({
    page,
    name: search_term || undefined,
  });
};
const handleToolbarSearch = debounceHelper(async function (query) {
  fetchRecords(1, query);
}, 500);
const triggerRowAction = (action, item) => {
  const actionsMap = {
    delete: () => deleteReportModalRef.value.openModal(item),
    edit: () => router.push({ name: "edit_report", params: { id: item.id } }),
  };
  actionsMap[action]?.();
};
</script>
<style lang="scss" scoped>
.reports-list {
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