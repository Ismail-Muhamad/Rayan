<template>
  <BaseModal
    ref="modalRef"
    :title="modalTitle"
    :subtitle="modalSubtitle"
    size="md"
  >
    <template #content>
      <div class="delete-confirm-modal">
        <p class="delete-confirm-modal__text">{{ modalText }}</p>
      </div>
    </template>

    <template #footer>
      <div class="delete-confirm-modal__footer">
        <BaseButton variant="soft" color="gray" @click="closeModal">
          إلغاء
        </BaseButton>
        <BaseButton 
          variant="solid" 
          color="red" 
          @click="handleConfirm" 
          :disabled="isSaving"
        >
          حذف
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from "vue";

const emit = defineEmits(["confirm"]);

const modalRef = ref(null);
const isSaving = ref(false);

const activityType = ref("");
const localDay = ref(null);

const originalReportId = ref(null);
const originalWeekIndex = ref(null);
const originalDayIndex = ref(null);

const modalTitle = computed(() => {
  return activityType.value === "irrigation" ? "حذف الري" : "حذف الرش";
});

const modalText = computed(() => {
  return activityType.value === "irrigation" 
    ? "هل أنت متأكد من حذف بيانات الري لهذا اليوم؟" 
    : "هل أنت متأكد من حذف بيانات الرش لهذا اليوم؟";
});

const modalSubtitle = computed(() => {
  if (!localDay.value) return "";
  return `${localDay.value.day} - ${localDay.value.date}`;
});

const openModal = (reportId, weekIndex, dayIndex, dayData, type) => {
  originalReportId.value = reportId;
  originalWeekIndex.value = weekIndex;
  originalDayIndex.value = dayIndex;
  localDay.value = dayData;
  activityType.value = type;
  
  modalRef.value?.open();
};

const closeModal = () => {
  modalRef.value?.close();
  setTimeout(() => {
    localDay.value = null;
    activityType.value = "";
  }, 300);
};

const handleConfirm = () => {
  isSaving.value = true;
  
  emit("confirm", {
    reportId: originalReportId.value,
    weekIndex: originalWeekIndex.value,
    dayIndex: originalDayIndex.value,
    activityType: activityType.value,
    dayData: localDay.value,
    done: () => {
      isSaving.value = false;
      closeModal();
    }
  });
};

defineExpose({
  openModal,
});
</script>

<style lang="scss" scoped>
.delete-confirm-modal {
  padding: 10px 0;

  &__text {
    font-size: 16px;
    color: var(--gray-800);
    margin: 0;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    width: 100%;
  }
}
</style>
