<template>
  <BasePageWrapper titleKey="المهام المزرعية" subtitleKey="تصفح وتعديل المهام بشكل شهري وأسبوعي" iconName="solar:calendar-search-outline">
    <div class="admin-calendar-tasks">
      
      <!-- الحالة الأولى: شاشة البحث وتحديد العميل (فارغة) -->
      <transition name="slide-up" mode="out-in">
        <div v-if="!selectedUser" class="empty-state-hero">
          <div class="empty-state-hero__bg"></div>
          
          <div class="empty-state-hero__content">
            <div class="hero-icon-wrap">
              <BaseIcon name="solar:users-group-two-rounded-bold-duotone" />
            </div>
            
            <h2 class="hero-title">مرحباً بك في إدارة المهام المزرعية</h2>
            <p class="hero-subtitle">
              ابحث عن عميل لاستعراض المزارع والمهام الخاصة به وتعديلها بسهولة واحترافية.
            </p>
            
            <div class="search-container">
              <div class="search-box">
                <BaseIcon name="solar:magnifier-outline" class="search-box__icon" />
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  class="search-box__input"
                  placeholder="ابحث باسم العميل أو رقم الهاتف..." 
                />
              </div>

              <!-- نتائج البحث -->
              <transition name="fade">
                <div v-if="searchQuery || realUsers.length > 0" class="search-results">
                  <div 
                    v-for="user in filteredUsers" 
                    :key="user.id" 
                    class="user-result-card"
                    @click="selectUser(user)"
                  >
                    <div class="user-result-card__avatar">
                      {{ user.name.charAt(0) }}
                    </div>
                    <div class="user-result-card__info">
                      <h4>{{ user.name }}</h4>
                      <span class="user-phone">
                        <BaseIcon name="solar:phone-outline" /> 
                        {{ user.phone }}
                      </span>
                    </div>
                    <div class="user-result-card__action">
                      <span class="farms-badge">{{ user.farms.length }} مزارع</span>
                      <div class="action-btn">
                        عرض المهام <BaseIcon name="solar:alt-arrow-left-outline" />
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="filteredUsers.length === 0" class="no-results">
                    <BaseIcon name="solar:ghost-smile-outline" />
                    <p>لا يوجد عملاء يطابقون بحثك.</p>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- الحالة الثانية: تم تحديد العميل (عرض التقويم) -->
        <div v-else class="selected-state">
          
          <!-- كارت معلومات العميل المحدد -->
          <div class="selected-user-card">
            <div class="selected-user-card__main">
              <div class="selected-avatar">
                <BaseIcon name="solar:user-bold-duotone" />
              </div>
              <div class="selected-info">
                <span class="eyebrow">العميل المحدد حالياً</span>
                <h3>{{ selectedUser.name }}</h3>
                <span class="phone"><BaseIcon name="solar:phone-outline" /> {{ selectedUser.phone }}</span>
              </div>
            </div>
            <button class="change-user-btn" @click="clearSelection">
              <BaseIcon name="solar:refresh-circle-outline" />
              تغيير العميل
            </button>
          </div>
          
          <!-- فلاتر المزارع الخاصة بالعميل -->
          <div class="tasks__farm-filters">
            <button
              v-for="farm in selectedUser.farms"
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
            <div v-if="selectedFarm && selectedFarm.palmTypes" class="tasks__palm-filters">
              <div class="palm-filters-group">
                <button
                  v-for="palmType in selectedFarm.palmTypes"
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
          </transition>

          <!-- عرض التقويم لنوع النخيل المحدد -->
          <transition name="fade" mode="out-in">
            <div v-if="selectedPalmType" :key="selectedPalmType.id" class="calendar-content">
              
              <div v-for="month in activeCalendar" :key="month.monthStr" class="month-block" :class="{ 'month-block--open': month.isOpen }">
                
                <div class="month-header" @click="month.isOpen = !month.isOpen">
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
                  <div class="level-operations-section" :class="{ 'is-collapsed': !month.isOperationsOpen }">
                    <div class="section-header" @click="month.isOperationsOpen = !month.isOperationsOpen">
                      <div class="section-header__title">
                        <BaseIcon name="solar:clipboard-list-outline" class="section-icon" />
                        <h3 class="section-title">عمليات الشهر</h3>
                      </div>
                      <BaseIcon 
                        name="solar:alt-arrow-down-outline" 
                        class="collapse-icon" 
                        :class="{ 'rotate-180': month.isOperationsOpen }" 
                      />
                    </div>
                    
                    <div class="operations-container" v-show="month.isOperationsOpen">
                      <div 
                        v-for="(op, opIndex) in month.operations" 
                        :key="opIndex" 
                        class="operation-row"
                      >
                        <div class="operation-input-group">
                          <span class="operation-number">{{ opIndex + 1 }}</span>
                          <input 
                            v-model="month.operations[opIndex]" 
                            type="text" 
                            class="operation-input" 
                            placeholder="أضف تفاصيل العملية هنا..." 
                          />
                        </div>
                        <button 
                          v-if="month.operations.length > 1" 
                          class="btn-remove-op" 
                          @click="month.operations.splice(opIndex, 1)"
                          title="حذف العملية"
                        >
                          <BaseIcon name="solar:trash-bin-trash-outline" />
                        </button>
                      </div>
                      
                      <div class="operations-actions">
                        <button class="btn-add-op" @click="month.operations.push('')">
                          <BaseIcon name="solar:add-circle-outline" />
                          إضافة عملية أخرى
                        </button>
                        <button class="btn-save-op" @click="saveMonthOperations(month)" :disabled="month.isSaving || dailyOperationsStore.loading">
                          <BaseIcon name="solar:diskette-outline" v-if="!month.isSaving && !dailyOperationsStore.loading" />
                          <span class="spinner" v-else></span>
                          حفظ العمليات
                        </button>
                      </div>
                    </div>
                  </div>

                  <div v-for="(week, index) in month.weeks" :key="index" class="week-block" :class="{ 'week-block--open': week.isOpen }">
                    <div class="week-header" @click="week.isOpen = !week.isOpen">
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
                      <div class="level-operations-section" :class="{ 'is-collapsed': !week.isOperationsOpen }">
                        <div class="section-header" @click="toggleWeekOperations(month, week)">
                          <div class="section-header__title">
                            <BaseIcon name="solar:clipboard-list-outline" class="section-icon" />
                            <h3 class="section-title">عمليات الأسبوع</h3>
                          </div>
                          <BaseIcon 
                            name="solar:alt-arrow-down-outline" 
                            class="collapse-icon" 
                            :class="{ 'rotate-180': week.isOperationsOpen }" 
                          />
                        </div>
                        
                        <div class="operations-container" v-show="week.isOperationsOpen">
                          <div 
                            v-for="(op, opIndex) in week.operations" 
                            :key="opIndex" 
                            class="operation-row"
                          >
                            <div class="operation-input-group">
                              <span class="operation-number">{{ opIndex + 1 }}</span>
                              <input 
                                v-model="week.operations[opIndex]" 
                                type="text" 
                                class="operation-input" 
                                placeholder="أضف تفاصيل العملية هنا..." 
                              />
                            </div>
                            <button 
                              v-if="week.operations.length > 1" 
                              class="btn-remove-op" 
                              @click="week.operations.splice(opIndex, 1)"
                              title="حذف العملية"
                            >
                              <BaseIcon name="solar:trash-bin-trash-outline" />
                            </button>
                          </div>
                          
                          <div class="operations-actions">
                            <button class="btn-add-op" @click="week.operations.push('')">
                              <BaseIcon name="solar:add-circle-outline" />
                              إضافة عملية أخرى
                            </button>
                            <button class="btn-save-op" @click="saveWeekOperations(month, week)" :disabled="week.isSaving || dailyOperationsStore.loading">
                              <BaseIcon name="solar:diskette-outline" v-if="!week.isSaving && !dailyOperationsStore.loading" />
                              <span class="spinner" v-else></span>
                              حفظ العمليات
                            </button>
                          </div>
                        </div>
                      </div>

                      <div class="days-grid">
                        <div v-for="day in week.days" :key="day.date" class="day-card" :class="{'day-card--today': isToday(day.date)}" @click="goToDay(day.date, selectedUserId, selectedFarmId, selectedPalmTypeId)">
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
                            <span>تعديل التفاصيل</span>
                            <BaseIcon name="solar:pen-new-square-outline" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </transition>
        </div>
      </transition>
    </div>
  </BasePageWrapper>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTasksStore } from '@/stores/tasks.store';
