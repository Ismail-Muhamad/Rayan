<template>
  <BasePageWrapper
    titleKey="المهام"
    subtitleKey="Daily tasks"
    iconName="solar:checklist-minimalistic-outline"
  >
    <section class="admin-tasks-page">
      <!-- HERO -->
      <div class="tasks-hero">
        <div class="tasks-hero__content">
          <div class="tasks-hero__badge">
            <span class="tasks-hero__badge-dot"></span>
            متابعة مهام العملاء
          </div>

          <h1>مهام يوم {{ selectedDayName }}</h1>

          <p>
            هنا هتشوف كل أصحاب المزارع اللي عندهم مهام يوم {{ selectedDayName }}
            الموافق {{ selectedDateLabel }}
          </p>

          <div class="tasks-hero__date">
            <span>{{ selectedDayName }}</span>
            <strong>{{ selectedDateLabel }}</strong>
          </div>
        </div>

        <div class="tasks-hero__stats">
          <div class="stat-card">
            <span>العملاء</span>
            <strong>{{ toEnglishNumbers(groupedUsers.length) }}</strong>
          </div>

          <div class="stat-card">
            <span>المزارع</span>
            <strong>{{ toEnglishNumbers(totalFarms) }}</strong>
          </div>

          <div class="stat-card">
            <span>المهام</span>
            <strong>{{ toEnglishNumbers(totalTasks) }}</strong>
          </div>
        </div>
      </div>

      <!-- DAYS TABS -->
      <div class="days-tabs-container">
        <div class="days-tabs">
          <button 
            v-for="day in availableDays" 
            :key="day.offset"
            type="button"
            class="day-tab"
            :class="{ 'day-tab--active': dateOffset === day.offset }"
            @click="dateOffset = day.offset"
          >
            <span v-if="day.badge" class="day-tab__badge" :class="`day-tab__badge--${day.badgeType}`">
              {{ day.badge }}
            </span>
            <span class="day-tab__name">{{ day.dayName }}</span>
            <span class="day-tab__date">{{ day.dateLabel }}</span>
          </button>
        </div>
      </div>

      <!-- ACTION BAR -->
      <div class="tasks-toolbar">
        <div class="tasks-toolbar__search">
          <span>⌕</span>
          <input
            v-model="search"
            type="text"
            autocomplete="off"
            placeholder="ابحث باسم العميل، رقم الهاتف، اسم المزرعة، ري، تسميد، أو رش..."
          />
        </div>

        <button class="refresh-btn" type="button" @click="loadData">
          تحديث البيانات
        </button>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="tasks-loading">
        <div class="loader"></div>
        <p>جاري تحميل المهام...</p>
      </div>

      <!-- ERROR -->
      <div v-else-if="errorMessage" class="tasks-error">
        <h3>حصلت مشكلة أثناء تحميل المهام</h3>
        <p>{{ errorMessage }}</p>
        <button type="button" @click="loadData">جرب تاني</button>
      </div>

      <!-- EMPTY -->
      <div v-else-if="filteredUsers.length === 0" class="tasks-empty">
        <div class="tasks-empty__icon">🎉</div>
        <h3>مفيش مهام</h3>
        <p>
          مفيش عملاء عندهم مهام ليوم {{ selectedDayName }} حاليًا.
        </p>
      </div>

      <!-- USERS CARDS -->
      <div v-else class="users-tasks-grid">
        <article
          v-for="user in filteredUsers"
          :key="user.id"
          class="user-task-card"
        >
          <!-- USER HEADER -->
          <header class="user-task-card__header">
            <div class="user-main">
              <div class="user-avatar" aria-hidden="true">
                <svg
                  class="user-avatar__icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                    fill="currentColor"
                  />
                  <path
                    d="M4 20.25C4 16.7982 7.58172 14 12 14C16.4183 14 20 16.7982 20 20.25C20 21.2165 19.2165 22 18.25 22H5.75C4.7835 22 4 21.2165 4 20.25Z"
                    fill="currentColor"
                  />
                </svg>
              </div>

              <div class="user-info">
                <h2>{{ user.name || "عميل بدون اسم" }}</h2>

                <div class="user-meta">
                  <span v-if="user.phone">📞 {{ user.phone }}</span>
                  <span v-if="user.whatsapp">🟢 {{ user.whatsapp }}</span>
                  <span v-if="user.email">✉️ {{ user.email }}</span>
                </div>
              </div>
            </div>

            <div class="user-summary">
              <span>عنده مهام في</span>
              <strong>{{ toEnglishNumbers(user.farms.length) }}</strong>
              <small>مزرعة</small>
            </div>
          </header>

          <!-- FARMS -->
          <div class="farms-tasks-grid">
            <div
              v-for="farm in user.farms"
              :key="farm.id"
              class="farm-task-card"
            >
              <div class="farm-task-card__top">
                <div>
                  <span class="farm-label">مزرعة</span>
                  <h3>{{ farm.name || "مزرعة بدون اسم" }}</h3>
                </div>

                <div class="farm-count">
                  {{ toEnglishNumbers(farm.palmTypes.reduce((sum, pt) => sum + pt.tasks.length, 0)) }}
                  <span>مهام</span>
                </div>
              </div>

              <div v-if="farm.location" class="farm-location">
                📍 {{ farm.location }}
              </div>

              <div class="task-type-grid">
                <button
                  v-for="(palmType, ptIndex) in farm.palmTypes"
                  :key="`${farm.id}-${palmType.id}-${ptIndex}`"
                  type="button"
                  class="task-type-card task-type-card--palm"
                  @click="goToTaskDetails(user, farm, palmType)"
                >
                  <div class="task-type-card__icon">
                    🌴
                  </div>

                  <div class="task-type-card__content">
                    <strong>{{ palmType.name }}</strong>
                    <span class="palm-tasks-count">{{ toEnglishNumbers(palmType.tasks.length) }} مهام مطلوبة</span>
                    
                    <div class="task-icons-row">
                      <span v-if="palmType.tasks.some(t => t.type === 'irrigation')" class="task-mini-icon task-mini-icon--irrigation">💧 ري</span>
                      <span v-if="palmType.tasks.some(t => t.type === 'fertilizer')" class="task-mini-icon task-mini-icon--fertilizer">🌱 تسميد</span>
                      <span v-if="palmType.tasks.some(t => t.type === 'spray')" class="task-mini-icon task-mini-icon--spray">🚁 رش</span>
                    </div>
                  </div>

                  <div class="task-type-card__hint">
                    اضغط لعرض المهام
                  </div>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  </BasePageWrapper>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import axiosClient from "@/api/axiosClient";
