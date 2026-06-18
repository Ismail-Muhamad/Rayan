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

const router = useRouter();
const route = useRoute();

const farmsStore = useFarmsStore();
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
    const dateObj = new Date(task.date);
    const monthStr = task.date.substring(0, 7); 
    
    if (!calendarMap.has(monthStr)) {
      calendarMap.set(monthStr, {
        monthStr: monthStr,
        monthName: dateObj.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' }),
        isOpen: monthStr === currentMonthStr,
        weeksMap: new Map(),
      });
    }
    
    const monthObj = calendarMap.get(monthStr);
    
    // We compute the day and week relative to the task date string without UTC timezone shift.
    // e.g. '2026-06-18' -> day 18
    const taskDayStr = task.date.split('-')[2];
    const dayOfMonth = parseInt(taskDayStr, 10);
    const weekNum = Math.ceil(dayOfMonth / 7);
    
    if (!monthObj.weeksMap.has(weekNum)) {
      const startDay = (weekNum - 1) * 7 + 1;
      const endDay = Math.min(weekNum * 7, new Date(parseInt(task.date.split('-')[0]), parseInt(task.date.split('-')[1]), 0).getDate());
      const weekNames = { 1: 'الأول', 2: 'الثاني', 3: 'الثالث', 4: 'الرابع', 5: 'الخامس' };
      
      monthObj.weeksMap.set(weekNum, {
        weekNum: weekNum,
        weekName: `الأسبوع ${weekNames[weekNum] || weekNum} (${startDay} - ${endDay})`,
        isOpen: monthStr === currentMonthStr && weekNum === currentWeekNum,
        daysMap: new Map()
      });
    }
    
    const weekObj = monthObj.weeksMap.get(weekNum);
    
    if (!weekObj.daysMap.has(task.date)) {
      weekObj.daysMap.set(task.date, {
        date: task.date,
        dayName: dateObj.toLocaleDateString('ar-SA', { weekday: 'long' }),
        tasksSummary: { irrigation: false, fertilization: false, spraying: false, other: false },
        tasks: []
      });
    }
    
    const dayObj = weekObj.daysMap.get(task.date);
    
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

watch([selectedFarmId, selectedPalmTypeId], async ([farmId, palmId]) => {
  if (farmId && palmId) {
    try {
      const response = await tasksStore.fetchRecords({ farm_id: farmId, palm_type_id: palmId, per_page: 1000 });
      const tasksData = Array.isArray(response) ? response : (response.data || []);
      activeCalendar.value = groupTasksIntoCalendar(tasksData);
      
      nextTick(() => {
        setTimeout(() => {
          const openWeek = document.querySelector('.week-block--open');
          if (openWeek) {
            openWeek.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 400); // Wait for transitions and dom
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      activeCalendar.value = [];
    }
  } else {
    activeCalendar.value = [];
  }
}, { immediate: true });

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

/* Transitions */
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(20px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
