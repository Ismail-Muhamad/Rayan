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

          <h1>مهام يوم {{ tomorrowDayName }}</h1>

          <p>
            هنا هتشوف كل أصحاب المزارع اللي عندهم مهام يوم {{ tomorrowDayName }}
            الموافق {{ tomorrowDateLabel }}، عشان فريق المتابعة يقدر يتواصل معاهم
            قبل ميعاد التنفيذ.
          </p>

          <div class="tasks-hero__date">
            <span>{{ tomorrowDayName }}</span>
            <strong>{{ tomorrowDateLabel }}</strong>
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
        <p>جاري تحميل مهام بكرة...</p>
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
        <h3>مفيش مهام بكرة</h3>
        <p>
          مفيش عملاء عندهم مهام ليوم {{ tomorrowDayName }} حاليًا.
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
                  {{ toEnglishNumbers(farm.tasks.length) }}
                  <span>مهام</span>
                </div>
              </div>

              <div v-if="farm.location" class="farm-location">
                📍 {{ farm.location }}
              </div>

              <div class="task-type-grid">
                <div
                  v-for="(task, taskIndex) in farm.tasks"
                  :key="`${farm.id}-${task.type}-${taskIndex}`"
                  class="task-type-card"
                  :class="`task-type-card--${task.type}`"
                >
                  <div class="task-type-card__icon">
                    {{ task.icon }}
                  </div>

                  <div class="task-type-card__content">
                    <strong>{{ task.title }}</strong>
                    <span>{{ task.description }}</span>
                  </div>
                </div>
              </div>

              <div class="farm-task-card__footer">
                <span>جاهز للمتابعة قبل التنفيذ</span>
                <button type="button" @click="openWhatsapp(user, farm)">
                  واتساب
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

const loading = ref(false);
const errorMessage = ref("");
const search = ref("");

const users = ref([]);
const farms = ref([]);
const reports = ref([]);

const tomorrowDate = computed(() => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);
  return date;
});

const tomorrowIso = computed(() => {
  const y = tomorrowDate.value.getFullYear();
  const m = String(tomorrowDate.value.getMonth() + 1).padStart(2, "0");
  const d = String(tomorrowDate.value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
});

const tomorrowDayName = computed(() => {
  return new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
  }).format(tomorrowDate.value);
});

const tomorrowDayNameEn = computed(() => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(tomorrowDate.value);
});

const tomorrowDateLabel = computed(() => {
  const label = new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(tomorrowDate.value);

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

        const latestReport = getLatestReport(farmReports);
        const tasks = latestReport ? extractTomorrowTasks(latestReport) : [];

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
          tasks,
        };
      })
      .filter((farm) => farm.tasks.length > 0);

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
          farm.tasks.map((task) => {
            return [task.title, task.description].join(" ");
          })
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
      user.farms.reduce((farmSum, farm) => farmSum + farm.tasks.length, 0)
    );
  }, 0);
});

onMounted(() => {
  loadData();
});

