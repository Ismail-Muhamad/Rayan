<template>
  <BasePageWrapper :titleKey="'إدارة مهام اليوم'" :subtitleKey="formattedDate" iconName="solar:calendar-date-outline">
    <div class="task-day-page">
      
      <!-- زر الرجوع -->
      <div class="back-action">
        <BaseButton variant="soft" color="gray" size="sm" @click="goBack">
          <BaseIcon name="solar:arrow-right-outline" />
          رجوع لتقويم العميل
        </BaseButton>
      </div>

      <div v-if="loading" class="loading-state">
        جاري تحميل المهام...
      </div>
      
      <div v-else-if="!mockFarm" class="empty-state">
        <BaseIcon name="solar:database-outline" class="empty-icon" />
        <h3>لم يتم العثور على بيانات المزرعة</h3>
      </div>

      <div v-else class="day-content">
        <!-- معلومات العميل والمزرعة -->
        <section class="day-hero">
          <div class="day-hero__main">
            <div class="client-badge">
              <BaseIcon name="solar:user-circle-outline" />
              <span>العميل: {{ clientName }}</span>
            </div>
            <h2 class="day-hero__farm-name">{{ mockFarm.name }}</h2>
            <p class="day-hero__date">
              <BaseIcon name="solar:calendar-mark-outline" />
              {{ formattedDateFull }}
            </p>
          </div>
        </section>

        <!-- المهام مقسمة حسب نوع النخل -->
        <div class="palm-sections">
          <div v-for="palmType in mockFarm.palmTypes" :key="palmType.id" class="palm-section">
            <div class="palm-section__header">
              <div class="palm-section__title-wrap">
                <BaseIcon name="solar:leaf-outline" class="palm-section__icon" />
                <h3 class="palm-section__title">نخيل {{ palmType.name }}</h3>
              </div>
              <div class="palm-section__badge">
                {{ palmType.tasks.length }} مهام
              </div>
            </div>

            <div class="tasks-grid">
              <div
                v-for="task in palmType.tasks"
                :key="task.id"
                class="task-card"
                :class="{
                  'task-card--completed': task.isCompleted,
                  'task-card--future': task.isFuture
                }"
              >
                <!-- يمين الكارت: حالة المهمة ومعلوماتها -->
                <div class="task-card__main">
                  <div class="task-card__checkbox-wrap">
                    <button
                      class="task-checkbox"
                      :class="{
                        'task-checkbox--checked': task.isCompleted,
                        'task-checkbox--disabled': task.isFuture
                      }"
                      :disabled="task.isFuture"
                      @click="toggleTaskCompletion(task)"
                    >
                      <BaseIcon v-if="task.isCompleted" name="solar:check-read-outline" />
                      <BaseIcon v-else-if="task.isFuture" name="solar:lock-outline" />
                      <div v-else class="task-checkbox__empty"></div>
                    </button>
                  </div>

                  <div class="task-card__info">
                    <div class="task-card__top">
                      <span class="task-tag" :class="`task-tag--${task.type}`">
                        <BaseIcon :name="getTaskIcon(task.type)" :width="14" :height="14" />
                        {{ getTaskTypeName(task.type) }}
                      </span>
                    </div>
                    <h4 class="task-card__title">{{ task.title }}</h4>
                    
                    <div class="task-details" v-if="task.quantitativeData && Object.keys(task.quantitativeData).length > 0">
                      <div v-if="task.type === 'irrigation'" class="task-details__list">
                         <div class="task-details__item" v-if="task.quantitativeData.irrigation_amount_per_palm_tree && task.quantitativeData.irrigation_amount_per_palm_tree !== '0'">
                           <span class="detail-label">كمية الري للنخلة:</span>
                           <span class="detail-value">{{ task.quantitativeData.irrigation_amount_per_palm_tree }} لتر</span>
                         </div>
                         <div class="task-details__item" v-if="task.quantitativeData.total_amount_of_irrigation && task.quantitativeData.total_amount_of_irrigation !== '0'">
                           <span class="detail-label">الكمية الإجمالية:</span>
                           <span class="detail-value">{{ task.quantitativeData.total_amount_of_irrigation }} لتر</span>
                         </div>
                         <div class="task-details__item" v-if="task.quantitativeData.duration_of_irrigation_per_palm_tree && task.quantitativeData.duration_of_irrigation_per_palm_tree !== '0'">
                           <span class="detail-label">مدة الري للنخلة:</span>
                           <span class="detail-value">{{ task.quantitativeData.duration_of_irrigation_per_palm_tree }} دقيقة</span>
                         </div>
                      </div>
                      
                      <div v-if="task.type === 'spraying'" class="task-details__list">
                         <div class="task-details__item" v-if="task.quantitativeData.spraying">
                           <span class="detail-label">نوع الرش:</span>
                           <span class="detail-value">{{ task.quantitativeData.spraying }}</span>
                         </div>
                         <div class="task-details__item" v-if="task.quantitativeData.amount_of_spray && task.quantitativeData.amount_of_spray !== '0'">
                           <span class="detail-label">كمية الرش للنخلة:</span>
                           <span class="detail-value">{{ formatWeight(task.quantitativeData.amount_of_spray) }}</span>
                         </div>
                         <div class="task-details__item" v-if="task.quantitativeData.total_spray && task.quantitativeData.total_spray !== '0'">
                           <span class="detail-label">إجمالي كمية الرش:</span>
                           <span class="detail-value">{{ formatWeight(task.quantitativeData.total_spray) }}</span>
                         </div>
                      </div>

                      <div v-if="task.type === 'fertilization'" class="task-details__list">
                         <div class="task-details__item" v-if="task.quantitativeData.type_of_fertilization">
                           <span class="detail-label">نوع السماد:</span>
                           <span class="detail-value">{{ task.quantitativeData.type_of_fertilization }}</span>
                         </div>
                         <div class="task-details__item" v-if="task.quantitativeData.fertilizer_quantity_per_palm_tree && task.quantitativeData.fertilizer_quantity_per_palm_tree !== '0'">
                           <span class="detail-label">كمية السماد للنخلة:</span>
                           <span class="detail-value">{{ formatWeight(task.quantitativeData.fertilizer_quantity_per_palm_tree) }}</span>
                         </div>
                         <div class="task-details__item" v-if="task.quantitativeData.total_fertilization && task.quantitativeData.total_fertilization !== '0'">
                           <span class="detail-label">إجمالي كمية السماد:</span>
                           <span class="detail-value">{{ formatWeight(task.quantitativeData.total_fertilization) }}</span>
                         </div>
                      </div>
                    </div>

                    <p v-if="task.isFuture" class="task-card__future-notice">
                      <BaseIcon name="solar:info-circle-outline" :width="14" />
                      لا يمكن إنجاز المهام المستقبلية قبل موعدها.
                    </p>
                  </div>
                </div>

                <!-- يسار الكارت: الملاحظات (إمكانية التعديل) -->
                <div class="task-card__notes-section">
                  <div class="notes-input-wrapper">
                    <BaseIcon name="solar:pen-outline" class="notes-icon" />
                    <textarea
                      v-model="task.notes"
                      class="notes-input"
                      rows="6"
                      placeholder="أضف ملاحظات الإدارة على هذه المهمة..."
                      @blur="saveTaskNotes(task)"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <div v-if="!palmType.tasks.length" class="no-tasks">
                لا توجد مهام لهذا النوع في هذا اليوم.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BasePageWrapper>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTasksStore } from '@/stores/tasks.store';
