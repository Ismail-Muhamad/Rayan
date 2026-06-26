<template>
  <BasePageWrapper titleKey="المهام المزرعية" subtitleKey="تصفح وتحديث مهام مزارعك بشكل شهري وأسبوعي" iconName="solar:calendar-search-outline">
    <div class="calendar-tasks">
      
      <div v-if="loading" class="loading-state">
        جاري تحميل المزارع والمهام...
      </div>

      <div v-else-if="farms.length === 0" class="empty-state">
        <BaseIcon name="solar:ghost-smile-outline" class="empty-icon" />
        <h3>لا توجد مزارع مسجلة بحسابك حالياً</h3>
      </div>

      <div v-else class="selected-state">
        <!-- فلاتر المزارع -->
        <div class="tasks__farm-filters">
          <button
            v-for="farm in farms"
            :key="farm.id"
            class="farm-filter-btn"
            :class="{ 'farm-filter-btn--active': selectedFarmId === farm.id }"
            @click="selectedFarmId = farm.id"
          >
            <div class="farm-filter-btn__icon">
              <BaseIcon name="mdi:palm-tree" />
            </div>
            <div class="farm-filter-btn__info">
              <span class="farm-filter-btn__name">{{ farm.name }}</span>
              <span class="farm-filter-btn__meta">{{ farm.location }}</span>
            </div>
          </button>
        </div>

        <!-- فلاتر أنواع النخيل داخل المزرعة -->
        <transition name="fade">
          <div v-if="selectedFarm && selectedFarm.palm_types && selectedFarm.palm_types.length > 0" class="tasks__palm-filters">
            <div class="palm-filters-group">
              <button
                v-for="palmType in selectedFarm.palm_types"
                :key="palmType.id"
                class="palm-filter-btn"
                :class="{ 'palm-filter-btn--active': selectedPalmTypeId === palmType.id }"
                @click="selectedPalmTypeId = palmType.id"
              >
                <div class="palm-filter-btn__icon">🌴</div>
                <div class="palm-filter-btn__name">نخيل {{ palmType.name }}</div>
              </button>
            </div>

            <div class="year-filter">
              <BaseIcon name="solar:calendar-date-bold-duotone" class="year-icon" />
              <select v-model="selectedYear" class="year-select">
                <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
              </select>
              <BaseIcon name="solar:alt-arrow-down-outline" class="dropdown-icon" />
            </div>
          </div>
          <div v-else-if="selectedFarm" class="tasks__palm-filters">
             <span class="no-palms-msg">لا توجد أنواع نخيل مسجلة في هذه المزرعة</span>
          </div>
        </transition>

        <!-- عرض التقويم لنوع النخيل المحدد -->
        <transition name="fade" mode="out-in">
          <div v-if="selectedPalmTypeId" :key="selectedPalmTypeId" class="calendar-content">
            
            <div v-for="month in activeCalendar" :key="month.monthStr" class="month-block" :class="{ 'month-block--open': month.isOpen }">
              
              <div class="month-header" @click="toggleMonth(month)">
                <div class="month-header__info">
                  <BaseIcon name="solar:calendar-mark-bold-duotone" class="month-header__icon" />
                  <h3 class="month-header__title">{{ month.monthName }}</h3>
                </div>
                <div class="month-header__actions">
                  <span class="tasks-count-badge">{{ getMonthTasksCount(month) }} مهام</span>
                  <div class="toggle-circle">
                    <BaseIcon name="solar:alt-arrow-down-outline" class="toggle-icon" />
                  </div>
                </div>
              </div>

              <div v-if="month.isOpen" class="month-body">
                <!-- عمليات الشهر -->
                <div v-if="month.operationsLoading" class="operations-loading">
                  جاري تحميل عمليات الشهر...
                </div>
                <div v-else-if="month.operations && month.operations.length > 0" class="level-operations-section is-readonly">
                  <div class="section-header">
                    <div class="section-header__title">
                      <BaseIcon name="solar:clipboard-list-bold-duotone" class="section-icon" />
                      <h3 class="section-title">عمليات الشهر العامة</h3>
                    </div>
                  </div>
                  <div class="operations-container">
                    <div v-for="(op, opIdx) in month.operations" :key="opIdx" class="operation-row readonly">
                      <div class="operation-input-group readonly">
                        <span class="operation-number">{{ opIdx + 1 }}</span>
                        <span class="operation-text">{{ op }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-for="(week, index) in month.weeks" :key="index" class="week-block" :class="{ 'week-block--open': week.isOpen }">
                  <div class="week-header" @click="toggleWeek(month, week)">
                    <div class="week-header__info">
                      <div class="week-dot"></div>
                      <h4 class="week-header__title">{{ week.weekName }}</h4>
                    </div>
                    <div class="week-header__actions">
                      <span class="week-tasks-count">{{ getWeekTasksCount(week) }} مهام</span>
                      <BaseIcon name="solar:alt-arrow-down-outline" class="toggle-icon toggle-icon--sm" />
                    </div>
                  </div>

                  <div v-if="week.isOpen" class="week-body">
                    <!-- عمليات الأسبوع -->
                    <div v-if="week.operationsLoading" class="operations-loading">
                      جاري تحميل عمليات الأسبوع...
                    </div>
                    <div v-else-if="week.operations && week.operations.length > 0" class="level-operations-section is-readonly">
                      <div class="section-header">
                        <div class="section-header__title">
                          <BaseIcon name="solar:clipboard-list-outline" class="section-icon" />
                          <h3 class="section-title">عمليات الأسبوع العامة</h3>
                        </div>
                      </div>
                      <div class="operations-container">
                        <div v-for="(op, opIdx) in week.operations" :key="opIdx" class="operation-row readonly">
                          <div class="operation-input-group readonly">
                            <span class="operation-number">{{ opIdx + 1 }}</span>
                            <span class="operation-text">{{ op }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="days-grid">
                      <div v-for="day in week.days" :key="day.date" class="day-card" :class="{'day-card--today': isToday(day.date)}" @click="goToDay(day.date, selectedFarmId, selectedPalmTypeId)">
                        <div class="day-card__top">
                          <span class="day-name">{{ day.dayName }}</span>
                          <span class="day-date" :class="{'day-date--today-text': isToday(day.date)}">{{ formatShortDate(day.date) }}</span>
                        </div>
                        
                        <div class="day-card__indicators">
                          <div v-if="day.tasksSummary.irrigation" class="indicator indicator--irrigation">
                            <BaseIcon name="solar:waterdrops-bold" /> ري
                          </div>
                          <div v-if="day.tasksSummary.fertilization" class="indicator indicator--fertilization">
                            <BaseIcon name="solar:leaf-bold" /> تسميد
                          </div>
                          <div v-if="day.tasksSummary.spraying" class="indicator indicator--spraying">
                            <BaseIcon name="solar:bug-bold" /> رش
                          </div>
                          <div v-if="day.tasksSummary.other" class="indicator indicator--other">
                            <BaseIcon name="solar:checklist-minimalistic-bold" /> أخرى
                          </div>
                          <div v-if="!hasAnyTask(day.tasksSummary)" class="indicator indicator--empty">
                            لا توجد مهام
                          </div>
                        </div>

                        <div class="day-card__action">
                          <span>عرض وتحديث</span>
                          <BaseIcon name="solar:arrow-left-outline" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="activeCalendar.length === 0" class="no-tasks-state">
               لا توجد مهام حالياً لهذا النوع في هذه المزرعة
            </div>
          </div>
        </transition>
      </div>
    </div>
  </BasePageWrapper>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useTasksStore } from '@/stores/tasks.store';
import { useFarmsStore } from '@/stores/farms.store';
import { useDailyOperationsStore } from '@/stores/dailyOperations.store';

import { useReportsStore } from '@/stores/reports.store';
import { mergeReportActivitiesIntoTasks } from '@/helpers/taskMerger.helper';

const router = useRouter();
const farmsStore = useFarmsStore();
const tasksStore = useTasksStore();
const reportsStore = useReportsStore();
const dailyOperationsStore = useDailyOperationsStore();

const farms = ref([]);
const loading = ref(true);
const selectedFarmId = ref('');
const selectedPalmTypeId = ref('');

const selectedYear = ref(new Date().getFullYear());
const availableYears = ref([new Date().getFullYear()]);
const allFetchedTasks = ref([]);

onMounted(async () => {
  try {
    const response = await farmsStore.fetchRecords({ per_page: 100 });
    farms.value = Array.isArray(response) ? response : (response.data || []);
    
    if (farms.value.length > 0) {
      selectedFarmId.value = farms.value[0].id;
    }
  } catch (error) {
    console.error("Error fetching farms:", error);
  } finally {
    loading.value = false;
  }
});

const selectedFarm = computed(() => {
  return farms.value.find(f => f.id === selectedFarmId.value) || null;
});

watch(selectedFarmId, (newFarmId) => {
  const farm = farms.value.find(f => f.id === newFarmId);
  if (farm && farm.palm_types && farm.palm_types.length > 0) {
    selectedPalmTypeId.value = farm.palm_types[0].id;
  } else {
    selectedPalmTypeId.value = '';
  }
});

const activeCalendar = ref([]);

const groupTasksIntoCalendar = (tasks) => {
  const calendarMap = new Map(); 
  const today = new Date();
  
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  const currentMonthStr = `${currentYear}-${currentMonth}`;
  const currentDayOfMonth = today.getDate();
  const currentWeekNum = Math.ceil(currentDayOfMonth / 7);

  tasks.forEach(task => {
    const normalizedDate = task.date ? task.date.split('T')[0] : '';
    if (!normalizedDate) return;
    
    // update task.date to be normalized so the UI works correctly
    task.date = normalizedDate;

    const dateObj = new Date(normalizedDate);
    const monthStr = normalizedDate.substring(0, 7); 
    
    if (!calendarMap.has(monthStr)) {
      calendarMap.set(monthStr, {
        monthStr: monthStr,
        monthName: dateObj.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' }),
        isOpen: monthStr === currentMonthStr,
        operationsLoaded: false,
        operationsLoading: false,
        operations: [],
        weeksMap: new Map(),
      });
    }
    
    const monthObj = calendarMap.get(monthStr);
    
    const taskDayStr = normalizedDate.split('-')[2];
    const dayOfMonth = parseInt(taskDayStr, 10);
    const weekNum = Math.ceil(dayOfMonth / 7);
    
    if (!monthObj.weeksMap.has(weekNum)) {
      const startDay = (weekNum - 1) * 7 + 1;
      const endDay = Math.min(weekNum * 7, new Date(parseInt(normalizedDate.split('-')[0]), parseInt(normalizedDate.split('-')[1]), 0).getDate());
      const weekNames = { 1: 'الأول', 2: 'الثاني', 3: 'الثالث', 4: 'الرابع', 5: 'الخامس' };
      
      monthObj.weeksMap.set(weekNum, {
        weekNum: weekNum,
        weekName: `الأسبوع ${weekNames[weekNum] || weekNum} (${startDay} - ${endDay})`,
        isOpen: monthStr === currentMonthStr && weekNum === currentWeekNum,
        operationsLoaded: false,
        operationsLoading: false,
        operations: [],
        daysMap: new Map()
      });
    }
    
    const weekObj = monthObj.weeksMap.get(weekNum);
    
    if (!weekObj.daysMap.has(normalizedDate)) {
      weekObj.daysMap.set(normalizedDate, {
        date: normalizedDate,
        dayName: dateObj.toLocaleDateString('ar-SA', { weekday: 'long' }),
        tasksSummary: { irrigation: false, fertilization: false, spraying: false, other: false },
        tasks: []
      });
    }
    
    const dayObj = weekObj.daysMap.get(normalizedDate);
    
    if (task.task_type === 'irrigation') dayObj.tasksSummary.irrigation = true;
    else if (task.task_type === 'fertilization') dayObj.tasksSummary.fertilization = true;
    else if (task.task_type === 'spraying') dayObj.tasksSummary.spraying = true;
    else dayObj.tasksSummary.other = true;
    
    dayObj.tasks.push(task);
  });

  const calendar = Array.from(calendarMap.values()).sort((a, b) => b.monthStr.localeCompare(a.monthStr)); 
  
  calendar.forEach(month => {
    month.weeks = Array.from(month.weeksMap.values()).sort((a, b) => b.weekNum - a.weekNum);
    delete month.weeksMap;
    
    month.weeks.forEach(week => {
      week.days = Array.from(week.daysMap.values()).sort((a, b) => b.date.localeCompare(a.date));
      delete week.daysMap;
    });
  });

  return calendar;
};

const updateCalendar = () => {
  const year = selectedYear.value;
  const filteredTasks = allFetchedTasks.value.filter(task => {
    if (!task.date) return false;
    return task.date.startsWith(year.toString());
  });
  
  activeCalendar.value = groupTasksIntoCalendar(filteredTasks);
  
  // Pre-load operations for initially open months and weeks
  activeCalendar.value.forEach(async (month) => {
    if (month.isOpen) await toggleMonth(month, true);
    month.weeks.forEach(async (week) => {
      if (week.isOpen) await toggleWeek(month, week, true);
    });
  });
  
  nextTick(() => {
    setTimeout(() => {
      const openWeek = document.querySelector('.week-block--open');
      if (openWeek) {
        openWeek.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 400);
  });
};

watch([selectedFarmId, selectedPalmTypeId], async ([farmId, palmId]) => {
  if (farmId && palmId) {
    try {
      const response = await tasksStore.fetchRecords({ farm_id: farmId, palm_type_id: palmId, per_page: 1000 });
      let tasksData = Array.isArray(response) ? response : (response.data || []);
      
      allFetchedTasks.value = tasksData;
      
      const yearsSet = new Set();
      tasksData.forEach(task => {
        if (task.date) {
          const y = parseInt(task.date.substring(0, 4));
          if (!isNaN(y)) yearsSet.add(y);
        }
      });
      
      let yearsArray = Array.from(yearsSet).sort((a, b) => b - a);
      const currentYear = new Date().getFullYear();
      if (yearsArray.length === 0) {
        yearsArray = [currentYear];
      }
      
      availableYears.value = yearsArray;
      
      if (!yearsArray.includes(selectedYear.value)) {
        selectedYear.value = yearsArray.includes(currentYear) ? currentYear : yearsArray[0];
      }
      
      updateCalendar();
    } catch (error) {
      console.error("Error fetching tasks:", error);
      activeCalendar.value = [];
      allFetchedTasks.value = [];
    }
  } else {
    activeCalendar.value = [];
    allFetchedTasks.value = [];
  }
}, { immediate: true });

watch(selectedYear, (newYear, oldYear) => {
  if (newYear !== oldYear) {
    updateCalendar();
  }
});

const goToDay = (date, farmId, palmTypeId) => {
  router.push({ name: 'farm_task_day', params: { date }, query: { farmId, palmTypeId } });
};

const getMonthTasksCount = (month) => {
  let count = 0;
  month.weeks.forEach(w => {
    w.days.forEach(d => {
      if (hasAnyTask(d.tasksSummary)) count++;
    });
  });
  return count;
};

const getWeekTasksCount = (week) => {
  return week.days.filter(d => hasAnyTask(d.tasksSummary)).length;
};

const hasAnyTask = (summary) => {
  return summary.irrigation || summary.fertilization || summary.spraying || summary.other;
};

const formatShortDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.getDate() + ' ' + d.toLocaleString('ar-SA', { month: 'short' });
};

const isToday = (dateStr) => {
  return new Date(dateStr).toDateString() === new Date().toDateString();
};

const toggleMonth = async (month, forceOpen = false) => {
  if (!forceOpen) month.isOpen = !month.isOpen;
  if (month.isOpen && !month.operationsLoaded) {
    month.operationsLoading = true;
    try {
      const op = await dailyOperationsStore.fetchOperation({
        farm_id: selectedFarmId.value,
        level: 'month',
        operation_key: month.monthStr
      });
      if (op && op.content) {
        month.operations = op.content.split('\n').filter(o => o.trim() !== '');
      } else {
        month.operations = [];
      }
      month.operationsLoaded = true;
    } catch (e) {
      console.error(e);
    } finally {
      month.operationsLoading = false;
    }
  }
};

const toggleWeek = async (month, week, forceOpen = false) => {
  if (!forceOpen) week.isOpen = !week.isOpen;
  if (week.isOpen && !week.operationsLoaded) {
    week.operationsLoading = true;
    try {
      const weekKey = `${month.monthStr}-week-${week.weekNum}`;
      const op = await dailyOperationsStore.fetchOperation({
        farm_id: selectedFarmId.value,
        level: 'week',
        operation_key: weekKey
      });
      if (op && op.content) {
        week.operations = op.content.split('\n').filter(o => o.trim() !== '');
      } else {
        week.operations = [];
      }
      week.operationsLoaded = true;
    } catch (e) {
      console.error(e);
    } finally {
      week.operationsLoading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.calendar-tasks {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.loading-state, .empty-state, .no-tasks-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: white;
  border-radius: 24px;
  text-align: center;
  color: var(--gray-500);
  font-size: 1.4rem;
  border: 1px solid var(--gray-200);
}

.empty-icon {
  font-size: 4rem;
  color: var(--gray-300);
  margin-bottom: 16px;
}

.selected-state {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.tasks__farm-filters {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 10px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

.farm-filter-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 20px;
  min-width: 260px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);

  &:hover {
    border-color: var(--blue-300);
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(30, 64, 175, 0.08);
  }

  &--active {
    background: var(--blue-600);
    border-color: var(--blue-600);
    box-shadow: 0 12px 24px rgba(37, 99, 235, 0.25);

    .farm-filter-btn__icon {
      background: rgba(255,255,255,0.2);
      color: white;
    }
    .farm-filter-btn__name { color: white; }
    .farm-filter-btn__meta { color: rgba(255,255,255,0.8); }
  }

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: var(--blue-50);
    color: var(--blue-600);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    transition: all 0.3s ease;
  }

  &__info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__name {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: 4px;
  }

  &__meta {
    font-size: 1rem;
    color: var(--gray-500);
  }
}

.tasks__palm-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 20px;
  border: 1px solid var(--gray-200);
}

.palm-filters-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.year-filter {
  display: flex;
  align-items: center;
  background: var(--blue-50);
  border: 1px solid var(--blue-100);
  border-radius: 14px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--blue-100);
  }

  .year-icon {
    font-size: 1.4rem;
    color: var(--blue-600);
    margin-left: 8px; /* arabic RTL */
  }

  .dropdown-icon {
    font-size: 1.2rem;
    color: var(--blue-600);
    margin-right: 8px;
    pointer-events: none;
  }

  .year-select {
    appearance: none;
    background: transparent;
    border: none;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--blue-800);
    outline: none;
    cursor: pointer;
  }
}