async function loadData() {
  loading.value = true;
  errorMessage.value = "";

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
        per_page: 100,
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

function extractTomorrowTasks(report) {
  const matchingDays = findMatchingDayObjects(report);
  const tasks = [];

  matchingDays.forEach((dayObject) => {
    tasks.push(...extractTasksFromDay(dayObject));
  });

  return dedupeTasks(tasks);
}

function findMatchingDayObjects(root) {
  const result = [];
  const visited = new WeakSet();

  function walk(value) {
    if (!value || typeof value !== "object") return;

    if (visited.has(value)) return;
    visited.add(value);

    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    if (isTomorrowDayObject(value)) {
      result.push(value);
    }

    Object.values(value).forEach((child) => {
      if (child && typeof child === "object") {
        walk(child);
      }
    });
  }

  walk(root);

  return result;
}

function isTomorrowDayObject(obj) {
  const dateKeys = [
    "date",
    "task_date",
    "day_date",
    "execution_date",
    "created_for",
  ];

  for (const key of dateKeys) {
    if (obj[key] && String(obj[key]).slice(0, 10) === tomorrowIso.value) {
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

  const tomorrowAr = normalizeText(tomorrowDayName.value);
  const tomorrowEn = normalizeText(tomorrowDayNameEn.value);

  for (const key of dayKeys) {
    if (!obj[key]) continue;

    const value = normalizeText(String(obj[key]));

    if (
      value === tomorrowAr ||
      value.includes(tomorrowAr) ||
      value === tomorrowEn ||
      value.includes(tomorrowEn)
    ) {
      return true;
    }
  }

  return false;
}

function extractTasksFromDay(day) {
  const tasks = [];

  const hasIrrigation = detectTaskType(day, [
    "irrigation",
    "irrigations",
    "irrigation_data",
    "irrigationData",
    "irrigation_task",
    "irrigationTask",
    "water",
    "watering",
    "water_data",
    "waterData",
    "water_quantity",
    "waterQuantity",
    "water_per_palm",
    "waterPerPalm",
    "irrigation_quantity",
    "irrigationQuantity",
    "irrigation_per_palm",
    "irrigationPerPalm",
    "total_water",
    "totalWater",
    "total_irrigation",
    "totalIrrigation",
    "ري",
    "الري",
  ]);

  const hasFertilizer = detectTaskType(day, [
    "fertilization",
    "fertilizations",
    "fertilizer",
    "fertilizers",
    "fertilizer_tasks",
    "fertilization_tasks",
    "fertilizerTypes",
    "fertilizer_types",
    "fertilizing",
    "acid",
    "acids",
    "تسميد",
    "التسميد",
    "سماد",
    "اسمدة",
    "أسمدة",
    "احماض",
    "أحماض",
  ]);

  const hasSpray = detectTaskType(day, [
    "spraying",
    "sprays",
    "spray",
    "pesticide",
    "pesticides",
    "pesticide_tasks",
    "spraying_tasks",
    "pesticideTypes",
    "pesticide_types",
    "pesticideData",
    "رش",
    "الرش",
    "مبيد",
    "مبيدات",
  ]);

  if (hasIrrigation) {
    tasks.push({
      type: "irrigation",
      title: "ري",
      icon: "💧",
      description: "عنده مهمة ري بكرة",
    });
  }

  if (hasFertilizer) {
    tasks.push({
      type: "fertilizer",
      title: "تسميد",
      icon: "🌿",
      description: "عنده مهمة تسميد بكرة",
    });
  }

  if (hasSpray) {
    tasks.push({
      type: "spray",
      title: "رش",
      icon: "🧪",
      description: "عنده مهمة رش بكرة",
    });
  }

  return tasks;
}

function detectTaskType(day, keys) {
  if (!day || typeof day !== "object") return false;

  const sections = findTaskSections(day, keys);

  return sections.some((section) => sectionHasRealTaskValue(section));
}

function findTaskSections(root, keys) {
  if (!root || typeof root !== "object") return [];

  const sections = [];
  const normalizedKeys = keys.map((key) => normalizeKey(key));
  const ignoredContainerKeys = [
    "data",
    "items",
    "values",
    "fields",
    "details",
    "days",
    "weeks",
    "reports",
    "children",
  ];

  const visited = new WeakSet();

  function walk(value) {
    if (!value || typeof value !== "object") return;

    if (visited.has(value)) return;
    visited.add(value);

    if (Array.isArray(value)) {
      value.forEach((item) => walk(item));
      return;
    }

    Object.entries(value).forEach(([key, itemValue]) => {
      const normalizedKey = normalizeKey(key);

      const isIgnoredContainer = ignoredContainerKeys.includes(normalizedKey);

      const keyIsTarget =
        !isIgnoredContainer &&
        normalizedKeys.some((targetKey) => normalizedKey.includes(targetKey));

      if (keyIsTarget) {
        sections.push(itemValue);
        return;
      }

      if (itemValue && typeof itemValue === "object") {
        walk(itemValue);
      }
    });
  }

  walk(root);

  return sections;
}

function sectionHasRealTaskValue(section) {
  if (section === null || section === undefined || section === "") return false;

  if (typeof section === "number") return section > 0;

  if (typeof section === "string") {
    return isRealTaskString(section);
  }

  if (Array.isArray(section)) {
    return section.some((item) => sectionHasRealTaskValue(item));
  }

  if (typeof section === "object") {
    return Object.entries(section).some(([key, value]) => {
      const normalizedKey = normalizeKey(key);

      const ignoredKey =
        normalizedKey.includes("id") ||
        normalizedKey.includes("createdat") ||
        normalizedKey.includes("updatedat") ||
        normalizedKey.includes("date") ||
        normalizedKey.includes("day") ||
        normalizedKey.includes("title") ||
        normalizedKey.includes("label") ||
        normalizedKey.includes("icon") ||
        normalizedKey.includes("namear") ||
        normalizedKey.includes("nameen");

      if (ignoredKey) return false;

      return sectionHasRealTaskValue(value);
    });
  }

  return false;
}

function isRealTaskString(value) {
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

  if (emptyValues.includes(clean)) return false;

  const labelOnlyValues = [
    "ري",
    "الري",
    "تسميد",
    "التسميد",
    "رش",
    "الرش",
    "كمية الري لكل نخلة لتر",
    "اجمالي كمية الري لتر",
    "مدة الري لكل نخلة دقيقة",
    "اجمالي مدة الري ساعة",
    "نوع المبيد",
    "كمية المبيد لكل نخلة جرام",
    "اجمالي كمية المبيد كجم",
    "كمية التسميد لكل نخلة جرام",
    "اجمالي التسميد كجم",
    "اليوم",
    "مزرعة",
  ];

  if (labelOnlyValues.includes(clean)) return false;

  return true;
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
    .replace(/[\s_-]+/g, "")
    .trim();
}

function toEnglishNumbers(value) {
  return String(value)
    .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit))
    .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit));
}

function openWhatsapp(user, farm) {
  const phone = String(user.whatsapp || user.phone || "").replace(/\D/g, "");

  if (!phone) return;

  const taskNames = farm.tasks.map((task) => task.title).join("، ");

  const message = encodeURIComponent(
    `مرحبًا ${user.name}، تذكير بمهام مزرعة ${farm.name} ليوم ${tomorrowDayName.value} ${tomorrowDateLabel.value}: ${taskNames}.`
  );

  window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
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
  min-height: 145px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  padding: 20px;
  border-radius: 24px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
}

.task-type-card--irrigation {
  background: linear-gradient(135deg, #eff6ff, #ffffff);
  border-color: #93c5fd;
}

.task-type-card--fertilizer {
  background: linear-gradient(135deg, #f0fdf4, #ffffff);
  border-color: #86efac;
}

.task-type-card--spray {
  background: linear-gradient(135deg, #fefce8, #ffffff);
  border-color: #fde047;
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

.farm-task-card__footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding-top: 18px;
  border-top: 1px dashed #cbd5e1;
}

.farm-task-card__footer span {
  color: #475569;
  font-size: 15px;
  font-weight: 900;
}

.farm-task-card__footer button {
  border: 0;
  min-height: 48px;
  padding: 0 22px;
  border-radius: 16px;
  background: #16a34a;
  color: #ffffff;
  font-size: 16px;
  font-weight: 950;
  cursor: pointer;
  transition: 0.2s ease;
}

.farm-task-card__footer button:hover {
  transform: translateY(-1px);
  background: #15803d;
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
}
</style>