import { useReportsStore } from '@/stores/reports.store';
import { mergeReportActivitiesIntoTasks } from '@/helpers/taskMerger.helper';

const route = useRoute();
const router = useRouter();
const tasksStore = useTasksStore();
const reportsStore = useReportsStore();

const dateParam = route.params.date;
const userIdParam = route.query.userId;
const farmIdParam = route.query.farmId;
const palmTypeIdParam = route.query.palmTypeId;

const loading = ref(true);
const mockFarm = ref(null);
const clientName = ref('إدارة المهام');

const fetchTasks = async () => {
  loading.value = true;
  try {
    const response = await tasksStore.fetchRecords({ farm_id: farmIdParam, user_id: userIdParam, per_page: 500 });
    let allTasks = Array.isArray(response) ? response : (response.data || []);
    // We no longer need to fetch reports and merge them here,
    // because the backend now correctly creates these tasks in the tasks table.
    
    // Filter tasks for this specific day
    const dayTasks = allTasks.filter(t => {
      const normalizedDate = t.date ? t.date.split('T')[0] : '';
      t.date = normalizedDate; // Normalize it on the object so UI renders cleanly
      return normalizedDate === dateParam;
    });
    
    if (dayTasks.length > 0) {
      // Assuming tasks have a populated 'farm' relationship
      const firstTask = dayTasks[0];
      mockFarm.value = {
        id: farmIdParam,
        name: firstTask.farm ? firstTask.farm.name : 'بيانات المزرعة',
        palmTypes: []
      };
      
      if (firstTask.farm && firstTask.farm.owner) {
        clientName.value = firstTask.farm.owner.name;
      }
      
      // Group by palm type
      const palmTypesMap = new Map();
      dayTasks.forEach(task => {
        if (palmTypeIdParam && task.palm_type_id && String(task.palm_type_id) !== String(palmTypeIdParam)) {
          return;
        }

        const palmTypeId = task.palm_type_id || 'general';
        const palmTypeName = task.palm_type ? task.palm_type.name : (task.palmType ? task.palmType.name : 'عام');
        
        if (!palmTypesMap.has(palmTypeId)) {
          palmTypesMap.set(palmTypeId, {
            id: palmTypeId,
            name: palmTypeName,
            tasks: []
          });
        }
        
        const isFutureDate = new Date(dateParam) > new Date();
        let qData = {};
        if (task.quantitative_data) {
          try {
            qData = typeof task.quantitative_data === 'string' ? JSON.parse(task.quantitative_data) : task.quantitative_data;
          } catch (e) {
            console.error('Failed to parse quantitative_data', e);
          }
        }
        
        qData.irrigation_amount_per_palm_tree = String(qData.irrigation_amount_per_palm_tree || qData.irrigation_amount_per_palm || qData.irrigation_per_palm || '');
        qData.duration_of_irrigation_per_palm_tree = String(qData.duration_of_irrigation_per_palm_tree || qData.duration_of_irrigation_per_palm || qData.irrigation_duration_per_palm || qData.duration_per_palm || qData.duration_per_palm_tree || '');

        const palmCount = task.palm_type ? Number(task.palm_type.number_of_trees || task.palm_type.count || 0) : (task.palmType ? Number(task.palmType.number_of_trees || task.palmType.count || 0) : 0);
        
        const fertilizerPerTree = Number(qData.fertilizer_quantity_per_palm_tree || qData.fertilizer_quantity_per_palm || 0);
        const calculatedTotalFertilizer = fertilizerPerTree > 0 && palmCount > 0 ? fertilizerPerTree * palmCount : '';
        qData.total_fertilization = String(qData.total_fertilizer || qData.total_fertilizer_quantity || qData.total || qData.fertilizer_total || qData.fertilizer_total_kg || calculatedTotalFertilizer || '');
        
        const sprayPerTree = Number(qData.amount_of_spray || 0);
        const calculatedTotalSpray = sprayPerTree > 0 && palmCount > 0 ? sprayPerTree * palmCount : '';
        qData.total_spray = String(qData.total_amount_of_spray || qData.total_spray || qData.spray_total || calculatedTotalSpray || '');

        const irrigationPerTree = Number(qData.irrigation_amount_per_palm_tree || 0);
        const calculatedTotalIrrigation = irrigationPerTree > 0 && palmCount > 0 ? irrigationPerTree * palmCount : '';
        qData.total_amount_of_irrigation = String(qData.total_amount_of_irrigation || qData.total_irrigation || qData.total_water || qData.total_water_quantity || calculatedTotalIrrigation || '');

        // Remove filtering out tasks based on zero quantities since additional tasks might only have duration or type
        let shouldKeepTask = true;
        if (!shouldKeepTask) return;

        palmTypesMap.get(palmTypeId).tasks.push({
          id: task.id,
          title: task.title,
          type: task.task_type,
          isCompleted: task.is_completed,
          notes: task.notes || '',
          isFuture: isFutureDate,
          quantitativeData: qData,
          _raw: task // Keep original task if needed
        });
      });
      
      mockFarm.value.palmTypes = Array.from(palmTypesMap.values());
    } else {
      mockFarm.value = null;
    }
  } catch (error) {
    console.error("Error fetching tasks for day:", error);
    mockFarm.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (farmIdParam && dateParam) {
    fetchTasks();
  } else {
    loading.value = false;
  }
});