.palm-filter-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--emerald-50);
    border-color: var(--emerald-200);
  }

  &--active {
    background: var(--emerald-500);
    border-color: var(--emerald-500);
    color: white;
    box-shadow: 0 8px 16px rgba(16, 185, 129, 0.2);

    .palm-filter-btn__name { color: white; }
  }

  &__icon { font-size: 1.4rem; }
  &__name {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--gray-700);
  }
}

.no-palms-msg {
  color: var(--gray-500);
  font-size: 1.1rem;
  padding: 10px;
}

.calendar-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.month-block {
  background: white;
  border-radius: 20px;
  border: 1px solid var(--gray-200);
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
  overflow: hidden;
  transition: all 0.3s;

  &--open {
    border-color: var(--blue-300);
    box-shadow: 0 15px 40px rgba(30, 64, 175, 0.06);
    
    .month-header {
      background: linear-gradient(135deg, rgba(30, 64, 175, 0.03), rgba(255, 255, 255, 1));
      border-bottom: 1px solid var(--gray-200);
    }
    .toggle-icon { transform: rotate(180deg); }
  }
}

.month-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  cursor: pointer;
  user-select: none;
  transition: background 0.3s;

  &:hover { background: var(--gray-50); }

  &__info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__icon {
    font-size: 2.4rem;
    color: var(--blue-600);
  }

  &__title {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--gray-900);
    margin: 0;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.tasks-count-badge {
  background: var(--blue-100);
  color: var(--blue-700);
  padding: 6px 16px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 1.1rem;
}

