<template>
  <BasePageWrapper
    titleKey="dashboard.title"
    subtitleKey="dashboard.subtitle"
    iconName="solar:clipboard-list-outline"
  >
    <div class="dashboard">
      <BaseTable
        :headers="TABLE_HEADERS"
        :items="requestsList"
        :meta="meta"
        :isLoading="uiFlags.isFetchingList"
        pagination
        @onPageChange="fetchRecords"
        @on-search="handleTableSearch"
        :search-placeholder="t('GLOBAL.TABLE.SEARCH')"
      >
        <template #whatsapp_number="{ item }">
          <a
            class="dashboard__link"
            :href="`https://wa.me/20${item.whatsapp_number}`"
            target="_blank"
            rel="noopener"
            >{{ item.whatsapp_number }}</a
          >
        </template>
        <template #service="{ item }">
          <p class="dashboard__service" v-tooltip="item.service">
            {{ item.service }}
          </p>
        </template>
        <template #message="{ item }">
          <p class="dashboard__message" v-tooltip="item.message">
            {{ item.message }}
          </p>
        </template>
      </BaseTable>
    </div>
  </BasePageWrapper>
</template>
<script setup>
// ===== IMPORTS =====
// Vue and Libraries
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useVuelidate } from "@vuelidate/core";
import { useI18n } from "vue-i18n";
// Stores
import { useRequestsStore } from "@/stores/requests.store";
import { debounceHelper } from "@/helpers/debounceHelper";
// Composables
// Components
// Constants
// Helpers
// ===== PROPS & EMITS =====
// ===== STORE INSTANCES =====
const requestsStore = useRequestsStore();
// ===== COMPOSABLES =====
const { t } = useI18n();
// ===== CONSTANTS =====
const TABLE_HEADERS = [
  {
    text: t("dashboard.TABLE.USER_NAME"),
    value: "user_name",
    width: 200,
  },
  {
    text: t("dashboard.TABLE.WHATSAPP_NUMBER"),
    value: "whatsapp_number",
    width: 150,
  },
  {
    text: t("dashboard.TABLE.PHONE_NUMBER"),
    value: "phone_number",
    width: 150,
  },
  { text: t("dashboard.TABLE.SERVICE"), value: "service", width: 150 },
  { text: t("dashboard.TABLE.CREATED_AT"), value: "created_at", width: 120 },
  { text: t("dashboard.TABLE.MESSAGE"), value: "message", alignment: "center" },
];

// ===== REACTIVE STATE & TEMPLATE REFS =====
const { records, uiFlags, meta } = storeToRefs(requestsStore);
// ===== VALIDATION RULES =====
// ===== COMPUTED PROPERTIES =====
const requestsList = computed(() => {
  return (records.value || []).map((record) => {
    return {
      ...record,
      created_at: new Date(record.created_at).toLocaleDateString(),
      service: t(`dashboard.SERVICES.${record.service}`),
    };
  });
});
// ===== LIFECYCLE HOOKS =====

onMounted(() => {
  fetchRecords(1);
});
// ===== METHODS =====
const fetchRecords = (page, search_term = undefined) => {
  requestsStore.fetchRecords({
    page,
    search_term,
  });
};
const handleTableSearch = debounceHelper(async function (query) {
  // Fetch records with page 1 and the search term
  fetchRecords(1, query);
}, 500);
// ===== WATCHERS =====
// ===== EXPOSE PUBLIC METHODS =====
</script>
<style lang="scss" scoped>
.dashboard {
  overflow: hidden;
  height: 100%;
  padding: 16px;
  &__service,
  &__message {
    font-size: 1.4rem;
  }
  &__link {
    color: var(--blue-500);
    font-size: 1.4rem;
  }
}
</style>