import { storeToRefs } from "pinia";
import { useUsersStore } from "@/stores/users.store";
import { useFarmsStore } from "@/stores/farms.store";
import { useReportsStore } from "@/stores/reports.store";
import { useRouter } from "vue-router";

const router = useRouter();
const usersStore = useUsersStore();
const farmsStore = useFarmsStore();
const reportsStore = useReportsStore();

const { records: usersRecords } = storeToRefs(usersStore);
const { records: farmsRecords } = storeToRefs(farmsStore);
const { records: reportsRecords } = storeToRefs(reportsStore);

const loading = ref(false);
const errorMessage = ref("");
const search = ref("");
const selectedTasks = ref({});

const users = ref([]);
const farms = ref([]);
const reports = ref([]);

const dateOffset = ref(1);

const availableDays = computed(() => {
  const days = [];
  
  for (let i = -1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);
    
    const dayName = new Intl.DateTimeFormat("ar-EG", { weekday: "long" }).format(date);
    const dateLabel = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long" }).format(date);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    
    let badge = "";
    let badgeType = "";
    
    if (i === -1) {
      badge = "الأمس";
      badgeType = "yesterday";
    } else if (i === 0) {
      badge = "اليوم";
      badgeType = "today";
    } else if (i === 1) {
      badge = "الغد";
      badgeType = "tomorrow";
    }

    days.push({
      offset: i,
      date,
      iso,
      dayName,
      badge,
      badgeType,
      dateLabel: toEnglishNumbers(dateLabel)
    });
  }
  return days;
});

const selectedDate = computed(() => {
  const date = new Date();
  date.setDate(date.getDate() + dateOffset.value);
  date.setHours(0, 0, 0, 0);
  return date;
});

const selectedIso = computed(() => {
  const y = selectedDate.value.getFullYear();
  const m = String(selectedDate.value.getMonth() + 1).padStart(2, "0");
  const d = String(selectedDate.value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
});

const selectedDayName = computed(() => {
  return new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
  }).format(selectedDate.value);
});

const selectedDayNameEn = computed(() => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(selectedDate.value);
});

const selectedDateLabel = computed(() => {
  const label = new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(selectedDate.value);

  return toEnglishNumbers(label);
});

const groupedUsers = computed(() => {
  const activeFarmOwners = normalizeUsers(users.value).filter((user) => {
    const role = String(user.role || user.type || "").toLowerCase();
    const status = String(user.status || "").toLowerCase();

    const isFarmOwner =
      role === "farm_owner" ||
      role === "farm-owner" ||
      role === "owner" ||
      role === "user" ||
      !role;

    const isAccepted =
      !status ||
      status === "active" ||
      status === "accepted" ||
      status === "approved";

    return isFarmOwner && isAccepted;
  });

  const allFarms = normalizeFarms(farms.value);
  const allReports = normalizeReports(reports.value);

  const result = [];

  activeFarmOwners.forEach((user) => {
    const userId = getId(user);

    const userFarms = allFarms.filter((farm) => {
      return String(getFarmOwnerId(farm)) === String(userId);
    });

    const farmsWithTasks = userFarms
      .map((farm) => {
        const farmId = getId(farm);

        const farmReports = allReports.filter((report) => {
          return String(getReportFarmId(report)) === String(farmId);
        });

       const tasks = extractTasksForSelectedDate(farmReports, farm);

       const palmTypesMap = {};
       tasks.forEach(t => {
          const ptId = t.palmTypeId || 'unspecified';
          if (!palmTypesMap[ptId]) {
            palmTypesMap[ptId] = {
              id: ptId,
              name: t.palmTypeName || 'غير محدد',
              tasks: []
            };
          }
          palmTypesMap[ptId].tasks.push(t);
       });
       const palmTypesWithTasks = Object.values(palmTypesMap);

        return {
          id: farmId,
          name:
            farm.name ||
            farm.farm_name ||
            farm.title ||
            farm.farmName ||
            "مزرعة بدون اسم",
          location:
            farm.location ||
            farm.address ||
            farm.area ||
            farm.city ||
            farm.governorate ||
            "",
          raw: farm,
          palmTypes: palmTypesWithTasks,
        };
      })
      .filter((farm) => farm.palmTypes.length > 0);

    if (farmsWithTasks.length) {
      result.push({
        id: userId,
        name: user.name || user.full_name || user.fullName || "عميل بدون اسم",
        phone: user.phone || user.mobile || user.phone_number || "",
        whatsapp:
          user.whatsapp ||
          user.whatsapp_number ||
          user.whats_app ||
          user.phone ||
          "",
        email: user.email || "",
        raw: user,
        farms: farmsWithTasks,
      });
    }
  });

  return result;
});

const filteredUsers = computed(() => {
  const term = normalizeSearch(search.value);

  if (!term) return groupedUsers.value;

  return groupedUsers.value.filter((user) => {
    const userText = normalizeSearch(
      [
        user.name,
        user.phone,
        user.whatsapp,
        user.email,
        ...user.farms.map((farm) => farm.name),
        ...user.farms.map((farm) => farm.location),
        ...user.farms.flatMap((farm) =>
          farm.palmTypes.flatMap((pt) => 
            pt.tasks.map((task) => {
              return [
                pt.name,
                task.title,
                task.description,
                ...(task.details || []).map(
                  (detail) => `${detail.label} ${detail.value}`
                ),
              ].join(" ");
            })
          )
        ),
      ].join(" ")
    );

    return userText.includes(term);
  });
});

const totalFarms = computed(() => {
  return groupedUsers.value.reduce((sum, user) => sum + user.farms.length, 0);
});

const totalTasks = computed(() => {
  return groupedUsers.value.reduce((sum, user) => {
    return (
      sum +
      user.farms.reduce((farmSum, farm) => farmSum + farm.palmTypes.reduce((ptSum, pt) => ptSum + pt.tasks.length, 0), 0)
    );
  }, 0);
});

onMounted(() => {
  loadData();
});

async function loadData() {
  loading.value = true;
  errorMessage.value = "";
  selectedTasks.value = {};

  try {
    const [usersData, farmsData, reportsData] = await Promise.all([
      fetchAll("/users"),
      fetchAll("/farms"),
      fetchAll("/reports"),
    ]);

    users.value = usersData;
    farms.value = farmsData;
    reports.value = reportsData;
  } catch (error) {
    console.error(error);
    errorMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      "فشل تحميل البيانات من السيرفر.";
  } finally {
    loading.value = false;
  }
}