import { useFarmsStore } from '@/stores/farms.store';
import { useReportsStore } from '@/stores/reports.store';
import { useDailyOperationsStore } from '@/stores/dailyOperations.store';
import { mergeReportActivitiesIntoTasks } from '@/helpers/taskMerger.helper';

const router = useRouter();
const route = useRoute();

const farmsStore = useFarmsStore();
const reportsStore = useReportsStore();
const dailyOperationsStore = useDailyOperationsStore();
const realUsers = ref([]);

onMounted(async () => {
  try {
    const response = await farmsStore.fetchRecords({ per_page: 100 });
    const farms = Array.isArray(response) ? response : (response.data || []);
    
    const usersMap = new Map();
    
    farms.forEach(farm => {
      const owner = farm.owner || { id: 'unknown', name: 'عميل غير معروف', whatsapp_number: '' };
      
      if (!usersMap.has(owner.id)) {
        usersMap.set(owner.id, {
          id: owner.id,
          name: owner.name,
          phone: owner.whatsapp_number || owner.phone || '',
          farms: []
        });
      }
      
      const user = usersMap.get(owner.id);
      user.farms.push({
        id: farm.id,
        name: farm.name,
        location: farm.location,
        palmTypes: farm.palmTypes || farm.palm_types || []
      });
    });
    
    realUsers.value = Array.from(usersMap.values());
    
    if (route.query.userId) {
      selectedUserId.value = isNaN(Number(route.query.userId)) ? route.query.userId : Number(route.query.userId);
      setTimeout(() => {
        if (route.query.farmId) selectedFarmId.value = Number(route.query.farmId);
        setTimeout(() => {
          if (route.query.palmTypeId) selectedPalmTypeId.value = Number(route.query.palmTypeId);
        }, 100);
      }, 100);
    }
  } catch (error) {
    console.error("Error fetching farms for users map:", error);
  }
});

