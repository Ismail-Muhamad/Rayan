<template>
  <BasePageWrapper
    titleKey="تفاصيل المهام"
    subtitleKey="Task details"
    iconName="solar:document-text-outline"
    :showBackButton="true"
    @back="$router.push('/tasks')"
  >
    <section class="task-details-page">
      <div v-if="!taskData" class="error-state">
        <BaseIcon name="solar:danger-triangle-outline" :width="48" :height="48" class="error-icon" />
        <h3>لم يتم العثور على بيانات</h3>
        <p>الرجاء العودة لشاشة المهام واختيار نوع النخل من جديد.</p>
        <button class="back-btn" @click="$router.push('/tasks')">العودة للمهام</button>
      </div>

      <div v-else class="details-container">
        <!-- HERO -->
        <div class="details-hero">
          <div class="details-hero__content">
            <button class="back-link" @click="$router.push('/tasks')">
              <BaseIcon name="solar:alt-arrow-right-outline" /> العودة للمهام
            </button>
            <div class="badge">
              <BaseIcon name="solar:leaf-outline" :width="18" :height="18" />
              مهام نوع النخل
            </div>
            <h1>{{ taskData.palmTypeName }}</h1>
            <p>مزرعة: <strong>{{ taskData.farmName }}</strong></p>
          </div>
          <div class="details-hero__icon">
            <BaseIcon name="mdi:palm-tree" :width="180" :height="180" />
          </div>
        </div>

        <div v-if="taskData.tasks.length === 0" class="task-card__empty">
          <BaseIcon name="solar:inbox-line-outline" :width="56" :height="56" />
          <p>مفيش مهام لنوع النخل ده.</p>
        </div>

        <div v-else class="tasks-sections">
          <!-- IRRIGATION -->
          <section v-if="irrigationTask" class="task-section task-section--irrigation">
            <header class="section-header clickable-header" @click="isIrrigationExpanded = !isIrrigationExpanded">
              <div class="header-main">
                <div class="section-icon">
                  <BaseIcon name="mdi:water" :width="32" :height="32" />
                </div>
                <div>
                  <h2>مهمة الري</h2>
                  <p>{{ irrigationTask.description || 'تفاصيل عملية الري المجدولة' }}</p>
                </div>
              </div>
              <div class="chevron" :class="{'is-expanded': isIrrigationExpanded}">
                <BaseIcon name="solar:alt-arrow-down-outline" :width="24" :height="24" />
              </div>
            </header>

            <div v-show="isIrrigationExpanded">
              <div v-if="irrigationTask.details?.length" class="details-grid">
                <div v-for="(detail, dIndex) in irrigationTask.details" :key="dIndex" class="detail-item">
                  <span class="label">{{ detail.label }}</span>
                  <strong class="value">{{ detail.value }}</strong>
                </div>
              </div>
              <div v-else class="detail-empty">
                المهمة مسجلة للتنفيذ بكرة، لكن لا توجد كميات واضحة.
              </div>
            </div>
          </section>

          <!-- SPRAY -->
          <section v-if="sprayTask" class="task-section task-section--spray">
            <header class="section-header clickable-header" @click="isSprayExpanded = !isSprayExpanded">
              <div class="header-main">
                <div class="section-icon">
                  <BaseIcon name="mdi:spray" :width="32" :height="32" />
                </div>
                <div>
                  <h2>مهمة الرش</h2>
                  <p>{{ sprayTask.description || 'تفاصيل المبيدات وعملية الرش' }}</p>
                </div>
              </div>
              <div class="chevron" :class="{'is-expanded': isSprayExpanded}">
                <BaseIcon name="solar:alt-arrow-down-outline" :width="24" :height="24" />
              </div>
            </header>

            <div v-show="isSprayExpanded">
              <div v-if="sprayTask.details?.length" class="details-grid">
                <div v-for="(detail, dIndex) in sprayTask.details" :key="dIndex" class="detail-item">
                  <span class="label">{{ detail.label }}</span>
                  <strong class="value">{{ detail.value }}</strong>
                </div>
              </div>
              <div v-else class="detail-empty">
                المهمة مسجلة للتنفيذ بكرة، لكن لا توجد كميات واضحة.
              </div>
            </div>
          </section>

          <!-- FERTILIZERS -->
          <section v-if="fertilizerTasks.length" class="task-section task-section--fertilizer">
            <header class="section-header">
              <div class="header-main">
                <div class="section-icon">
                  <BaseIcon name="mdi:leaf" :width="32" :height="32" />
                </div>
                <div>
                  <h2>مهام التسميد</h2>
                  <p>قائمة الأسمدة المطلوبة مع الكميات</p>
                </div>
              </div>
            </header>

            <div class="fertilizer-grid">
              <article 
                v-for="(task, index) in fertilizerTasks" 
                :key="index"
                class="fertilizer-card"
              >
                <div class="fertilizer-card__top clickable-card" @click="toggleFertilizer(index)">
                  <div class="f-top-left">
                    <div class="f-icon">
                      <BaseIcon name="mdi:sack" :width="24" :height="24" />
                    </div>
                    <h3>{{ task.title }}</h3>
                  </div>
                  <div class="f-chevron" :class="{'is-expanded': expandedFertilizers.includes(index)}">
                    <BaseIcon name="solar:alt-arrow-down-outline" :width="20" :height="20" />
                  </div>
                </div>
                
                <div v-show="expandedFertilizers.includes(index)">
                  <div v-if="task.details?.length" class="fertilizer-card__body">
                    <div v-for="(detail, dIndex) in task.details" :key="dIndex" class="f-detail">
                      <span class="f-label">{{ detail.label }}</span>
                      <strong class="f-value">{{ detail.value }}</strong>
                    </div>
                  </div>
                  <div v-else class="f-empty">
                    لا توجد كميات مسجلة
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </section>
  </BasePageWrapper>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const taskData = ref(null);