async function fetchAll(url) {
  const all = [];
  let page = 1;
  let lastPage = 1;

  do {
    const response = await axiosClient.get(url, {
      params: {
        page,
        per_page: 1000,
      },
    });

    const payload = response?.data;

    const items =
      payload?.data?.data ||
      payload?.data?.items ||
      payload?.data ||
      payload?.items ||
      payload?.records ||
      payload ||
      [];

    if (Array.isArray(items)) {
      all.push(...items);
    }

    lastPage =
      payload?.data?.last_page ||
      payload?.data?.lastPage ||
      payload?.last_page ||
      payload?.lastPage ||
      payload?.meta?.last_page ||
      payload?.meta?.lastPage ||
      1;

    page++;
  } while (page <= Number(lastPage || 1));

  return all;
}

function goToTaskDetails(user, farm, palmType) {
  const dataToPass = {
    userId: user.id,
    date: selectedIso.value,
    farmId: farm.id,
    farmName: farm.name,
    palmTypeId: palmType.id,
    palmTypeName: palmType.name,
    tasks: palmType.tasks,
  };
  localStorage.setItem('admin_task_details', JSON.stringify(dataToPass));
  
  router.push({
    name: 'task_details',
    params: { farmId: farm.id, palmTypeId: palmType.id }
  });
}

function toggleTaskDetails(farm, task, taskIndex) {
  const key = getFarmSelectionKey(farm);
  const taskKey = getTaskSelectionKey(task, taskIndex);

  if (selectedTasks.value[key] === taskKey) {
    selectedTasks.value = {
      ...selectedTasks.value,
      [key]: null,
    };
    return;
  }

  selectedTasks.value = {
    ...selectedTasks.value,
    [key]: taskKey,
  };
}

function closeTaskDetails(farm) {
  const key = getFarmSelectionKey(farm);

  selectedTasks.value = {
    ...selectedTasks.value,
    [key]: null,
  };
}

function selectedTaskForFarm(farm) {
  const key = getFarmSelectionKey(farm);
  const selectedKey = selectedTasks.value[key];

  if (!selectedKey) return null;

  return farm.tasks.find((task, index) => {
    return getTaskSelectionKey(task, index) === selectedKey;
  });
}

function isTaskSelected(farm, task, taskIndex) {
  const key = getFarmSelectionKey(farm);

  return selectedTasks.value[key] === getTaskSelectionKey(task, taskIndex);
}

function getFarmSelectionKey(farm) {
  return String(farm?.id || farm?.name || "");
}

function getTaskSelectionKey(task, index) {
  return `${task.type}-${task.title}-${index}`;
}