const selectedUserId = ref('');
const selectedFarmId = ref('');
const selectedPalmTypeId = ref('');
const searchQuery = ref('');

const selectedYear = ref(new Date().getFullYear());
const availableYears = ref([new Date().getFullYear()]);
const allFetchedTasks = ref([]);

const selectedUser = computed(() => {
  return realUsers.value.find(u => u.id === selectedUserId.value) || null;
});

const filteredUsers = computed(() => {
  if (!searchQuery.value) return realUsers.value;
  const query = searchQuery.value.toLowerCase();
  return realUsers.value.filter(u => 
    u.name.toLowerCase().includes(query) || (u.phone && u.phone.includes(query))
  );
});

const selectUser = (user) => {
  selectedUserId.value = user.id;
  searchQuery.value = '';
};

const clearSelection = () => {
  selectedUserId.value = '';
  selectedFarmId.value = '';
  selectedPalmTypeId.value = '';
};

const selectedFarm = computed(() => {
  if (!selectedUser.value) return null;
  return selectedUser.value.farms.find(f => f.id === selectedFarmId.value) || null;
});

const selectedPalmType = computed(() => {
  if (!selectedFarm.value) return null;
  return selectedFarm.value.palmTypes.find(p => p.id === selectedPalmTypeId.value) || null;
});

// اختيار أول مزرعة وأول نوع نخل تلقائياً عند تغيير العميل
watch(selectedUserId, (newId) => {
  const user = realUsers.value.find(u => u.id === newId);
  if (user && user.farms.length > 0) {
    selectedFarmId.value = user.farms[0].id;
  } else {
    selectedFarmId.value = '';
  }
});

watch(selectedFarmId, (newFarmId) => {
  const farm = selectedUser.value?.farms.find(f => f.id === newFarmId);
  if (farm && farm.palmTypes && farm.palmTypes.length > 0) {
    selectedPalmTypeId.value = farm.palmTypes[0].id;
  } else {
    selectedPalmTypeId.value = '';
  }
});

