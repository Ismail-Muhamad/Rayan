<template>
  <BasePageWrapper :titleKey="'تفاصيل مهام اليوم'" :subtitleKey="formattedDate" iconName="solar:calendar-date-outline">
    <div class="task-day-page">
      
      <!-- رسالة توضيحية لصاحب المزرعة -->
      <div class="info-alert info-alert--readonly">
        <BaseIcon name="solar:eye-bold" class="info-alert__icon" />
        <div class="info-alert__content">
          <h4>وضع المتابعة (قراءة فقط)</h4>
          <p>أنت الآن تتصفح مهامك بصلاحية القراءة فقط. التعديل متاح للإدارة الفنية.</p>
        </div>
      </div>

      <!-- زر الرجوع -->
      <div class="back-action">
        <BaseButton variant="soft" color="gray" size="sm" @click="goBack">
          <BaseIcon name="solar:arrow-right-outline" />
          رجوع لتقويم المهام
        </BaseButton>
      </div>

      <div v-if="loading" class="loading-state">
        جاري تحميل المهام...
      </div>
      
      <div v-else-if="!currentFarm" class="empty-state">
        <BaseIcon name="solar:database-outline" class="empty-icon" />
        <h3>لم يتم العثور على مهام لهذا اليوم في المزرعة المحددة</h3>
      </div>

      <div v-else class="day-content">
        <!-- معلومات المزرعة واليوم -->
        <section class="day-hero">
          <div class="day-hero__main">
            <h2 class="day-hero__farm-name">{{ currentFarm.name }}</h2>
            <p class="day-hero__date">
              <BaseIcon name="solar:calendar-mark-outline" />
              {{ formattedDateFull }}
            </p>
          </div>
        </section>

        <!-- عمليات يومية -->
        <section class="daily-operations-section" v-if="dailyOperations.length > 0 && dailyOperations[0] !== ''">
          <div class="section-header">
            <div class="section-header__title">
              <BaseIcon name="solar:clipboard-list-outline" class="section-icon" />
              <h3 class="section-title">عمليات يومية عامة</h3>
            </div>
          </div>
          
          <div class="operations-container">
            <div 
              v-for="(op, index) in dailyOperations" 
              :key="index" 
              class="operation-row readonly"
            >
              <div class="operation-input-group readonly">
                <span class="operation-number">{{ index + 1 }}</span>
                <span class="operation-text">{{ op }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- المهام مقسمة حسب نوع النخل -->
        <div class="palm-sections">
          <div v-for="palmType in currentFarm.palmTypes" :key="palmType.id" class="palm-section">
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
                    <div
                      class="task-checkbox task-checkbox--readonly"
                      :class="{
                        'task-checkbox--checked': task.isCompleted,
                        'task-checkbox--future': task.isFuture
                      }"
                    >
                      <BaseIcon v-if="task.isCompleted" name="solar:check-read-outline" />
                      <BaseIcon v-else-if="task.isFuture" name="solar:lock-outline" />
                      <div v-else class="task-checkbox__empty"></div>
                    </div>
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

                <!-- يسار الكارت: الملاحظات (للقراءة فقط) -->
                <div class="task-card__notes-section">
                  <div class="notes-readonly-wrapper">
                    <div class="notes-header">
                      <BaseIcon name="solar:document-text-outline" class="notes-icon" />
                      <span>ملاحظات الإدارة:</span>
                    </div>
                    <div class="notes-readonly-box">
                      <p v-if="task.notes">{{ task.notes }}</p>
                      <p v-else class="no-notes">لا توجد ملاحظات مسجلة على هذه المهمة حتى الآن.</p>
                    </div>
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
import { ref, computed, onMounted, onActivated } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTasksStore } from '@/stores/tasks.store';
import { useReportsStore } from '@/stores/reports.store';
import { useDailyOperationsStore } from '@/stores/dailyOperations.store';

const route = useRoute();
const router = useRouter();
const tasksStore = useTasksStore();
const reportsStore = useReportsStore();
const dailyOperationsStore = useDailyOperationsStore();

const dateParam = route.params.date;
const farmIdParam = route.query.farmId;
const palmTypeIdParam = route.query.palmTypeId;

const loading = ref(true);
const currentFarm = ref(null);
const dailyOperations = ref([]);

const loadDailyOperations = async () => {
  if (!farmIdParam) return;
  const operation = await dailyOperationsStore.fetchOperation({
    farm_id: farmIdParam,
    level: 'day',
    operation_key: dateParam
  });
  if (operation && operation.content) {
    dailyOperations.value = operation.content.split('\n').filter(op => op.trim() !== '');
  } else {
    dailyOperations.value = [];
  }
};