function normalizeUsers(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeFarms(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeReports(value) {
  return Array.isArray(value) ? value : [];
}

function getId(item) {
  return item?.id || item?._id || item?.uuid || "";
}

function getFarmOwnerId(farm) {
  return (
    farm?.user_id ||
    farm?.userId ||
    farm?.owner_id ||
    farm?.ownerId ||
    farm?.farm_owner_id ||
    farm?.farmOwnerId ||
    farm?.client_id ||
    farm?.clientId ||
    farm?.user?.id ||
    farm?.owner?.id ||
    ""
  );
}

function getReportFarmId(report) {
  return (
    report?.farm_id ||
    report?.farmId ||
    report?.farm?.id ||
    report?.farm?._id ||
    ""
  );
}

function getLatestReport(reportList) {
  if (!reportList.length) return null;

  return [...reportList].sort((a, b) => {
    const dateA = new Date(
      a.updated_at || a.created_at || a.date || a.report_date || 0
    ).getTime();

    const dateB = new Date(
      b.updated_at || b.created_at || b.date || b.report_date || 0
    ).getTime();

    return dateB - dateA;
  })[0];
}

function extractTasksForSelectedDate(reports, farm) {
  const reportsArray = Array.isArray(reports) ? reports : [reports];
  const allTasks = [];

  const isSelectedDay = (day) => {
    const raw = day?.date ?? day?.day_date ?? day?.task_date ?? day?.execution_date;
    if (!raw) return false;
    return String(raw).slice(0, 10) === selectedIso.value;
  };

  const walkDaysInReport = (report) => {
    const weeks = Array.isArray(report?.report_weeks)
      ? report.report_weeks
      : [];
    const days = [];

    weeks.forEach((week) => {
      if (!week) return;
      const weekDays = Array.isArray(week?.days) ? week.days : [];
      weekDays.forEach((d) => days.push(d));
    });

    return days;
  };

  reportsArray.forEach((report) => {
    if (!report) return;

    let palmTypeName = "غير محدد";
    let palmTypeId = "unspecified";
    let palmCount = 0;
    if (farm && farm?.palm_types && report?.palm_type_id) {
      const pt = farm.palm_types.find((p) => String(p.id) === String(report.palm_type_id));
      if (pt) {
         palmTypeName = pt.name;
         palmTypeId = pt.id;
         palmCount = Number(pt.number_of_trees || 0);
      } else {
         palmTypeId = report.palm_type_id;
      }
    } else if (report?.palm_type_id) {
      palmTypeId = report.palm_type_id;
    }

    const reportDays = walkDaysInReport(report);

    reportDays.forEach((dayObject) => {
      if (!isSelectedDay(dayObject)) return;

      const dayTasks = extractTasksFromDay(dayObject, palmTypeName, palmTypeId, palmCount);

      dayTasks.forEach((task) => {
        const existingTask = allTasks.find(
          (t) => t.type === task.type && t.title === task.title,
        );

        // لو المهمة موجودة قبل كده نجمع التفاصيل
        if (existingTask) {
          const existingDetails = existingTask.details || [];
          const newDetails = task.details || [];

          existingTask.details = dedupeDetails([
            ...existingDetails,
            ...newDetails,
          ]);
        } else {
          allTasks.push({
            ...task,
            details: dedupeDetails(task.details || []),
          });
        }
      });
    });
  });

  return dedupeTasks(allTasks);
}
function dedupeDetails(details) {
  const seen = new Set();

  return details.filter((detail) => {
    const key = `${detail.label}-${detail.value}`;

    if (seen.has(key)) return false;

    seen.add(key);

    return true;
  });
}

function findMatchingDayObjects(root) {
  const result = [];
  const visited = new WeakSet();

  if (!root || typeof root !== "object") {
    return result;
  }

  function walk(value, depth = 0) {
    if (!value || typeof value !== "object") return;
    if (visited.has(value)) return;
    if (depth > 8) return; // Allow deeper search

    visited.add(value);

    if (Array.isArray(value)) {
      value.forEach((item) => walk(item, depth + 1));
      return;
    }

    if (isSelectedDayObject(value)) {
      result.push(value);
      return; // Stop here, don't go deeper into this day object
    }

    // Skip certain keys that likely contain old/nested data
    const keysToSkip = [
      "archived",
      "deleted",
      "old",
      "history",
      "backup",
      "created_by",
      "updated_by",
    ];

    for (const [key, child] of Object.entries(value)) {
      if (keysToSkip.some((skip) => key.toLowerCase().includes(skip))) continue;
      if (child && typeof child === "object") {
        walk(child, depth + 1);
      }
    }
  }

  walk(root);
  return result;
}

function isSelectedDayObject(obj) {
  const dateKeys = [
    "date",
    "task_date",
    "day_date",
    "execution_date",
    "created_for",
  ];

  for (const key of dateKeys) {
    if (obj[key] && String(obj[key]).slice(0, 10) === selectedIso.value) {
      return true;
    }
  }

  const dayKeys = [
    "day",
    "day_name",
    "dayName",
    "weekday",
    "week_day",
    "weekDay",
    "name",
    "title",
  ];

  const selectedAr = normalizeText(selectedDayName.value);
  const selectedEn = normalizeText(selectedDayNameEn.value);

  for (const key of dayKeys) {
    if (!obj[key]) continue;

    const value = normalizeText(String(obj[key]));

    if (
      value === selectedAr ||
      value.includes(selectedAr) ||
      value === selectedEn ||
      value.includes(selectedEn)
    ) {
      return true;
    }
  }

  return false;
}

function extractTasksFromDay(day, palmTypeName, palmTypeId, palmCount = 0) {
  const tasks = [];

  const irrigationTask = buildIrrigationTask(day, palmTypeName, palmCount);
  if (irrigationTask) {
    irrigationTask.palmTypeId = palmTypeId;
    irrigationTask.palmTypeName = palmTypeName;
    tasks.push(irrigationTask);
  }

  const fertilizerTasks = buildFertilizerTasks(day, palmTypeName, palmCount);
  fertilizerTasks.forEach(t => {
    t.palmTypeId = palmTypeId;
    t.palmTypeName = palmTypeName;
    tasks.push(t);
  });

  const sprayTasks = buildSprayTasks(day, palmTypeName, palmCount);
  sprayTasks.forEach(t => {
    t.palmTypeId = palmTypeId;
    t.palmTypeName = palmTypeName;
    tasks.push(t);
  });

  return dedupeTasks(tasks);
}

function buildIrrigationTask(day, palmTypeName, palmCount = 0) {
  const irrigationPerTree = Number(day?.irrigation_amount_per_palm_tree || day?.irrigation_amount_per_palm || day?.irrigation_per_palm || 0);
  const durationPerTreeMinutes = Number(
    day?.duration_of_irrigation_per_palm_tree ||
      day?.duration_of_irrigation_per_palm ||
      day?.irrigation_duration_per_palm ||
      day?.duration_per_palm ||
      day?.duration_per_palm_tree ||
      0,
  );

  // إجمالي القيم (إن كانت محسوبة في الـAPI) أو نعرضها فقط إن وجدت
  const totalWater = Number(
    day?.total_amount_of_irrigation ||
      day?.total_irrigation ||
      day?.total_water ||
      day?.total_water_quantity ||
      0,
  );

  const totalDuration = day?.total_duration_of_irrigation || day?.total_duration || day?.total_irrigation_time;

  const hasIrrigation = irrigationPerTree > 0 || durationPerTreeMinutes > 0;

  if (!hasIrrigation) return null;

  const details = [];

  if (palmTypeName && palmTypeName !== "غير محدد") {
    pushDetail(details, "نوع النخل", palmTypeName);
  }

  // بالاعتماد على UI: totalDuration عادة تكون string جاهزة (مثل "2 ساعة 10 دقيقة")
  pushDetail(details, "كمية الري لكل نخلة", irrigationPerTree, "لتر");
  if (totalWater > 0) pushDetail(details, "إجمالي كمية الري", totalWater, "لتر");
  if (durationPerTreeMinutes > 0)
    pushDetail(details, "مدة الري لكل نخلة", durationPerTreeMinutes, "دقيقة");
  if (hasRealValue(totalDuration)) pushDetail(details, "إجمالي مدة الري", totalDuration);

  return {
    type: "irrigation",
    title: palmTypeName && palmTypeName !== "غير محدد" ? `ري (${palmTypeName})` : "ري",
    icon: "💧",
    description: `عنده مهمة ري بكرة${palmTypeName && palmTypeName !== "غير محدد" ? ` لـ ${palmTypeName}` : ""}`,
    details,
  };
}

function buildFertilizerTasks(day, palmTypeName, palmCount = 0) {
  const fertilizations = Array.isArray(day?.fertilizations) ? day.fertilizations : [];

  const realFertilizations = fertilizations.filter((f) => {
    const typeId = f?.fertilizer_type_id;
    const typeName = f?.type_of_fertilization;
    const qty = Number(f?.fertilizer_quantity_per_palm_tree || f?.fertilizer_quantity_per_palm || 0);
    return (
      hasRealValue(typeId) ||
      hasRealValue(typeName) ||
      qty > 0 ||
      hasRealValue(f?.fertilizer_quantity_per_palm_tree)
    );
  });

  if (!realFertilizations.length) return [];

  return realFertilizations.map((fertilization, index) => {
    const typeName =
      fertilization?.type_of_fertilization ||
      fertilization?.fertilizer_type_name ||
      fertilization?.fertilizer_type ||
      fertilization?.fertilizer_name ||
      fertilization?.fertilizerName ||
      fertilization?.acid_name ||
      fertilization?.acidName ||
      `نوع ${index + 1}`;

    const palmQuantity = Number(
      fertilization?.fertilizer_quantity_per_palm_tree ||
      fertilization?.fertilizer_quantity_per_palm ||
      0
    );

    let totalQty = Number(
      fertilization?.total || fertilization?.fertilizer_total || fertilization?.fertilizer_total_kg || 0
    );
    
    // Compute total if missing and we have per-tree amount and palmCount
    if (totalQty === 0 && palmQuantity > 0 && palmCount > 0) {
      totalQty = (palmQuantity * palmCount) / 1000;
    }

    const details = [];

    if (palmQuantity > 0) pushDetail(details, "كمية التسميد لكل نخلة", palmQuantity, "جرام");
    if (totalQty > 0) pushDetail(details, "إجمالي كمية التسميد", totalQty, "كجم");

    const palmSuffix = palmTypeName && palmTypeName !== "غير محدد" ? ` (${palmTypeName})` : "";

    return {
      type: "fertilizer",
      title: `تسميد: ${typeName}${palmSuffix}`,
      icon: "🌱",
      description: `مهمة تسميد بـ ${typeName}${palmSuffix}`,
      details,
    };
  });
}

function buildSprayTasks(day, palmTypeName, palmCount = 0) {
  const typeName = day?.spraying || day?.spray_type || day?.sprayName || day?.spray_name;
  const perTreeGrams = Number(day?.amount_of_spray || day?.spray_amount_per_palm || 0);
  let totalSpray = Number(
    day?.total_amount_of_spray ||
      day?.total_spray ||
      day?.spray_total ||
      0,
  );
  
  // Compute total if missing
  if (totalSpray === 0 && perTreeGrams > 0 && palmCount > 0) {
    totalSpray = (perTreeGrams * palmCount) / 1000;
  }

  const hasSpray = hasRealValue(typeName) || perTreeGrams > 0 || totalSpray > 0;

  if (!hasSpray) return [];

  const details = [];

  if (palmTypeName && palmTypeName !== "غير محدد") {
    pushDetail(details, "نوع النخل", palmTypeName);
  }

  if (hasRealValue(typeName)) pushDetail(details, "نوع المبيد", typeName);
  if (perTreeGrams > 0) pushDetail(details, "كمية المبيد لكل نخلة", perTreeGrams, "جرام");
  if (totalSpray > 0) pushDetail(details, "إجمالي كمية المبيد", totalSpray, "كجم");

  return [
    {
      type: "spray",
      title: palmTypeName && palmTypeName !== "غير محدد" ? `رش (${palmTypeName})` : "رش",
      icon: "🚁",
      description: `عنده مهمة رش بكرة${palmTypeName && palmTypeName !== "غير محدد" ? ` لـ ${palmTypeName}` : ""}`,
      details,
    },
  ];
}

function extractSprayItemsFromDay(day) {
  const items = [];
  const visited = new WeakSet();

  function walk(value, keyPath = "", isRoot = false) {
    if (!value || typeof value !== "object") return;
    if (visited.has(value)) return;
    visited.add(value);

    const isArray = Array.isArray(value);

    if (!isRoot && !isArray) {
      const normalizedPath = normalizeKey(keyPath);
      const isSprayRelatedPath = ["spray", "pesticide", "رش", "مبيد"].some(kw => normalizedPath.includes(normalizeKey(kw)));

      const keys = Object.keys(value);
      const spraySpecificKeys = [
        "نوع المبيد", "اسم المبيد", "pesticide_type", "pesticide_name", "spray_type", "spray_name", "كمية المبيد", "pesticide_quantity", "spray_quantity"
      ];
      
      const hasSpraySpecificKey = keys.some(k => {
        const normK = normalizeKey(k);
        return spraySpecificKeys.some(sk => normK.includes(normalizeKey(sk)));
      });

      if (isSprayRelatedPath || hasSpraySpecificKey) {
        items.push(value);
      }
    }

    if (isArray) {
      value.forEach((item) => {
        walk(item, keyPath, false);
      });
    } else {
      for (const [k, v] of Object.entries(value)) {
        walk(v, k, false);
      }
    }
  }

  walk(day, "", true);

  return [...new Set(items)];
}

function extractSprayFieldValue(sprayItem, specificKeys, genericHint = "name") {
  if (!sprayItem || typeof sprayItem !== "object") return "";

  const keys = Object.keys(sprayItem);
  const normalizedSpecificKeys = specificKeys.map(k => normalizeKey(k));

  let matchedValue = "";

  for (const key of keys) {
    const normKey = normalizeKey(key);
    const isSpecificMatch = normalizedSpecificKeys.some(sk => 
      normKey === sk || normKey.includes(sk) || sk.includes(normKey)
    );
    
    if (isSpecificMatch && hasRealValue(sprayItem[key])) {
      if (typeof sprayItem[key] !== "object") {
        return sprayItem[key];
      } else {
        const objVal = extractNameFromObject(sprayItem[key]);
        if (hasRealValue(objVal)) return objVal;
      }
    }
  }

  let genericKeys = [];
  let forbiddenKeys = [];
  
  if (genericHint === "name") {
    genericKeys = ["name", "title", "type", "material", "product", "اسم", "نوع", "مبيد", "pesticide", "spray"];
    forbiddenKeys = ["quantity", "amount", "total", "dose", "كمية", "اجمالي", "إجمالي", "جرعة", "per_palm", "للنخلة"];
  } else if (genericHint === "quantity") {
    genericKeys = ["quantity", "amount", "dose", "per_palm", "كمية", "جرعة", "للنخلة", "معدل", "rate"];
    forbiddenKeys = ["total", "اجمالي", "إجمالي", "sum"];
  } else if (genericHint === "total") {
    genericKeys = ["total", "اجمالي", "إجمالي", "sum", "كجم", "لتر", "kg", "liter"];
    forbiddenKeys = ["per_palm", "للنخلة", "name", "type", "اسم", "نوع"];
  }

  const normalizedGenericKeys = genericKeys.map(k => normalizeKey(k));
  const normalizedForbiddenKeys = forbiddenKeys.map(k => normalizeKey(k));

  for (const key of keys) {
    const normKey = normalizeKey(key);
    
    const isForbidden = normalizedForbiddenKeys.some(fk => normKey.includes(fk));
    if (isForbidden) continue;

    const isGenericMatch = normalizedGenericKeys.some(gk => normKey === gk || normKey.includes(gk));
    
    if (isGenericMatch && hasRealValue(sprayItem[key])) {
      if (typeof sprayItem[key] !== "object") {
        return sprayItem[key];
      } else {
        const objVal = extractNameFromObject(sprayItem[key]);
        if (hasRealValue(objVal)) return objVal;
      }
    }
  }

  for (const key of keys) {
    if (genericHint === "name" && typeof sprayItem[key] === "string" && hasRealValue(sprayItem[key])) {
       const normKey = normalizeKey(key);
       const isForbidden = ["quantity", "amount", "total", "dose", "كمية", "اجمالي", "إجمالي"].some(fk => normKey.includes(normalizeKey(fk)));
       if (!isForbidden) return sprayItem[key];
    }
    if ((genericHint === "quantity" || genericHint === "total") && typeof sprayItem[key] === "number" && hasRealValue(sprayItem[key])) {
       return sprayItem[key];
    }
  }

  return "";
}

function getAllReportValues(
  root,
  {
    exactKeys = [],
    taskMarkers = [],
    fieldMarkers = [],
    forbiddenMarkers = [],
    preferText = false,
  }
) {
  if (!root || typeof root !== "object") return [];

  const entries = flattenReportEntries(root);

  const normalizedExactKeys = exactKeys.map((key) => normalizeKey(key));
  const normalizedTaskMarkers = taskMarkers.map((key) => normalizeKey(key));
  const normalizedFieldMarkers = fieldMarkers.map((key) => normalizeKey(key));
  const normalizedForbiddenMarkers = forbiddenMarkers.map((key) =>
    normalizeKey(key)
  );

  const results = [];

  entries.forEach((entry) => {
    const exactMatch = normalizedExactKeys.some((key) => {
      return entry.key === key || entry.path.includes(key);
    });

    const hasTaskMarker = normalizedTaskMarkers.some((marker) => {
      return entry.path.includes(marker);
    });

    const hasFieldMarker = normalizedFieldMarkers.some((marker) => {
      return entry.path.includes(marker);
    });

    const hasForbidden = hasForbiddenMarker(
      entry.path,
      normalizedForbiddenMarkers
    );

    const valid =
      (exactMatch || (hasTaskMarker && hasFieldMarker)) &&
      !hasForbidden &&
      hasRealValue(entry.value);

    if (!valid) return;

    const value = extractReportEntryValue(entry);

    if (!hasRealValue(value)) return;

    if (preferText && typeof value !== "string") return;

    results.push(String(value).trim());
  });

  return [...new Set(results)];
}

function getReportValue(
  root,
  {
    exactKeys = [],
    taskMarkers = [],
    fieldMarkers = [],
    forbiddenMarkers = [],
    preferText = false,
  }
) {
  if (!root || typeof root !== "object") return "";

  const entries = flattenReportEntries(root);

  const normalizedExactKeys = exactKeys.map((key) => normalizeKey(key));
  const normalizedTaskMarkers = taskMarkers.map((key) => normalizeKey(key));
  const normalizedFieldMarkers = fieldMarkers.map((key) => normalizeKey(key));
  const normalizedForbiddenMarkers = forbiddenMarkers.map((key) => normalizeKey(key));

  const exactMatches = entries
    .filter((entry) => {
      return normalizedExactKeys.some((key) => {
        return entry.key === key || entry.path.includes(key);
      });
    })
    .filter((entry) => hasRealValue(entry.value))
    .filter((entry) => !hasForbiddenMarker(entry.path, normalizedForbiddenMarkers))
    .sort((a, b) => b.score - a.score);

  if (exactMatches.length) {
    return extractReportEntryValue(exactMatches[0]);
  }

  const scored = entries
    .map((entry) => {
      let score = 0;

      const hasTaskMarker = normalizedTaskMarkers.some((marker) => {
        return entry.path.includes(marker);
      });

      const hasFieldMarker = normalizedFieldMarkers.some((marker) => {
        return entry.path.includes(marker);
      });

      const hasForbidden = hasForbiddenMarker(entry.path, normalizedForbiddenMarkers);

      if (hasTaskMarker) score += 50;
      if (hasFieldMarker) score += 40;
      if (preferText && typeof entry.value === "string") score += 20;
      if (!preferText && typeof entry.value === "number") score += 10;
      if (hasForbidden) score -= 100;
      if (!hasTaskMarker) score -= 60;
      if (!hasFieldMarker) score -= 60;

      return {
        ...entry,
        score,
      };
    })
    .filter((entry) => entry.score > 0)
    .filter((entry) => hasRealValue(entry.value))
    .sort((a, b) => b.score - a.score);

  if (scored.length) {
    return extractReportEntryValue(scored[0]);
  }

  return "";
}

function flattenReportEntries(root, maxDepth = 5) {
  const entries = [];
  const visited = new WeakSet();

  function walk(value, pathParts = [], currentDepth = 0) {
    // Depth limit to prevent deep nested searches
    if (currentDepth > maxDepth) return;

    if (value === null || value === undefined || value === "") return;

    if (typeof value !== "object") {
      const rawKey = pathParts[pathParts.length - 1] || "";
      const normalizedPath = normalizeKey(pathParts.join("_"));
      const normalizedKey = normalizeKey(rawKey);

      if (!isIgnoredEntryKey(normalizedPath)) {
        entries.push({
          key: normalizedKey,
          path: normalizedPath,
          value,
          score: pathParts.length,
        });
      }

      return;
    }

    if (visited.has(value)) return;
    visited.add(value);

    if (Array.isArray(value)) {
      // For arrays, only process first few items at deep levels
      const itemsToProcess = currentDepth > 3 ? Math.min(value.length, 3) : value.length;

      for (let index = 0; index < itemsToProcess; index++) {
        const item = value[index];
        walk(item, [...pathParts, `item${index + 1}`], currentDepth + 1);
      }
      return;
    }

    // Skip problematic keys early
    if (shouldSkipKeyDuringWalk(pathParts[pathParts.length - 1])) {
      return;
    }

    const objectName = extractNameFromObject(value);

    if (hasRealValue(objectName)) {
      const rawKey = pathParts[pathParts.length - 1] || "name";
      const normalizedPath = normalizeKey([...pathParts, "name"].join("_"));

      if (!isIgnoredEntryKey(normalizedPath)) {
        entries.push({
          key: normalizeKey(rawKey),
          path: normalizedPath,
          value: objectName,
          score: pathParts.length + 4,
        });
      }
    }

    Object.entries(value).forEach(([key, itemValue]) => {
      walk(itemValue, [...pathParts, key], currentDepth + 1);
    });
  }

  walk(root);

  return entries;
}

function shouldSkipKeyDuringWalk(key) {
  if (!key) return false;

  const keyLower = String(key).toLowerCase();
  const skipPatterns = [
    "archive",
    "deleted",
    "old",
    "history",
    "backup",
    "metadata",
    "meta",
    "created_by",
    "updated_by",
    "timestamps",
    "audit",
    "logs",
  ];

  return skipPatterns.some((pattern) => keyLower.includes(pattern));
}

function extractReportEntryValue(entry) {
  if (!entry) return "";

  if (typeof entry.value === "object") {
    const nameValue = extractNameFromObject(entry.value);
    if (hasRealValue(nameValue)) return nameValue;
  }

  return entry.value;
}

function hasForbiddenMarker(path, forbiddenMarkers) {
  if (!forbiddenMarkers.length) return false;

  return forbiddenMarkers.some((marker) => {
    return path.includes(marker);
  });
}

function isIgnoredEntryKey(path) {
  const ignored = [
    "id",
    "uuid",
    "createdat",
    "updatedat",
    "deletedat",
    "date",
    "daydate",
    "email",
    "phone",
    "whatsapp",
    "pivot",
  ];

  return ignored.some((key) => path === key || path.endsWith(key));
}

function pushDetail(details, label, value, unit = "") {
  if (!hasRealValue(value)) return;

  const cleanValue = toEnglishNumbers(formatValue(value));
  const cleanUnit = String(unit || "").trim();

  details.push({
    label,
    value: cleanUnit ? `${cleanValue} ${cleanUnit}` : cleanValue,
  });
}

function extractNameFromObject(value) {
  if (!value || typeof value !== "object") return "";

  return (
    value.name ||
    value.title ||
    value.type_name ||
    value.typeName ||
    value.material_name ||
    value.materialName ||
    value.product_name ||
    value.productName ||
    value.fertilizer_name ||
    value.fertilizerName ||
    value.pesticide_name ||
    value.pesticideName ||
    value.acid_name ||
    value.acidName ||
    value.name_ar ||
    value.nameAr ||
    value.name_en ||
    value.nameEn ||
    ""
  );
}

function hasRealValue(value) {
  if (value === null || value === undefined || value === "") return false;

  if (typeof value === "number") return value > 0;

  if (typeof value === "string") {
    const clean = normalizeSearch(value);

    if (!clean) return false;

    const emptyValues = [
      "0",
      "0.0",
      "0.00",
      "لا يوجد",
      "لايوجد",
      "غير موجود",
      "none",
      "null",
      "undefined",
      "false",
      "-",
    ];

    return !emptyValues.includes(clean);
  }

  if (Array.isArray(value)) return value.some((item) => hasRealValue(item));

  if (typeof value === "object") {
    return Object.values(value).some((item) => hasRealValue(item));
  }

  return Boolean(value);
}

function formatValue(value) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US").format(value);
  }

  return String(value || "").trim();
}