const tasksStore = useTasksStore();
const activeCalendar = ref([]);

const groupTasksIntoCalendar = (tasks) => {
  const calendarMap = new Map(); 
  const today = new Date();
  
  // Format dates strictly in local time (avoiding UTC timezone shift issues)
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
        operations: [''],
        isOperationsOpen: false,
        isLoadingOperations: false,
        hasLoadedOperations: false,
        isSaving: false,
        weeksMap: new Map(),
      });
    }
    
    const monthObj = calendarMap.get(monthStr);
    
    // We compute the day and week relative to the task date string without UTC timezone shift.
    // e.g. '2026-06-18' -> day 18
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
        operations: [''],
        isOperationsOpen: false,
        isLoadingOperations: false,
        hasLoadedOperations: false,
        isSaving: false,
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

  const calendar = Array.from(calendarMap.values()).map(month => {
    month.weeks = Array.from(month.weeksMap.values()).map(week => {
      week.days = Array.from(week.daysMap.values()).sort((a, b) => a.date.localeCompare(b.date));
      delete week.daysMap;
      return week;
    }).sort((a, b) => a.weekNum - b.weekNum);
    delete month.weeksMap;
    return month;
  }).sort((a, b) => b.monthStr.localeCompare(a.monthStr));

  // Check if we need to load current month/week operations immediately if they are open
  calendar.forEach(month => {
    if (month.isOpen && month.isOperationsOpen && !month.hasLoadedOperations) {
       toggleMonthOperations(month); 
       // Need to invert it back since toggle will invert it
       month.isOperationsOpen = true; 
    }
  });

  return calendar;
};

const toggleMonthOperations = async (month) => {
  month.isOperationsOpen = !month.isOperationsOpen;
  if (month.isOperationsOpen && !month.hasLoadedOperations) {
    month.isLoadingOperations = true;
    const op = await dailyOperationsStore.fetchOperation({
      farm_id: selectedFarmId.value,
      level: 'month',
      operation_key: month.monthStr
    });
    if (op && op.content) month.operations = op.content.split('\n');
    else month.operations = [''];
    month.hasLoadedOperations = true;
    month.isLoadingOperations = false;
  }
};

const saveMonthOperations = async (month) => {
  month.isSaving = true;
  const content = month.operations.filter(op => op.trim() !== '').join('\n');
  const [year, monthVal] = month.monthStr.split('-');
  await dailyOperationsStore.saveOperation({
    farm_id: selectedFarmId.value,
    level: 'month',
    operation_key: month.monthStr,
    content: content,
    year: parseInt(year),
    month: parseInt(monthVal)
  });
  month.isSaving = false;
};

const toggleWeekOperations = async (month, week) => {
  week.isOperationsOpen = !week.isOperationsOpen;
  if (week.isOperationsOpen && !week.hasLoadedOperations) {
    week.isLoadingOperations = true;
    const opKey = `${month.monthStr}-week-${week.weekNum}`;
    const op = await dailyOperationsStore.fetchOperation({
      farm_id: selectedFarmId.value,
      level: 'week',
      operation_key: opKey
    });
    if (op && op.content) week.operations = op.content.split('\n');
    else week.operations = [''];
    week.hasLoadedOperations = true;
    week.isLoadingOperations = false;
  }
};

const saveWeekOperations = async (month, week) => {
  week.isSaving = true;
  const content = week.operations.filter(op => op.trim() !== '').join('\n');
  const [year, monthVal] = month.monthStr.split('-');
  const opKey = `${month.monthStr}-week-${week.weekNum}`;
  await dailyOperationsStore.saveOperation({
    farm_id: selectedFarmId.value,
    level: 'week',
    operation_key: opKey,
    content: content,
    year: parseInt(year),
    month: parseInt(monthVal),
    week_number: week.weekNum
  });
  week.isSaving = false;
};