const isIrrigationExpanded = ref(true);
const isSprayExpanded = ref(true);
const expandedFertilizers = ref([]);

const toggleFertilizer = (index) => {
  if (expandedFertilizers.value.includes(index)) {
    expandedFertilizers.value = expandedFertilizers.value.filter(i => i !== index);
  } else {
    expandedFertilizers.value.push(index);
  }
};

onMounted(() => {
  const data = localStorage.getItem('admin_task_details');
  if (data) {
    try {
      taskData.value = JSON.parse(data);
      const fertilizers = taskData.value.tasks.filter(t => t.type === 'fertilizer');
      expandedFertilizers.value = fertilizers.map((_, idx) => idx);
    } catch (e) {
      console.error("Error parsing task data", e);
    }
  }
});

const irrigationTask = computed(() => {
  if (!taskData.value) return null;
  return taskData.value.tasks.find(t => t.type === 'irrigation');
});

const sprayTask = computed(() => {
  if (!taskData.value) return null;
  return taskData.value.tasks.find(t => t.type === 'spray');
});

const fertilizerTasks = computed(() => {
  if (!taskData.value) return [];
  return taskData.value.tasks.filter(t => t.type === 'fertilizer');
});
</script>

<style lang="scss" scoped>
.task-details-page {
  animation: fadeIn 0.4s ease-out;
  direction: rtl;
}

.details-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* HERO */
.details-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 48px;
  border-radius: 32px;
  background: linear-gradient(135deg, var(--gray-900) 0%, var(--gray-800) 100%);
  color: white;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.15);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top right, rgba(255,255,255,0.08), transparent 60%);
  }

  &__content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .back-link {
    background: transparent;
    border: none;
    color: var(--gray-400);
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 24px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0;
    transition: color 0.2s;
    &:hover { color: white; }
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.1);
    padding: 8px 16px;
    border-radius: 99px;
    font-size: 1.3rem;
    font-weight: 800;
    margin-bottom: 16px;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  h1 { 
    margin: 0 0 12px; 
    font-size: clamp(2.8rem, 4vw, 4.2rem); 
    font-weight: 900; 
    line-height: 1.2; 
  }
  
  p { 
    margin: 0; 
    color: var(--gray-300); 
    font-size: 1.8rem; 
    font-weight: 500; 
    strong { color: white; }
  }

  .details-hero__icon {
    position: absolute;
    left: -20px;
    bottom: -40px;
    z-index: 1;
    color: var(--gray-700);
    opacity: 0.2;
    transform: rotate(15deg);
    pointer-events: none;
  }
}

