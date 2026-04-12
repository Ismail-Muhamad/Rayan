<template>
  <BaseModal
    ref="deleteFarmModalRef"
    :title="t('farms.dialogs.delete.title')"
    @close="closeModal"
  >
    <template #content>
      <p
        class="modal__description"
        v-html="t('farms.dialogs.delete.message', { name: farm?.name })"
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
          {{ t("farms.actions.cancel") }}
        </BaseButton>
        <BaseButton
          @click="deleteFarm"
          :disabled="uiFlags.isDeleting"
          size="sm"
          variant="solid"
          color="red"
        >
          {{ t("farms.actions.delete") }}
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
import { useFarmsStore } from "@/stores/farms.store";
// Constants
// Composables
// Components
// ===== PROPS & EMITS =====
// ===== STORE INSTANCES =====
const farmsStore = useFarmsStore();
// ===== COMPOSABLES =====
const { t } = useI18n();
// ===== CONSTANTS =====
// ===== REACTIVE STATE & TEMPLATE REFS =====
const farm = ref(null);
const deleteFarmModalRef = ref(null);
// ===== VALIDATION RULES =====
// ===== COMPUTED PROPERTIES =====
const { uiFlags } = storeToRefs(farmsStore);
// ===== LIFECYCLE HOOKS =====
// ===== METHODS =====
const openModal = (selectedFarm) => {
  deleteFarmModalRef.value.open();
  farm.value = selectedFarm;
};
const closeModal = () => {
  deleteFarmModalRef.value.close();
  resetFarmForm();
};
const resetFarmForm = () => {
  farm.value = null;
};
const deleteFarm = async () => {
  const response = await farmsStore.deleteRecord(farm.value?.id);
  if (response.isDeleted) {
    closeModal();
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
