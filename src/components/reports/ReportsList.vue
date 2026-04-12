<template>
  <div class="reports-list">
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
        <router-link :to="{ name: 'show_report', params: { id: item.id } }">
          <span class="reports-list__name">{{ item.name }}</span>
        </router-link>
      </template>
      <template #actions="{ item }">
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
      </template>
    </BaseTable>
    <!-- MODALS -->
    <ReportsDeleteModal ref="deleteReportModalRef" />
  </div>
</template>
<script setup>
// ===== IMPORTS =====
// Vue and Libraries
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useVuelidate } from "@vuelidate/core";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
// Stores
import { useReportsStore } from "@/stores/reports.store";
import { useFarmsStore } from "@/stores/farms.store";
// Composables
// Components
import ReportsDeleteModal from "./Modals/ReportsDeleteModal.vue";
// Constants
// Helpers
import { debounceHelper } from "@/helpers/debounceHelper";
// ===== PROPS & EMITS =====
// ===== STORE INSTANCES =====
const reportsStore = useReportsStore();
const farmsStore = useFarmsStore();
// ===== COMPOSABLES =====
const router = useRouter();
const { t, locale } = useI18n();
// ===== CONSTANTS =====
const TABLE_HEADERS = [
  {
    text: t("reports.table.headers.farm_name"),
    value: "farm_name",
    width: 200,
  },
  {
    text: t("reports.table.headers.location"),
    value: "location",
    width: 200,
  },
  {
    text: t("reports.table.headers.owner_name"),
    value: "owner_name",
    width: 120,
  },
];
const ROW_ACTIONS = [
  {
    key: "edit",
    label: t("reports.actions.edit"),
  },
  {
    key: "delete",
    label: t("reports.actions.delete"),
    danger: true,
  },
];

// ===== REACTIVE STATE & TEMPLATE REFS =====
const deleteReportModalRef = ref(null);
// ===== VALIDATION RULES =====
// ===== COMPUTED PROPERTIES =====
// const { records, uiFlags, meta } = storeToRefs(reportsStore);
const {
  records: farmsRecords,
  uiFlags: farmsUiFlags,
  meta: farmsMeta,
} = storeToRefs(farmsStore);
const farmsList = computed(() => {
  return (farmsRecords.value || []).map((record) => {
    return {
      ...record,
      // created_at: new Date(record.created_at).toLocaleDateString(),
      farm_name: record?.name,
      location: record?.location,
      owner_name: record?.owner?.name,
      // tree_type: record?.palm_type?.name,
      // month: new Intl.DateTimeFormat(locale, { month: "long" }).format(
      //   new Date(record?.report_weeks?.[0]?.days?.[0]?.date),
      // ),
    };
  });
});
// ===== LIFECYCLE HOOKS =====
onMounted(() => {
  fetchRecords(1);
});
// ===== METHODS =====
const fetchRecords = (page, search_term = undefined) => {
  // reportsStore.fetchRecords({
  //   page,
  //   name: search_term || undefined,
  // });
  farmsStore.fetchRecords({
    page,
    name: search_term || undefined,
  });
};
const handleTableSearch = debounceHelper(async function (query) {
  // Fetch records with page 1 and the search term
  fetchRecords(1, query);
}, 500);
const triggerRowAction = (action, item) => {
  const actionsMap = {
    delete: () => deleteReportModalRef.value.openModal(item),
    edit: () => router.push({ name: "edit_report", params: { id: item.id } }),
  };
  actionsMap[action]();
};
// ===== WATCHERS =====
// ===== EXPOSE PUBLIC METHODS =====
</script>
<style lang="scss" scoped>
.reports-list {
  overflow: hidden;
  height: 100%;
  &__name {
    font-size: 1.6rem;
    color: var(--blue-500);
    text-decoration: underline;
  }
}
</style>