/* TASKS SECTIONS */
.tasks-sections {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.task-section {
  background: white;
  border-radius: 32px;
  padding: 32px;
  border: 1px solid var(--gray-200);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.03);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 20px 48px rgba(15, 23, 42, 0.06);
    transform: translateY(-2px);
  }

  &--irrigation {
    .section-icon { background: var(--blue-50); color: var(--blue-600); }
    .detail-item { background: var(--blue-50); border-color: var(--blue-100); }
    .detail-item .value { color: var(--blue-700); }
  }

  &--spray {
    .section-icon { background: var(--amber-50); color: var(--amber-600); }
    .detail-item { background: var(--amber-50); border-color: var(--amber-100); }
    .detail-item .value { color: var(--amber-700); }
  }

  &--fertilizer {
    background: transparent;
    border: none;
    box-shadow: none;
    padding: 0;
    
    &:hover { transform: none; box-shadow: none; }
    
    .section-header { margin-bottom: 24px; padding: 0 16px; cursor: default; justify-content: flex-start; }
    .section-icon { background: var(--emerald-50); color: var(--emerald-600); }
  }
}

.clickable-header {
  cursor: pointer;
  user-select: none;
  justify-content: space-between;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 20px;
}

.chevron, .f-chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--gray-100);
  color: var(--gray-600);
  transition: transform 0.3s ease;
  flex-shrink: 0;

  &.is-expanded {
    transform: rotate(180deg);
  }
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 32px;

  .section-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border-radius: 20px;
  }

  h2 { margin: 0 0 6px; font-size: 2.2rem; font-weight: 800; color: var(--gray-900); }
  p { margin: 0; font-size: 1.5rem; color: var(--gray-500); font-weight: 600; }
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid transparent;

  .label { font-size: 1.4rem; color: var(--gray-600); font-weight: 700; }
  .value { font-size: 2rem; font-weight: 900; }
}

.detail-empty {
  padding: 24px;
  text-align: center;
  color: var(--gray-500);
  font-size: 1.5rem;
  font-weight: 600;
  background: var(--gray-50);
  border-radius: 16px;
  border: 1px dashed var(--gray-300);
}

/* FERTILIZER GRID */
.fertilizer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.fertilizer-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid var(--gray-200);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.03);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 20px 48px rgba(16, 185, 129, 0.08);
    transform: translateY(-4px);
    border-color: var(--emerald-200);
  }

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    gap: 16px;

    &.clickable-card {
      cursor: pointer;
      user-select: none;
      margin-bottom: 0; // margin is handled in body now
      padding-bottom: 4px;
    }

    .f-top-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    h3 { margin: 0; font-size: 1.8rem; font-weight: 800; color: var(--gray-900); line-height: 1.4; }
    
    .f-icon { 
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--emerald-600); 
      background: var(--emerald-50); 
      border-radius: 14px; 
      width: 48px; 
      height: 48px; 
      flex-shrink: 0;
    }
    
    .f-chevron {
      background: var(--emerald-50);
      color: var(--emerald-600);
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 20px;
  }
}

.f-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: var(--gray-50);
  border-radius: 14px;
  
  .f-label { font-size: 1.3rem; font-weight: 700; color: var(--gray-600); }
  .f-value { font-size: 1.5rem; font-weight: 800; color: var(--emerald-700); }
}

.f-empty {
  margin-top: 20px;
  padding: 16px;
  text-align: center;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--gray-500);
  background: var(--gray-50);
  border-radius: 14px;
  border: 1px dashed var(--gray-300);
}

/* EMPTY STATE FOR ALL TASKS */
.task-card__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 20px;
  text-align: center;
  color: var(--gray-500);
  background: white;
  border-radius: 32px;
  border: 1px dashed var(--gray-300);
  gap: 16px;

  p { margin: 0; font-size: 1.8rem; font-weight: 700; }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: white;
  border-radius: 32px;
  text-align: center;
  
  .error-icon {
    color: var(--red-500);
    margin-bottom: 24px;
  }
  
  h3 { margin: 0 0 12px; color: var(--gray-900); font-size: 2.4rem; font-weight: 900; }
  p { color: var(--gray-500); margin-bottom: 32px; font-weight: 600; font-size: 1.6rem; }
  
  .back-btn {
    background: var(--blue-600);
    color: white;
    border: none;
    padding: 14px 28px;
    border-radius: 16px;
    font-size: 1.6rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover { background: var(--blue-700); transform: translateY(-2px); }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .details-hero {
    padding: 32px 24px;
    border-radius: 24px;
    
    .details-hero__icon {
      position: absolute;
      left: -20px;
      bottom: -30px;
      opacity: 0.15;
      font-size: 150px;
    }
  }
  
  .task-section {
    padding: 24px;
    border-radius: 24px;
  }
}
</style>