const fetchTasks = async () => {
  loading.value = true;
  try {
    const response = await tasksStore.fetchRecords({ farm_id: farmIdParam, per_page: 500 });
    let allTasks = Array.isArray(response) ? response : (response.data || []);
    
    // We no longer need to fetch reports and merge them here,
    // because the backend now correctly creates these tasks in the tasks table.
    
    const dayTasks = allTasks.filter(t => {
      const normalizedDate = t.date ? t.date.split('T')[0] : '';
      t.date = normalizedDate; // Normalize it on the object so UI renders cleanly
      return normalizedDate === dateParam;
    });
    
    if (dayTasks.length > 0) {
      const firstTask = dayTasks[0];
      currentFarm.value = {
        id: farmIdParam,
        name: firstTask.farm ? firstTask.farm.name : 'بيانات المزرعة',
        palmTypes: []
      };
      
      const palmTypesMap = new Map();
      dayTasks.forEach(task => {
        // If palmTypeIdParam is provided, only show tasks for that specific palm type or general tasks
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
        
        // Strip time from dateParam to safely compare
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
          _raw: task
        });
      });
      
      currentFarm.value.palmTypes = Array.from(palmTypesMap.values());
      await loadDailyOperations();
    } else {
      currentFarm.value = null;
    }
  } catch (error) {
    console.error("Error fetching tasks for day:", error);
    currentFarm.value = null;
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
    name: 'farm_tasks',
    query: {
      farmId: farmIdParam,
      palmTypeId: palmTypeIdParam
    }
  });
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

.info-alert {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);

  &--readonly {
    background: linear-gradient(135deg, var(--orange-50), white);
    border: 1px solid var(--orange-200);
    border-right: 4px solid var(--orange-500);

    .info-alert__icon {
      color: var(--orange-500);
    }
    
    h4 {
      color: var(--orange-900);
    }
    
    p {
      color: var(--orange-700);
    }
  }

  &__icon {
    font-size: 2.2rem;
    margin-top: 2px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 6px;

    h4 {
      font-size: 1.2rem;
      font-weight: 800;
      margin: 0;
    }

    p {
      font-size: 1.1rem;
      margin: 0;
      line-height: 1.5;
    }
  }
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

/* Daily Operations */
.daily-operations-section {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.02);

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 2px dashed var(--gray-100);
    padding-bottom: 16px;

    &__title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .section-icon {
      font-size: 2.2rem;
      color: var(--blue-500);
    }

    .section-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--gray-800);
      margin: 0;
    }
  }
}

.operations-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.operation-row {
  display: flex;
  align-items: center;
}

.operation-input-group.readonly {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 16px;
  padding: 12px 20px;

  .operation-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    background: var(--blue-100);
    color: var(--blue-700);
    border-radius: 10px;
    font-size: 1.3rem;
    font-weight: 800;
  }

  .operation-text {
    flex: 1;
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--gray-900);
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

.task-card {
  display: flex;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);

  @media (max-width: 768px) {
    flex-direction: column;
  }

  &:hover {
    box-shadow: 0 12px 30px rgba(0,0,0,0.06);
    border-color: var(--gray-300);
  }

  &--completed {
    background: var(--emerald-50);
    border-color: var(--emerald-200);
    
    .task-card__title {
      color: var(--emerald-900);
      text-decoration: line-through;
      opacity: 0.8;
    }
    .task-card__main {
      border-left-color: var(--emerald-200);
    }
  }

  &--future {
    opacity: 0.7;
    background: var(--gray-50);
  }

  &__main {
    flex: 1;
    display: flex;
    padding: 20px;
    gap: 16px;
    border-left: 1px dashed var(--gray-200);

    @media (max-width: 768px) {
      border-left: none;
      border-bottom: 1px dashed var(--gray-200);
    }
  }

  &__checkbox-wrap {
    padding-top: 4px;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__title {
    font-size: 1.3rem;
    font-weight: 800;
    color: var(--gray-900);
    margin: 0;
    line-height: 1.4;
  }

  &__future-notice {
    font-size: 1rem;
    color: var(--gray-500);
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
  }

  &__notes-section {
    width: 280px;
    background: var(--gray-50);
    padding: 20px;
    display: flex;
    flex-direction: column;

    @media (max-width: 768px) {
      width: 100%;
    }
  }
}

.task-checkbox {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 2px solid var(--gray-300);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;

  &--readonly {
    cursor: default;
    background: var(--gray-50);
  }

  &--checked {
    background: var(--emerald-500);
    border-color: var(--emerald-500);
  }

  &--future {
    background: var(--gray-100);
    color: var(--gray-400);
    border-color: var(--gray-200);
  }
}

.task-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;

  &--irrigation { background: var(--blue-100); color: var(--blue-700); }
  &--fertilization { background: var(--emerald-100); color: var(--emerald-700); }
  &--spraying { background: var(--rose-100); color: var(--rose-700); }
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

.notes-readonly-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.notes-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gray-700);
  font-weight: 800;
  font-size: 1.25rem;

  .notes-icon {
    font-size: 1.6rem;
    color: var(--gray-600);
  }
}

.notes-readonly-box {
  width: 100%;
  flex: 1;
  min-height: 140px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 18px;
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--gray-800);
  line-height: 1.8;
  overflow-y: auto;
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.02);

  p {
    margin: 0;
  }

  .no-notes {
    color: var(--gray-400);
    font-style: italic;
    text-align: center;
    margin-top: 20px;
  }
}

.no-tasks {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: var(--gray-500);
  background: var(--gray-50);
  border-radius: 16px;
  font-size: 1.2rem;
  border: 1px dashed var(--gray-300);
}
</style>