// Re-fetch whenever the user navigates back to this page (e.g., after editing a report)
onActivated(() => {
  if (farmIdParam && dateParam) {
    fetchTasks();
  }
});

const formattedDate = computed(() => {
  if (!dateParam) return '';
  return new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateParam));
});

const formattedDateFull = computed(() => {
  if (!dateParam) return '';
  return new Intl.DateTimeFormat('ar-SA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateParam));
});

const goBack = () => {
  router.push({ 
    name: 'admin_tasks_calendar',
    query: {
      userId: userIdParam,
      farmId: farmIdParam,
      palmTypeId: route.query.palmTypeId
    }
  });
};

const toggleTaskCompletion = async (task) => {
  if (task.isFuture) return;
  const newValue = !task.isCompleted;
  
  // Optimistic UI update
  task.isCompleted = newValue;
  
  try {
    await tasksStore.updateRecord(task.id, { is_completed: newValue });
  } catch (error) {
    console.error("Error updating task status:", error);
    task.isCompleted = !newValue; // Revert on failure
  }
};

const saveTaskNotes = async (task) => {
  if (task.isFuture) return;
  try {
    await tasksStore.updateRecord(task.id, { notes: task.notes });
  } catch (error) {
    console.error("Error updating task notes:", error);
  }
};

const getTaskIcon = (type) => {
  const icons = {
    irrigation: 'solar:waterdrops-outline',
    fertilization: 'solar:leaf-outline',
    spraying: 'solar:bug-outline',
    other: 'solar:checklist-minimalistic-outline'
  };
  return icons[type] || icons.other;
};

const getTaskTypeName = (type) => {
  const names = {
    irrigation: 'ري',
    fertilization: 'تسميد',
    spraying: 'رش',
    other: 'أخرى'
  };
  return names[type] || 'مهمة';
};

const formatWeight = (valueInGrams) => {
  const num = Number(valueInGrams) || 0;
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + ' كجم';
  }
  return num + ' جرام';
};
</script>