const updateCalendar = () => {
  const year = selectedYear.value;
  const filteredTasks = allFetchedTasks.value.filter(task => {
    if (!task.date) return false;
    return task.date.startsWith(year.toString());
  });
  
  activeCalendar.value = groupTasksIntoCalendar(filteredTasks);
  
  nextTick(() => {
    setTimeout(() => {
      const openWeek = document.querySelector('.week-block--open');
      if (openWeek) {
        openWeek.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 400); // Wait for transitions and dom
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

const goToDay = (date, userId, farmId, palmTypeId) => {
  router.push({ name: 'admin_task_calendar_day', params: { date }, query: { userId, farmId, palmTypeId } });
};

// Functions مساعدة
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
</script>

<style lang="scss" scoped>
.admin-calendar-tasks {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* ---------------------------------
   الحالة 1: الشاشة الفارغة الفخمة
--------------------------------- */
.empty-state-hero {
  position: relative;
  min-height: calc(100vh - 220px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #ffffff, #f4f7fb);
  border: 1px solid var(--blue-100);
  border-radius: 36px;
  box-shadow: 0 30px 60px rgba(30, 64, 175, 0.04), inset 0 2px 4px rgba(255,255,255,1);
  padding: 40px;
}

.empty-state-hero__bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: inherit;
  overflow: hidden;
  background: radial-gradient(circle at 50% -20%, rgba(59, 130, 246, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.empty-state-hero__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 680px;
  width: 100%;
}

.hero-icon-wrap {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, var(--blue-50), var(--blue-100));
  color: var(--blue-600);
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  margin-bottom: 28px;
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.15), inset 0 2px 4px rgba(255,255,255,0.8);
  transform: rotate(-5deg);
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: rotate(0deg) scale(1.05);
  }
}

.hero-title {
  font-size: 2.4rem;
  font-weight: 900;
  color: var(--gray-900);
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-size: 1.3rem;
  color: var(--gray-500);
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 500px;
}

/* شريط البحث */
.search-container {
  width: 100%;
  position: relative;
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--white);
  border: 2px solid var(--white);
  border-radius: 20px;
  padding: 8px 24px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.06);
  transition: all 0.3s;
  
  &:focus-within {
    border-color: var(--blue-400);
    box-shadow: 0 20px 50px rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
  }

  &__icon {
    font-size: 1.8rem;
    color: var(--blue-500);
    margin-left: 16px;
  }

  &__input {
    flex: 1;
    border: none;
    background: transparent;
    padding: 16px 0;
    font-size: 1.3rem;
    color: var(--gray-800);
    outline: none;
    font-family: inherit;

    &::placeholder {
      color: var(--gray-400);
    }
  }
}

/* قائمة النتائج الفخمة */
.search-results {
  width: 100%;
  margin-top: 16px;
  background: white;
  border-radius: 24px;
  border: 1px solid var(--gray-200);
  box-shadow: 0 20px 50px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  max-height: 320px;
  overflow-y: auto;
  z-index: 10;
  text-align: right;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--gray-300);
    border-radius: 10px;
  }
}

.user-result-card {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  gap: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--gray-100);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--blue-50);
    padding-right: 32px; // تأثير حركة ناعم
    
    .action-btn {
      color: var(--blue-700);
      background: var(--blue-100);
    }
  }

  &__avatar {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--blue-500), var(--blue-700));
    color: white;
    font-size: 1.8rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.2);
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;

    h4 {
      font-size: 1.3rem;
      font-weight: 800;
      color: var(--gray-900);
      margin: 0;
    }

    .user-phone {
      font-size: 1.1rem;
      color: var(--gray-500);
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }

  &__action {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.farms-badge {
  background: var(--emerald-50);
  color: var(--emerald-700);
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--gray-500);
  background: var(--gray-100);
  &--empty {
    color: var(--gray-400);
    background: var(--gray-50);
  }
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.2s;
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

.no-results {
  padding: 40px;
  text-align: center;
  color: var(--gray-400);
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  svg {
    font-size: 3rem;
  }
}

/* ---------------------------------
   الحالة 2: تم اختيار العميل
--------------------------------- */
.selected-state {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.selected-user-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(30, 64, 175, 0.05), rgba(255, 255, 255, 1)), var(--white);
  border: 1px solid var(--blue-100);
  border-radius: 24px;
  padding: 24px 32px;
  box-shadow: 0 15px 40px rgba(30, 64, 175, 0.06);

  &__main {
    display: flex;
    align-items: center;
    gap: 20px;
  }
}

