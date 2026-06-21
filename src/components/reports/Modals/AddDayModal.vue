<template>
  <BaseModal
    ref="modalRef"
    size="md"
  >
    <template #title>
      <div class="modal-header">
        <BaseIcon name="solar:calendar-add-outline" width="24" height="24" class="modal-header-icon" />
        <h3 class="modal-title">إضافة يوم للتقرير</h3>
      </div>
    </template>

    <template #content>
      <div class="modal-content">
        <p class="modal-desc">الرجاء اختيار اليوم الذي تريد إضافته للتقرير. سيتم إنشاء اليوم داخل نفس شهر وسنة التقرير الحالي.</p>

        <div class="form-group">
          <label class="form-label">اليوم</label>
          <select v-model="selectedDayNumber" class="form-control" dir="rtl">
            <option disabled value="">اختر اليوم...</option>
            <option v-for="d in daysInMonth" :key="d" :value="d">
              {{ d }} {{ monthName }}
            </option>
          </select>
          <span v-if="errorMsg" class="error-msg">{{ errorMsg }}</span>
        </div>
        
        <div class="form-group">
          <label class="form-label">النشاط المراد إضافته</label>
          <select v-model="selectedActivity" class="form-control">
            <option value="fertilization">تسميد</option>
            <option value="irrigation">ري</option>
            <option value="spraying">رش</option>
          </select>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="modal-footer">
        <BaseButton
          variant="soft"
          color="gray"
          @click="closeModal"
          :disabled="isSubmitting"
        >
          إلغاء
        </BaseButton>
        <BaseButton
          variant="solid"
          color="blue"
          @click="handleAddDay"
          :loading="isSubmitting"
          :disabled="!selectedDayNumber || !selectedActivity"
        >
          إضافة اليوم
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref } from "vue";
import moment from "moment";
import BaseModal from "@/components/shared/BaseModal.vue";
import BaseButton from "@/components/shared/BaseButton.vue";
import BaseIcon from "@/components/shared/BaseIcon.vue";

const emit = defineEmits(["save"]);

const modalRef = ref(null);
const isSubmitting = ref(false);
const selectedDayNumber = ref("");
const selectedActivity = ref("fertilization");
const errorMsg = ref("");
const reportId = ref(null);
const daysInMonth = ref(30);
const reportDateObj = ref(null);
const monthName = ref("");

const openModal = (id, dateObj) => {
  reportId.value = id;
  selectedDayNumber.value = "";
  selectedActivity.value = "fertilization";
  errorMsg.value = "";
  isSubmitting.value = false;
  
  if (dateObj) {
    reportDateObj.value = dateObj;
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    daysInMonth.value = new Date(year, month + 1, 0).getDate();
    monthName.value = new Intl.DateTimeFormat("ar-EG", { month: "long" }).format(dateObj);
  } else {
    daysInMonth.value = 31;
    monthName.value = "";
  }

  modalRef.value?.open();
};

const closeModal = () => {
  modalRef.value?.close();
};

const handleAddDay = () => {
  if (!selectedDayNumber.value) {
    errorMsg.value = "الرجاء اختيار اليوم";
    return;
  }
  
  isSubmitting.value = true;
  errorMsg.value = "";

  let fullDateStr = "";
  if (reportDateObj.value) {
    const y = reportDateObj.value.getFullYear();
    const m = String(reportDateObj.value.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDayNumber.value).padStart(2, '0');
    fullDateStr = `${y}-${m}-${d}`;
  } else {
    const y = new Date().getFullYear();
    const m = String(new Date().getMonth() + 1).padStart(2, '0');
    const d = String(selectedDayNumber.value).padStart(2, '0');
    fullDateStr = `${y}-${m}-${d}`;
  }

  emit("save", {
    reportId: reportId.value,
    date: fullDateStr,
    activity: selectedActivity.value,
    done: () => {
      isSubmitting.value = false;
      closeModal();
    },
    error: (msg) => {
      isSubmitting.value = false;
      errorMsg.value = msg;
    }
  });
};

defineExpose({
  openModal
});
</script>

<style lang="scss" scoped>
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .modal-header-icon {
    color: var(--blue-600);
  }
  
  .modal-title {
    margin: 0;
    font-size: 1.4rem; /* Increased */
    font-weight: 700;
  }
}

.modal-content {
  padding: 10px 0;
  
  .modal-desc {
    color: var(--gray-600);
    margin-bottom: 24px;
    font-size: 1.15rem; /* Increased */
    line-height: 1.6;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px; /* Increased gap */
  margin-bottom: 20px; /* Added margin to separate groups */
  
  .form-label {
    font-size: 1.1rem; /* Increased */
    font-weight: 600;
    color: var(--gray-800);
  }
  
  .form-control {
    width: 100%;
    padding: 14px 18px; /* Increased padding */
    border: 1px solid var(--gray-200);
    border-radius: 10px;
    font-size: 1.15rem; /* Increased font size */
    outline: none;
    transition: all 0.2s;
    font-family: inherit;
    background-color: #f9fafb;
    
    &:focus {
      border-color: var(--blue-400);
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
      background-color: #ffffff;
    }
  }
}

.error-msg {
  color: var(--danger-500);
  font-size: 1rem; /* Increased */
  margin-top: 6px;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
}
</style>
