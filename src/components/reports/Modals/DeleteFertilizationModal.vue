<template>
  <BaseModal
    ref="modalRef"
    title="حذف تسميد"
    :subtitle="modalSubtitle"
    size="md"
  >
    <template #content>
      <div v-if="localDay" class="delete-fert-modal">
        <p class="delete-fert-modal__hint">حدد أنواع السماد التي ترغب في حذفها لهذا اليوم:</p>
        
        <div class="delete-fert-modal__list">
          <label 
            v-for="(fert, index) in localDay.fertilizations" 
            :key="index"
            class="delete-fert-modal__checkbox-item"
          >
            <input 
              type="checkbox" 
              v-model="selectedToDelete" 
              :value="index" 
            />
            <span class="delete-fert-modal__fert-name">
              {{ getFertilizerTypeName(fert) }} ({{ fert.fertilizer_quantity_per_palm_tree }} جرام)
            </span>
          </label>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="delete-fert-modal__footer">
        <BaseButton variant="soft" color="gray" @click="closeModal">
          إلغاء
        </BaseButton>
        <BaseButton 
          variant="solid" 
          color="red" 
          @click="handleDelete" 
          :disabled="isSaving || selectedToDelete.length === 0"
        >
          حذف المحدد
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  fertilizerTypes: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["save"]);

const modalRef = ref(null);
const localDay = ref(null);
const isSaving = ref(false);
const selectedToDelete = ref([]);

const originalReportId = ref(null);
const originalWeekIndex = ref(null);
const originalDayIndex = ref(null);

const modalSubtitle = computed(() => {
  if (!localDay.value) return "";
  return `${localDay.value.day} - ${localDay.value.date}`;
});

const getFertilizerTypeName = (fert) => {
  const types = Array.isArray(props.fertilizerTypes) 
    ? props.fertilizerTypes 
    : props.fertilizerTypes?.data || [];
    
  const typeId = fert.fertilizer_type_id || fert.type_of_fertilization;
  const matched = types.find(t => String(t.id) === String(typeId) || t.name === typeId);
  return matched?.name || "بدون نوع";
};

const openModal = (reportId, weekIndex, dayIndex, dayData) => {
  originalReportId.value = reportId;
  originalWeekIndex.value = weekIndex;
  originalDayIndex.value = dayIndex;
  
  localDay.value = JSON.parse(JSON.stringify(dayData));
  selectedToDelete.value = [];
  
  modalRef.value?.open();
};

const closeModal = () => {
  modalRef.value?.close();
  setTimeout(() => {
    localDay.value = null;
    selectedToDelete.value = [];
  }, 300);
};

const handleDelete = () => {
  isSaving.value = true;
  
  // Remove the selected indexes (sort descending to not mess up indexes while splicing)
  const sortedIndexes = [...selectedToDelete.value].sort((a, b) => b - a);
  sortedIndexes.forEach(idx => {
    localDay.value.fertilizations.splice(idx, 1);
  });
  
  // If array becomes empty, initialize with an empty one so it doesn't break
  if (localDay.value.fertilizations.length === 0) {
    localDay.value.fertilizations = [{
      type_of_fertilization: "0",
      fertilizer_quantity_per_palm_tree: "0"
    }];
  }

  emit("save", {
    reportId: originalReportId.value,
    weekIndex: originalWeekIndex.value,
    dayIndex: originalDayIndex.value,
    updatedDay: localDay.value,
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
.delete-fert-modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px 0;

  &__hint {
    font-size: 14px;
    color: var(--gray-600);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__checkbox-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #fff5f5;
    border: 1px solid #fed7d7;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #fef2f2;
    }

    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #ef4444;
      cursor: pointer;
    }
  }

  &__fert-name {
    font-size: 15px;
    font-weight: 500;
    color: var(--gray-800);
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    width: 100%;
  }
}
</style>