.selected-avatar {
  width: 64px;
  height: 64px;
  background: var(--blue-100);
  color: var(--blue-700);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}

.selected-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .eyebrow {
    font-size: 1rem;
    font-weight: 700;
    color: var(--blue-600);
    background: var(--blue-50);
    padding: 4px 10px;
    border-radius: 6px;
    width: fit-content;
    margin-bottom: 4px;
  }
  h3 {
    font-size: 1.8rem;
    font-weight: 900;
    color: var(--gray-900);
    margin: 0;
  }
  .phone {
    font-size: 1.2rem;
    color: var(--gray-600);
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.change-user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 14px;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.02);

  &:hover {
    background: var(--gray-50);
    border-color: var(--gray-300);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.05);
  }
}

/* فلاتر المزارع وأنواع النخيل */
.tasks__farm-filters,
.tasks__palm-filters {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 10px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

.tasks__palm-filters {
  margin-top: -10px;
}

.farm-filter-btn,
.palm-filter-btn {
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

    .farm-filter-btn__icon, .palm-filter-btn__icon { background: rgba(255,255,255,0.2); color: white; }
    .farm-filter-btn__name, .palm-filter-btn__name { color: white; }
    .farm-filter-btn__meta, .palm-filter-btn__meta { color: rgba(255,255,255,0.8); }
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

  &__name { font-size: 1.25rem; font-weight: 700; color: var(--gray-900); margin-bottom: 4px; transition: all 0.3s ease; }
  &__meta { font-size: 1rem; color: var(--gray-500); transition: all 0.3s ease; }
}

.palm-filter-btn {
  min-width: 200px;
  padding: 12px 20px;
  border-radius: 16px;

  &--active {
    background: var(--emerald-600);
    border-color: var(--emerald-600);
    box-shadow: 0 12px 24px rgba(16, 185, 129, 0.25);
  }

  &__icon {
    width: 40px; height: 40px; font-size: 1.5rem;
    background: var(--emerald-50); color: var(--emerald-600);
  }
}

/* الشهور والأسابيع (التقويم) */
.calendar-content { display: flex; flex-direction: column; gap: 20px; }

.month-block {
  background: white;
  border-radius: 24px;
  border: 1px solid var(--gray-200);
  box-shadow: 0 10px 30px rgba(0,0,0,0.02);
  overflow: hidden;
  transition: all 0.3s;

  &--open {
    border-color: var(--blue-300);
    box-shadow: 0 20px 50px rgba(30, 64, 175, 0.08);
    .month-header { 
      background: linear-gradient(135deg, rgba(30, 64, 175, 0.04), rgba(255, 255, 255, 1)); 
      border-bottom: 1px solid var(--gray-200); 
    }
    .toggle-circle { background: var(--blue-100); color: var(--blue-700); transform: rotate(180deg); }
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
  &__info { display: flex; align-items: center; gap: 16px; }
  &__icon { font-size: 2.8rem; color: var(--blue-600); }
  &__title { font-size: 1.8rem; font-weight: 900; color: var(--gray-900); margin: 0; }
  &__actions { display: flex; align-items: center; gap: 20px; }
}

.tasks-count-badge { background: var(--blue-100); color: var(--blue-700); padding: 8px 20px; border-radius: 999px; font-weight: 800; font-size: 1.1rem; }

.toggle-circle {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--gray-100);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s;
  color: var(--gray-500);
  font-size: 1.5rem;
}

.month-body { padding: 32px; display: flex; flex-direction: column; gap: 24px; background: #fafcff; }

/* الأسبوع */
.week-block {
  border: 1px solid var(--gray-200);
  border-radius: 20px;
  background: white;
  overflow: hidden;
  transition: all 0.3s;

  &--open { 
    border-color: var(--emerald-200); 
    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.05);
    .week-header { background: var(--emerald-50); border-bottom: 1px solid var(--emerald-100); .toggle-icon { transform: rotate(180deg); } .week-dot { background: var(--emerald-500); box-shadow: 0 0 0 4px var(--emerald-100); } } 
  }
}

.week-header {
  display: flex; align-items: center; justify-content: space-between; padding: 20px 28px; cursor: pointer; user-select: none; transition: background 0.3s;
  &:hover { background: var(--gray-50); }
  &__info { display: flex; align-items: center; gap: 12px; }
  .week-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--gray-300); transition: all 0.3s; }
  &__title { font-size: 1.4rem; font-weight: 800; color: var(--gray-800); margin: 0; }
  &__actions { display: flex; align-items: center; gap: 16px; }
}