.toggle-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.02);
}

.toggle-icon {
  font-size: 1.5rem;
  color: var(--gray-500);
  transition: transform 0.3s;
  &--sm { font-size: 1.2rem; }
}

.month-body {
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #fdfdfd;
}

.week-block {
  border: 1px solid var(--gray-200);
  border-radius: 16px;
  background: white;
  overflow: hidden;

  &--open {
    border-color: var(--emerald-200);
    .week-header {
      background: var(--emerald-50);
      border-bottom: 1px solid var(--emerald-100);
      .toggle-icon { transform: rotate(180deg); }
    }
  }
}

.week-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  cursor: pointer;
  user-select: none;
  transition: background 0.3s;

  &:hover { background: var(--gray-50); }

  &__info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__title {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--gray-800);
    margin: 0;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.week-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--emerald-400);
}

.week-tasks-count {
  font-size: 1rem;
  color: var(--emerald-700);
  font-weight: 700;
  background: white;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--emerald-200);
}

.week-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.day-card {
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;

  &:hover {
    border-color: var(--blue-300);
    box-shadow: 0 10px 20px rgba(30, 64, 175, 0.08);
    transform: translateY(-2px);

    .day-card__action {
      background: var(--blue-500);
      color: white;
    }
  }

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px dashed var(--gray-200);
  }
}

