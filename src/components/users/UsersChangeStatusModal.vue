<template>
  <BaseModal
    ref="changeStatusModalRef"
    :title="t(`users.dialogs.${action}.title`)"
    @close="closeModal"
  >
    <template #content>
      <p
        class="modal__description"
        v-html="t(`users.dialogs.${action}.description`, { name: user?.name })"
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
          {{ t("users.actions.cancel") }}
        </BaseButton>
        <BaseButton
          @click="changeUserStatus"
          :disabled="uiFlags.isDeleting || uiFlags.isUpdating"
          size="sm"
          variant="solid"
          :color="action === 'active' ? 'green' : 'red'"
        >
          {{ t(`users.actions.${action}`) }}
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
import { useUsersStore } from "@/stores/users.store";
// Constants
// Composables
// Components
// ===== PROPS & EMITS =====
const emit = defineEmits(["success"]);
// ===== STORE INSTANCES =====
const usersStore = useUsersStore();
// ===== COMPOSABLES =====
const { t } = useI18n();
// ===== CONSTANTS =====
// ===== REACTIVE STATE & TEMPLATE REFS =====
const user = ref(null);
const action = ref(null);
const changeStatusModalRef = ref(null);
// ===== VALIDATION RULES =====
// ===== COMPUTED PROPERTIES =====
const { uiFlags } = storeToRefs(usersStore);
// ===== LIFECYCLE HOOKS =====
// ===== METHODS =====
const openModal = (selectedUser, selectedAction) => {
  user.value = selectedUser;
  action.value = selectedAction;
  changeStatusModalRef.value.open();
};
const closeModal = () => {
  changeStatusModalRef.value.close();
  resetUserForm();
};
const resetUserForm = () => {
  user.value = null;
  action.value = null;
};
const changeUserStatus = async () => {
  if (!action.value) return;
  if (action.value === "delete") {
    const response = await usersStore.deleteRecord(user.value?.id);
    if (response.isDeleted) {
      closeModal();
      emit("success");
    }
  } else {
    const response = await usersStore.updateRecord(user.value?.id, {
      status: action.value,
    });
    if (response.isUpdated) {
      closeModal();
      emit("success");
    }
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
