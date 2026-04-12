<template>
  <BaseModal
    ref="deleteReportModalRef"
    :title="t('reports.dialogs.delete.title')"
    @close="closeModal"
  >
    <template #content>
      <p
        class="modal__description"
        v-html="
          t('reports.dialogs.delete.message', {
            month: report?.month,
            farm_name: report?.farm_name,
            palm_type: report?.palm_type?.name,
          })
        "
      ></p>
    </template>
    <template #footer>
      <div class="modal__actions">
        <BaseButton
          size="sm"
          variant="outline"
          color="gray"
          @click="closeModal"
        >
          {{ t("reports.actions.cancel") }}
        </BaseButton>
        <BaseButton
          @click="deleteReport"
          :disabled="uiFlags.isDeleting"
          size="sm"
          variant="solid"
          color="red"
        >
          {{ t("reports.actions.delete") }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
// ===== IMPORTS =====
// Vue and Libraries
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
// Stores
import { useReportsStore } from "@/stores/reports.store";
// Constants
// Composables
// Components
// ===== PROPS & EMITS =====
const emit = defineEmits(["refetch"]);
// ===== STORE INSTANCES =====
const reportsStore = useReportsStore();
// ===== COMPOSABLES =====
const { t } = useI18n();
// ===== CONSTANTS =====
// ===== REACTIVE STATE & TEMPLATE REFS =====
const report = ref(null);
const deleteReportModalRef = ref(null);
// ===== VALIDATION RULES =====
// ===== COMPUTED PROPERTIES =====
const { uiFlags } = storeToRefs(reportsStore);
// ===== LIFECYCLE HOOKS =====
// ===== METHODS =====
const openModal = (selectedReport) => {
  deleteReportModalRef.value.open();
  report.value = selectedReport;
};
const closeModal = () => {
  deleteReportModalRef.value.close();
  resetReportForm();
};
const resetReportForm = () => {
  report.value = null;
};
const deleteReport = async () => {
  const response = await reportsStore.deleteRecord(report.value?.id);
  if (response.isDeleted) {
    closeModal();
    emit("refetch");
  }
};
// ===== TEMPLATE REFS AND DOM-RELATED LOGIC =====
// ===== WATCHERS =====
// ===== EXPOSE PUBLIC METHODS =====
defineExpose({
  openModal,
  closeModal,
});
</script>

<style lang="scss" scoped>
.modal {
  &__description {
    font-size: 1.4rem;
    color: var(--gray-500);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;
  }
}
</style>