function dedupeTasks(tasks) {
  const seen = new Set();

  return tasks.filter((task) => {
    const key = `${task.type}-${task.title}`;

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSearch(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit))
    .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[()（）[\]{}]/g, "")
    .replace(/[،,:؛.]/g, "")
    .replace(/[\s_-]+/g, "")
    .trim();
}

function toEnglishNumbers(value) {
  return String(value)
    .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit))
    .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit));
}
</script>

<style lang="scss" scoped>
.admin-tasks-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
  direction: rtl;
}

.tasks-hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  gap: 28px;
  padding: 34px;
  border-radius: 30px;
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.28), transparent 34%),
    linear-gradient(135deg, #071426 0%, #0f2f2a 48%, #12351f 100%);
  color: #ffffff;
  box-shadow: 0 24px 55px rgba(15, 23, 42, 0.18);
}

.tasks-hero::before {
  content: "";
  position: absolute;
  inset: -80px auto auto -80px;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.24);
  filter: blur(6px);
}

.tasks-hero__content {
  position: relative;
  z-index: 1;
}

.tasks-hero__badge {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 10px 18px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: #d9f99d;
  font-size: 15px;
  font-weight: 900;
}

.tasks-hero__badge-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 8px rgba(34, 197, 94, 0.15);
}

.tasks-hero h1 {
  margin: 20px 0 14px;
  font-size: clamp(42px, 4.5vw, 68px);
  line-height: 1;
  font-weight: 950;
  letter-spacing: -1px;
}