.day-name {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--gray-900);
}

.day-date {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--gray-500);
  padding: 4px 10px;
  background: var(--gray-100);
  border-radius: 8px;
}

@keyframes glowToday {
  0%, 100% {
    box-shadow: 0 12px 30px rgba(59, 130, 246, 0.16);
  }
  50% {
    box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4), 0 0 15px rgba(59, 130, 246, 0.3);
  }
}

.day-card--today {
  border-color: var(--blue-400);
  background: linear-gradient(145deg, #ffffff, #f0f7ff);
  box-shadow: 0 12px 30px rgba(59, 130, 246, 0.16);
  position: relative;
  animation: glowToday 2.5s ease-in-out infinite;
  
  &::before {
    content: 'اليوم';
    position: absolute;
    top: 0;
    right: 24px;
    background: var(--blue-600);
    color: white;
    padding: 6px 14px;
    border-radius: 0 0 12px 12px;
    font-size: 1.15rem;
    font-weight: 800;
    z-index: 2;
    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
  }
}

.day-date--today-text {
  background: var(--blue-100);
  color: var(--blue-700);
}

.day-card__indicators {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  min-height: 80px;
}

.indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;

  &--irrigation { background: var(--blue-50); color: var(--blue-700); }
  &--fertilization { background: var(--emerald-50); color: var(--emerald-700); }
  &--spraying { background: var(--rose-50); color: var(--rose-700); }
  &--other { background: var(--violet-50); color: var(--violet-700); }
  &--empty { 
    background: var(--gray-50); 
    color: var(--gray-400); 
    justify-content: center;
    border: 1px dashed var(--gray-200);
  }
}

.day-card__action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding: 12px 16px;
  background: var(--gray-50);
  color: var(--gray-600);
  border-radius: 12px;
}

/* Operations UI - Read Only */
.operations-loading {
  padding: 20px;
  text-align: center;
  color: var(--gray-500);
  font-weight: 600;
  font-size: 1.2rem;
  background: var(--gray-50);
  border-radius: 16px;
  border: 1px dashed var(--gray-200);
  margin-bottom: 20px;
}

.level-operations-section.is-readonly {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
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
      font-size: 1.8rem;
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

.operation-row.readonly {
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
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--gray-900);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
