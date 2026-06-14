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
        <div class="error-icon">⚠️</div>
        <h3>لم يتم العثور على بيانات</h3>
        <p>الرجاء العودة لشاشة المهام واختيار نوع النخل من جديد.</p>
        <button class="back-btn" @click="$router.push('/tasks')">العودة للمهام</button>
      </div>

      <div v-else class="details-container">
        <!-- HERO -->
        <div class="details-hero">
          <div class="details-hero__content">
            <button class="back-link" @click="$router.push('/tasks')">← العودة للمهام</button>
            <div class="badge">مهام نوع النخل</div>
            <h1>{{ taskData.palmTypeName }}</h1>
            <p>مزرعة: <strong>{{ taskData.farmName }}</strong></p>
          </div>
          <div class="details-hero__icon">🌴</div>
        </div>

        <div class="tasks-grid">
          <div v-if="taskData.tasks.length === 0" class="task-card__empty">
            مفيش مهام لنوع النخل ده.
          </div>
          <div 
            v-for="(task, index) in taskData.tasks" 
            :key="index"
            class="task-card"
            :class="`task-card--${task.type}`"
          >
            <div class="task-card__header">
              <div class="task-card__title">
                <span class="icon">{{ task.icon }}</span>
                <div>
                  <h3>{{ task.title }}</h3>
                  <p>{{ task.description }}</p>
                </div>
              </div>
            </div>

            <div v-if="task.details && task.details.length" class="task-card__body">
              <div v-for="(detail, dIndex) in task.details" :key="dIndex" class="detail-item">
                <span class="label">{{ detail.label }}</span>
                <strong class="value">{{ detail.value }}</strong>
              </div>
            </div>
            <div v-else class="task-card__empty">
              المهمة مسجلة للتنفيذ بكرة، لكن لا توجد كميات واضحة محفوظة في بيانات التقرير.
            </div>
          </div>
        </div>
      </div>
    </section>
  </BasePageWrapper>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const taskData = ref(null);

onMounted(() => {
  const data = localStorage.getItem('admin_task_details');
  if (data) {
    try {
      taskData.value = JSON.parse(data);
    } catch (e) {
      console.error("Error parsing task data", e);
    }
  }
});
</script>

<style lang="scss" scoped>
.task-details-page {
  direction: rtl;
  animation: fadeIn 0.4s ease-out;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.02);
  
  .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  h3 { margin: 0 0 8px; color: #0f172a; font-size: 22px; font-weight: 900; }
  p { color: #64748b; margin-bottom: 24px; font-weight: 600; }
  
  .back-btn {
    background: #0ea5e9;
    color: #fff;
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover { background: #0284c7; transform: translateY(-2px); }
  }
}

.details-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.details-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px;
  border-radius: 24px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #fff;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);

  .back-link {
    background: transparent;
    border: none;
    color: #cbd5e1;
    font-size: 15px;
    font-weight: 800;
    margin-bottom: 20px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    padding: 0;
    transition: color 0.2s;
    &:hover { color: #fff; }
  }

  .badge {
    display: inline-block;
    background: rgba(255,255,255,0.1);
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 800;
    margin-bottom: 16px;
    backdrop-filter: blur(10px);
  }

  h1 { margin: 0 0 8px; font-size: 38px; font-weight: 900; }
  p { margin: 0; color: #cbd5e1; font-size: 20px; font-weight: 500; }

  .details-hero__icon {
    font-size: 110px;
    opacity: 0.8;
    transform: rotate(10deg) translateY(10px);
    text-shadow: 0 20px 40px rgba(0,0,0,0.2);
  }
}

.tasks-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.task-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04);
  transition: all 0.3s ease;

  &--irrigation { border-top: 5px solid #0ea5e9; }
  &--fertilizer { border-top: 5px solid #22c55e; }
  &--spray { border-top: 5px solid #f59e0b; }

  &:hover {
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
    transform: translateY(-4px);
  }
}

.task-card__header {
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafaf9;

  .task-card__title {
    display: flex;
    align-items: center;
    gap: 16px;

    .icon {
      font-size: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    h3 { margin: 0 0 6px; font-size: 22px; color: #0f172a; font-weight: 900; }
    p { margin: 0; color: #64748b; font-size: 16px; font-weight: 600; }
  }
}

.task-card__body {
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;

  .label { font-size: 14px; color: #64748b; font-weight: 800; }
  .value { font-size: 18px; color: #0f172a; font-weight: 900; }
}

.task-card__empty {
  padding: 32px;
  text-align: center;
  color: #64748b;
  font-size: 16px;
  font-weight: 700;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px dashed #cbd5e1;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 760px) {
  .details-hero {
    flex-direction: column;
    align-items: flex-start;
    padding: 30px;
    
    .details-hero__icon {
      position: absolute;
      left: -20px;
      bottom: -30px;
      opacity: 0.15;
      font-size: 150px;
    }
  }
  
  .task-card__body {
    grid-template-columns: 1fr;
  }
}
</style>