.tasks-hero p {
  max-width: 820px;
  margin: 0;
  color: rgba(255, 255, 255, 0.84);
  font-size: 20px;
  line-height: 2;
  font-weight: 700;
}

.tasks-hero__date {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  margin-top: 28px;
}

.tasks-hero__date span,
.tasks-hero__date strong {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 58px;
  padding: 14px 26px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  font-size: 18px;
  font-weight: 950;
  line-height: 1;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.tasks-hero__date span {
  color: #bbf7d0;
  min-width: 95px;
}

.tasks-hero__date strong {
  min-width: 170px;
  letter-spacing: 0.2px;
}

.tasks-hero__stats {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  align-content: end;
}

.stat-card {
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.13);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(12px);
}

.stat-card span {
  color: rgba(255, 255, 255, 0.78);
  font-size: 16px;
  font-weight: 900;
}

.stat-card strong {
  color: #ffffff;
  font-size: 50px;
  line-height: 1;
  font-weight: 950;
}

.tasks-toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
}

.tasks-toolbar__search {
  flex: 1;
  min-height: 68px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 22px;
  border-radius: 22px;
  background: #ffffff;
  border: 1px solid #dbe3ee;
  box-shadow: 0 14px 35px rgba(15, 23, 42, 0.07);
}

.tasks-toolbar__search span {
  color: #64748b;
  font-size: 34px;
  line-height: 1;
}

