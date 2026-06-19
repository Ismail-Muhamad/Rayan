<template>
  <BaseModal
    ref="modalRef"
    :title="modalTitle"
    :subtitle="modalSubtitle"
    size="md"
  >
    <template #content>
      <div v-if="localDay" class="edit-activity-modal">
        <!-- Fertilization Section -->
        <div v-if="activityType === 'fertilization'" class="edit-activity-modal__section">
          <div
            v-for="(fert, index) in localDay.fertilizations"
            :key="index"
            class="edit-activity-modal__item-group"
          >
            <div class="edit-activity-modal__item-header">
              <span class="edit-activity-modal__item-title">
                نوع السماد #{{ index + 1 }}
              </span>
              <BaseButton
                v-if="localDay.fertilizations.length > 1"
                color="red"
                variant="ghost"
                size="icon-sm"
                @click="removeFertilization(index)"
              >
                <BaseIcon name="mdi:close" width="16" height="16" />
              </BaseButton>
            </div>
            
            <BaseSelect
              label="نوع السماد"
              v-model="fert.type_of_fertilization"
              :options="fertilizerTypeOptions"
            />
            
            <BaseInput
              label="كمية التسميد لكل نخلة (جرام)"
              v-model="fert.fertilizer_quantity_per_palm_tree"
              type="number"
            />
          </div>
          
          <BaseButton
            variant="outline"
            size="sm"
            @click="addFertilization"
            class="edit-activity-modal__add-btn"
          >
            <BaseIcon name="mdi:plus" width="16" height="16" />
            إضافة تسميد
          </BaseButton>
        </div>

        <!-- Irrigation Section -->
        <div v-if="activityType === 'irrigation'" class="edit-activity-modal__section">
          <BaseInput
            label="كمية الري لكل نخلة (لتر)"
            v-model="localDay.irrigation_amount_per_palm_tree"
            type="number"
          />
          <BaseInput
            label="مدة الري لكل نخلة (دقيقة)"
            v-model="localDay.duration_of_irrigation_per_palm_tree"
            type="number"
          />
        </div>

        <!-- Spraying Section -->
        <div v-if="activityType === 'spraying'" class="edit-activity-modal__section">
          <BaseSelect
            label="نوع المبيد الحشري"
            v-model="localDay.spraying"
            :options="pesticideTypeOptions"
          />
          <BaseInput
            label="كمية الرش لكل نخلة"
            v-model="localDay.amount_of_spray"
            type="number"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="edit-activity-modal__footer">
        <BaseButton variant="soft" color="gray" @click="closeModal">
          إلغاء
        </BaseButton>
        <BaseButton variant="solid" color="blue" @click="handleSave" :disabled="isSaving">
          حفظ
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import BaseIcon from "@/components/shared/BaseIcon.vue";

const props = defineProps({
  fertilizerTypes: {
    type: Array,
    default: () => [],
  },
  pesticideTypes: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["save"]);


const modalRef = ref(null);
const localDay = ref(null);
const activityType = ref(null);
const isSaving = ref(false);

const originalReportId = ref(null);
const originalWeekIndex = ref(null);
const originalDayIndex = ref(null);

const fertilizerTypeOptions = computed(() => {
  const types = Array.isArray(props.fertilizerTypes) 
    ? props.fertilizerTypes 
    : props.fertilizerTypes?.data || [];

  return [
    { label: "بدون إضافة", id: "0" },
    ...types.map((type) => ({
      label: type.name,
      id: type.name,
    })),
  ];
});

const pesticideTypeOptions = computed(() => {
  const types = Array.isArray(props.pesticideTypes) 
    ? props.pesticideTypes 
    : props.pesticideTypes?.data || [];

  return [
    { label: "بدون إضافة", id: "0" },
    ...types.map((type) => ({
      label: type.name,
      id: type.name,
    })),
  ];
});

const modalTitle = computed(() => {
  if (activityType.value === "fertilization") return "تعديل التسميد";
  if (activityType.value === "irrigation") return "تعديل الري";
  if (activityType.value === "spraying") return "تعديل الرش";
  return "";
});

const modalSubtitle = computed(() => {
  if (!localDay.value) return "";
  return `${localDay.value.day} - ${localDay.value.date}`;
});

const openModal = (reportId, weekIndex, dayIndex, dayData, type) => {
  originalReportId.value = reportId;
  originalWeekIndex.value = weekIndex;
  originalDayIndex.value = dayIndex;
  
  localDay.value = JSON.parse(JSON.stringify(dayData));
  
  if (type === "fertilization") {
    if (!localDay.value.fertilizations || localDay.value.fertilizations.length === 0) {
      localDay.value.fertilizations = [{
        type_of_fertilization: "0",
        fertilizer_quantity_per_palm_tree: "0"
      }];
    } else {
      localDay.value.fertilizations.forEach(fert => {
        const typeId = fert.fertilizer_type_id || fert.type_of_fertilization;
        const types = Array.isArray(props.fertilizerTypes) 
          ? props.fertilizerTypes 
          : props.fertilizerTypes?.data || [];
          
        const matched = types.find(t => String(t.id) === String(typeId) || t.name === typeId);
        
        if (matched) {
          fert.type_of_fertilization = matched.name;
        } else {
          fert.type_of_fertilization = "0";
        }
      });
    }
  }

  if (type === "spraying") {
    const typeId = localDay.value.pesticide_type_id || localDay.value.spraying;
    const types = Array.isArray(props.pesticideTypes) 
      ? props.pesticideTypes 
      : props.pesticideTypes?.data || [];
      
    const matched = types.find(t => String(t.id) === String(typeId) || t.name === typeId);
    
    if (matched) {
      localDay.value.spraying = matched.name;
    } else {
      localDay.value.spraying = "0";
    }
  }

  activityType.value = type;
  modalRef.value?.open();
};

const closeModal = () => {
  modalRef.value?.close();
  setTimeout(() => {
    localDay.value = null;
    activityType.value = null;
  }, 300);
};

const addFertilization = () => {
  if (!localDay.value.fertilizations) {
    localDay.value.fertilizations = [];
  }
  localDay.value.fertilizations.push({
    type_of_fertilization: "0",
    fertilizer_quantity_per_palm_tree: "0",
  });
};

const removeFertilization = (index) => {
  localDay.value.fertilizations.splice(index, 1);
};

const handleSave = () => {
  isSaving.value = true;
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
.edit-activity-modal {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 10px 0;

  &__section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__item-group {
    padding: 16px;
    background: #fcfdfe;
    border: 1px dashed var(--blue-200);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__item-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--blue-700);
  }

  &__add-btn {
    align-self: flex-start;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    width: 100%;
  }
}
</style>