.week-tasks-count { font-size: 1.1rem; color: var(--emerald-700); font-weight: 800; background: white; padding: 6px 14px; border-radius: 10px; border: 1px solid var(--emerald-200); }
.week-body { padding: 28px; }

/* شبكة الأيام */
.days-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }

.day-card {
  display: flex; flex-direction: column; background: white; border: 1px solid var(--gray-200); border-radius: 20px; padding: 24px; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden;
  &:hover {
    border-color: var(--blue-300); box-shadow: 0 15px 35px rgba(30, 64, 175, 0.08); transform: translateY(-4px);
    .day-card__action { background: var(--blue-600); color: white; }
  }
  &__top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px dashed var(--gray-200); }
}

.day-name { font-size: 1.5rem; font-weight: 900; color: var(--gray-900); }
.day-date { font-size: 1.1rem; font-weight: 700; color: var(--gray-500); padding: 6px 12px; background: var(--gray-100); border-radius: 10px; &--today { background: var(--blue-100); color: var(--blue-700); } }

.day-card__indicators { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; min-height: 90px; }
.indicator {
  display: flex; align-items: center; gap: 10px; font-size: 1.15rem; font-weight: 700; padding: 8px 14px; border-radius: 10px;
  &--irrigation { background: var(--blue-50); color: var(--blue-700); }
  &--fertilization { background: var(--emerald-50); color: var(--emerald-700); }
  &--spraying { background: var(--rose-50); color: var(--rose-700); }
  &--other { background: var(--violet-50); color: var(--violet-700); }
  &--empty { background: var(--gray-50); color: var(--gray-400); justify-content: center; border: 1px dashed var(--gray-300); }
}

.day-card__action {
  display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding: 14px 20px; background: var(--gray-50); color: var(--gray-600); border-radius: 14px; font-weight: 800; font-size: 1.15rem; transition: all 0.3s; border: 1px solid var(--gray-100);
}

/* Level Operations UI (Month/Week) */
.level-operations-section {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.02);
  transition: all 0.3s;

  &.is-collapsed {
    padding-bottom: 24px;
    .section-header {
      margin-bottom: 0;
      border-bottom: none;
      padding-bottom: 0;
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    border-bottom: 2px dashed var(--gray-100);
    padding-bottom: 16px;
    cursor: pointer;
    user-select: none;

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

    .collapse-icon {
      font-size: 2rem;
      color: var(--gray-500);
      transition: transform 0.3s ease;
      &.rotate-180 { transform: rotate(180deg); }
    }
  }
}

.operations-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.operation-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.operation-input-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 16px;
  padding: 12px 20px;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: var(--blue-400);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background: var(--white);
  }

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

  .operation-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 1.5rem;
    font-weight: 500;
    color: var(--gray-900);
    outline: none;
    padding: 8px 0;
    &::placeholder { color: var(--gray-400); font-weight: 400; }
  }
}

.btn-remove-op {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--rose-50);
  color: var(--rose-500);
  border: none;
  border-radius: 14px;
  font-size: 1.6rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: var(--rose-100); color: var(--rose-600); transform: scale(1.05); }
}

.operations-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}

.btn-add-op {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: transparent;
  border: 2px dashed var(--blue-200);
  color: var(--blue-600);
  font-size: 1.4rem;
  font-weight: 700;
  padding: 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: var(--blue-50); border-color: var(--blue-300); }
}

.btn-save-op {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: var(--blue-600);
  color: white;
  border: none;
  font-size: 1.4rem;
  font-weight: 700;
  padding: 14px 32px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover:not(:disabled) { background: var(--blue-700); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
}

.spinner {
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top: 2px solid white;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Transitions */
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(20px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