.tasks-toolbar__search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
}

.tasks-toolbar__search input::placeholder {
  color: #94a3b8;
  font-weight: 700;
}

.refresh-btn {
  min-height: 68px;
  padding: 0 28px;
  border: 0;
  border-radius: 22px;
  background: #0f766e;
  color: #ffffff;
  font-size: 16px;
  font-weight: 950;
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(15, 118, 110, 0.24);
  transition: 0.2s ease;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  background: #115e59;
}

.tasks-loading,
.tasks-empty,
.tasks-error {
  min-height: 320px;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 40px;
  border-radius: 30px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
}

.tasks-loading p,
.tasks-empty p,
.tasks-error p {
  margin: 12px 0 0;
  color: #64748b;
  font-size: 18px;
  font-weight: 800;
}

.tasks-empty__icon {
  font-size: 68px;
  margin-bottom: 16px;
}

.tasks-empty h3,
.tasks-error h3 {
  margin: 0;
  color: #0f172a;
  font-size: 32px;
  font-weight: 950;
}

.tasks-error button {
  margin-top: 20px;
  border: 0;
  padding: 16px 24px;
  border-radius: 16px;
  background: #ef4444;
  color: #ffffff;
  font-size: 16px;
  font-weight: 950;
  cursor: pointer;
}

.loader {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 5px solid #dbeafe;
  border-top-color: #0f766e;
  animation: spin 0.8s linear infinite;
}