<style lang="scss" scoped>
.task-day-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.back-action {
  margin-bottom: 10px;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: white;
  border-radius: 20px;
  text-align: center;
  color: var(--gray-500);
  font-size: 1.4rem;
}

.empty-icon {
  font-size: 4rem;
  color: var(--gray-300);
  margin-bottom: 16px;
}

.day-hero {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(255, 255, 255, 1)), var(--white);
  border: 1px solid var(--emerald-100);
  border-radius: 24px;
  padding: 24px 32px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.04);
  
  &__main {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .client-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--emerald-50);
    color: var(--emerald-700);
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 4px;
    width: fit-content;
  }
  
  &__farm-name {
    font-size: 2rem;
    font-weight: 800;
    color: var(--gray-900);
  }
  
  &__date {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.3rem;
    color: var(--gray-600);
    font-weight: 600;
  }
}

.palm-sections {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.palm-section {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px dashed var(--gray-200);
    padding-bottom: 16px;
  }

  &__title-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__icon {
    font-size: 2rem;
    color: var(--emerald-500);
  }

  &__title {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--gray-800);
  }

  &__badge {
    padding: 6px 16px;
    background: var(--gray-100);
    color: var(--gray-600);
    border-radius: 999px;
    font-size: 1.1rem;
    font-weight: 700;
  }
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.no-tasks {
  padding: 20px;
  background: var(--gray-50);
  border-radius: 16px;
  color: var(--gray-500);
  text-align: center;
  font-size: 1.2rem;
}

.task-card {
  display: flex;
  flex-direction: column;
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0,0,0,0.03);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 15px 30px rgba(0,0,0,0.06);
    transform: translateY(-3px);
  }

  &--completed {
    background: linear-gradient(to right, rgba(16, 185, 129, 0.03), transparent);
    border-color: rgba(16, 185, 129, 0.2);
    
    .task-card__title {
      text-decoration: line-through;
      color: var(--gray-400);
    }
  }

  &--future {
    opacity: 0.8;
    background: var(--gray-50);
  }

  &__main {
    display: flex;
    padding: 24px;
    gap: 20px;
    border-bottom: 1px solid var(--gray-100);
  }

  &__checkbox-wrap {
    padding-top: 4px;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  &__title {
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--gray-900);
    margin: 0;
  }

  &__future-notice {
    font-size: 1.1rem;
    color: var(--amber-600);
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
  }

  &__notes-section {
    padding: 16px 24px;
    background: var(--gray-50);
  }
}

.task-checkbox {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 2px solid var(--gray-300);
  background: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  font-size: 1.5rem;

  &:hover:not(&--disabled) {
    border-color: var(--emerald-400);
    background: var(--emerald-50);
  }

  &--checked {
    background: var(--emerald-500);
    border-color: var(--emerald-500);
    box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
  }

  &--disabled {
    cursor: not-allowed;
    background: var(--gray-200);
    border-color: var(--gray-200);
    color: var(--gray-400);
  }

  &__empty {
    width: 100%;
    height: 100%;
  }
}

.task-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 700;

  &--irrigation { background: var(--blue-50); color: var(--blue-600); }
  &--fertilization { background: var(--emerald-50); color: var(--emerald-600); }
  &--spraying { background: var(--rose-50); color: var(--rose-600); }
  &--other { background: var(--violet-100); color: var(--violet-700); }
}

.task-details {
  margin-top: 14px;
  background: var(--gray-50);
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid var(--gray-100);
}

.task-details__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-details__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.25rem;
}

.detail-label {
  color: var(--gray-500);
  font-weight: 700;
}

.detail-value {
  color: var(--gray-900);
  font-weight: 800;
}

.notes-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;

  .notes-icon {
    font-size: 1.2rem;
    color: var(--gray-500);
  }
}

.notes-input {
  width: 100%;
  flex: 1;
  min-height: 140px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 16px;
  font-size: 1.35rem;
  color: var(--gray-800);
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s;
  line-height: 1.6;

  &:focus {
    outline: none;
    border-color: var(--blue-400);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: var(--gray-400);
  }
}
</style>