.users-tasks-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
}

.user-task-card {
  overflow: hidden;
  border-radius: 32px;
  background: #ffffff;
  border: 1px solid #dbe3ee;
  box-shadow: 0 20px 55px rgba(15, 23, 42, 0.08);
}

.user-task-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  padding: 30px;
  background:
    linear-gradient(135deg, rgba(240, 253, 244, 0.98), rgba(255, 255, 255, 1)),
    #ffffff;
  border-bottom: 1px solid #dcfce7;
}

.user-main {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
}

.user-avatar {
  width: 76px;
  height: 76px;
  flex: 0 0 76px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  background: linear-gradient(135deg, #0f766e, #22c55e);
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(15, 118, 110, 0.24);
}

.user-avatar__icon {
  width: 38px;
  height: 38px;
  display: block;
  color: #ffffff;
}

.user-info {
  min-width: 0;
}

.user-main h2 {
  margin: 0 0 12px;
  color: #0f172a;
  font-size: 30px;
  font-weight: 950;
  line-height: 1.25;
}

.user-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.user-meta span {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 9px 14px;
  border-radius: 999px;
  background: #f8fafc;
  color: #334155;
  font-size: 15px;
  font-weight: 900;
  border: 1px solid #dbe3ee;
}

.user-summary {
  min-width: 150px;
  min-height: 96px;
  display: grid;
  place-items: center;
  padding: 16px;
  border-radius: 24px;
  background: #0f172a;
  color: #ffffff;
}

.user-summary span {
  color: #cbd5e1;
  font-size: 15px;
  font-weight: 800;
}

.user-summary strong {
  font-size: 44px;
  line-height: 1;
  font-weight: 950;
}

.user-summary small {
  color: #86efac;
  font-size: 14px;
  font-weight: 950;
}

.farms-tasks-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(420px, 1fr));
  gap: 24px;
  padding: 26px;
  background: #f8fafc;
}

.farm-task-card {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 28px;
  border-radius: 30px;
  background: #ffffff;
  border: 1px solid #dbe3ee;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.06);
}

.farm-task-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.farm-label {
  color: #0f766e;
  font-size: 15px;
  font-weight: 950;
}

.farm-task-card h3 {
  margin: 8px 0 0;
  color: #0f172a;
  font-size: 28px;
  font-weight: 950;
  line-height: 1.35;
}

.farm-count {
  min-width: 86px;
  min-height: 86px;
  display: grid;
  place-items: center;
  padding: 10px 12px;
  border-radius: 24px;
  background: #ecfeff;
  color: #155e75;
  font-size: 34px;
  font-weight: 950;
}

.farm-count span {
  font-size: 14px;
  font-weight: 950;
}

.farm-location {
  width: fit-content;
  padding: 10px 15px;
  border-radius: 999px;
  background: #f8fafc;
  color: #475569;
  font-size: 15px;
  font-weight: 900;
  border: 1px solid #dbe3ee;
}

.task-type-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(150px, 1fr));
  gap: 16px;
}

.task-type-card {
  min-height: 155px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  border-radius: 24px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  text-align: right;
  cursor: pointer;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;
}

.task-type-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 35px rgba(15, 23, 42, 0.1);
}

.task-type-card--active {
  transform: translateY(-3px);
  box-shadow: 0 20px 42px rgba(15, 23, 42, 0.14);
}

.task-type-card--palm {
  background: linear-gradient(135deg, #f0f9ff, #ffffff);
  border-color: #bae6fd;
}

.task-type-card__icon {
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: #ffffff;
  font-size: 34px;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.09);
}

.task-type-card__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-type-card__content strong {
  color: #0f172a;
  font-size: 24px;
  font-weight: 950;
  line-height: 1.2;
}

.task-type-card__content span {
  color: #334155;
  font-size: 16px;
  font-weight: 850;
  line-height: 1.7;
}

.task-type-card__hint {
  width: fit-content;
  padding: 7px 12px;
  border-radius: 999px;
  background: #ffffff;
  color: #64748b;
  font-size: 12px;
  font-weight: 950;
  border: 1px solid #e2e8f0;
}

.palm-tasks-count {
  display: block;
  font-size: 15px !important;
  color: #64748b !important;
}

.task-icons-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.task-mini-icon {
  font-size: 14px;
  font-weight: 850;
  padding: 6px 12px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.task-mini-icon--irrigation {
  background: #eff6ff;
  color: #0284c7;
  border: 1px solid #bae6fd;
}

.task-mini-icon--fertilizer {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.task-mini-icon--spray {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1350px) {
  .tasks-hero {
    grid-template-columns: 1fr;
  }

  .tasks-hero__stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .farms-tasks-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .task-type-grid {
    grid-template-columns: 1fr;
  }

  .task-detail-item {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .tasks-hero {
    padding: 24px;
    border-radius: 24px;
  }

  .tasks-hero h1 {
    font-size: 42px;
  }

  .tasks-hero p {
    font-size: 17px;
  }

  .tasks-hero__stats {
    grid-template-columns: 1fr;
  }

  .tasks-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .user-task-card__header {
    flex-direction: column;
    align-items: stretch;
  }

  .user-main {
    align-items: flex-start;
  }

  .user-summary {
    width: 100%;
  }

  .farms-tasks-grid {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .farm-task-card {
    padding: 20px;
  }

  .farm-task-card h3 {
    font-size: 24px;
  }

  .task-details-panel__header {
    flex-direction: column;
  }
}

.days-tabs-container {
  margin-top: 24px;
  margin-bottom: 24px;
}

.days-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.day-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px 24px 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.day-tab:hover {
  border-color: #94a3b8;
  background: #f8fafc;
}

.day-tab--active {
  background: #eff6ff;
  border-color: #3b82f6;
}

.day-tab__name {
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
}

.day-tab--active .day-tab__name {
  color: #1d4ed8;
}

.day-tab__badge {
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  color: #ffffff;
  font-size: 11px;
  font-weight: 900;
  padding: 4px 16px;
  border-radius: 0 0 8px 8px;
  letter-spacing: 0.5px;
  z-index: 2;
  white-space: nowrap;
}

.day-tab__badge--yesterday {
  background: #64748b;
  box-shadow: 0 4px 6px -1px rgba(100, 116, 139, 0.3);
}

.day-tab__badge--today {
  background: #10b981;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}

.day-tab__badge--tomorrow {
  background: #2563eb;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
}

.day-tab__date {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
}

.day-tab--active .day-tab__date {
  color: #3b82f6;
}
</style>