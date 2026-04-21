<template>
  <BasePageWrapper titleKey="farms.title" subtitleKey="farms.subtitle" iconName="tabler:trees">
    <div class="farms">
      <section class="farms__hero">
        <div class="farms__hero-content">
          <span class="farms__eyebrow">{{ t('farms.list.table_title') }}</span>
          <h2 class="farms__hero-title">{{ t('farms.title') }}</h2>
          <p class="farms__hero-text">
            {{ t('farms.list.hero_text') }}
          </p>
        </div>
        <div class="farms__hero-actions">
          <BaseButton size="sm" @click="router.push({ name: 'create_farm' })">
            <BaseIcon name="solar:add-circle-outline" />
            {{ t('GLOBAL.ACTIONS.ADD_NEW') }}
          </BaseButton>
        </div>
      </section>

      <div class="farms__stats">
        <article v-for="stat in overviewStats" :key="stat.key" class="farms__stat-card">
          <div class="farms__stat-icon">
            <BaseIcon :name="stat.icon || 'mdi:palm-tree'" />
          </div>
          <div class="farms__stat-copy">
            <p class="farms__stat-label">{{ stat.label }}</p>
            <p class="farms__stat-value">{{ stat.value }}</p>
          </div>
        </article>
      </div>

      <!-- مهام اليوم والغد -->
      <section class="tasks-overview">
        <article class="tasks-overview__panel tasks-overview__panel--today">
          <div class="tasks-overview__panel-head">
            <div>
              <p class="tasks-overview__eyebrow">نظرة سريعة</p>
              <h3 class="tasks-overview__title">مهام اليوم</h3>
              <p class="tasks-overview__subtitle">
                {{ todayTasks.length ? 'المهام المطلوبة النهارده على المزارع' : 'مفيش مهام مجدولة لليوم' }}
              </p>
            </div>

            <div class="tasks-overview__count">
              <strong>{{ todayTasks.length }}</strong>
              <span>مهمة</span>
            </div>
          </div>

          <div v-if="tasksStoreLoading" class="tasks-overview__loading">
            جاري تحميل مهام اليوم...
          </div>

          <div v-else-if="todayTasks.length" class="tasks-overview__list">
            <article v-for="task in todayTasks" :key="task.id" class="task-card">
              <div class="task-card__top">
                <div class="task-card__icon">
                  <BaseIcon name="solar:sun-2-outline" />
                </div>

                <div class="task-card__content">
                  <h4 class="task-card__farm">{{ task.farmName }}</h4>
                  <p class="task-card__meta">
                    {{ task.palmTypeName || '--' }} • {{ task.formattedDate }}
                  </p>
                </div>

                <BaseButton variant="soft" color="blue" size="sm" @click="openTaskSection(task, 'all')">
                  <BaseIcon name="solar:arrow-left-outline" />
                  عرض
                </BaseButton>
              </div>

              <div class="task-card__body">
                <div class="task-card__summary">
                  <div class="task-card__summary-item">
                    <span class="task-card__summary-label">المزرعة</span>
                    <strong class="task-card__summary-value">{{ task.farmName }}</strong>
                  </div>

                  <div class="task-card__summary-item">
                    <span class="task-card__summary-label">نوع النخيل</span>
                    <strong class="task-card__summary-value">{{ task.palmTypeName || '--' }}</strong>
                  </div>

                  <div class="task-card__summary-item">
                    <span class="task-card__summary-label">التاريخ</span>
                    <strong class="task-card__summary-value">{{ task.formattedDate }}</strong>
                  </div>
                </div>

                <div class="task-card__actions">
                  <BaseButton v-for="operation in task.operations" :key="operation.key" size="sm" variant="soft"
                    class="task-card__action-btn" :class="`task-card__action-btn--${operation.key}`"
                    @click="openTaskSection(task, operation.key)">
                    <BaseIcon :name="operation.icon" :width="16" :height="16" />
                    {{ operation.label }}
                  </BaseButton>

                  <BaseButton size="sm" variant="outline" class="task-card__details-btn"
                    @click="openTaskSection(task, 'all')">
                    <BaseIcon name="solar:eye-outline" :width="16" :height="16" />
                    كل التفاصيل
                  </BaseButton>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="tasks-overview__empty">
            <div class="tasks-overview__empty-icon">
              <BaseIcon name="solar:check-circle-outline" />
            </div>
            <h4>تمام جدًا</h4>
            <p>مفيش أي مهام على مزارعك النهارده.</p>
          </div>
        </article>

        <article class="tasks-overview__panel tasks-overview__panel--tomorrow">
          <div class="tasks-overview__panel-head">
            <div>
              <p class="tasks-overview__eyebrow">التحضير المسبق</p>
              <h3 class="tasks-overview__title">مهام الغد</h3>
              <p class="tasks-overview__subtitle">
                {{ tomorrowTasks.length ? 'دي المهام اللي جاية بكرة علشان تبقى جاهز' : 'مفيش مهام مجدولة للغد' }}
              </p>
            </div>

            <div class="tasks-overview__count">
              <strong>{{ tomorrowTasks.length }}</strong>
              <span>مهمة</span>
            </div>
          </div>

          <div v-if="tasksStoreLoading" class="tasks-overview__loading">
            جاري تحميل مهام الغد...
          </div>

          <div v-else-if="tomorrowTasks.length" class="tasks-overview__list">
            <article v-for="task in tomorrowTasks" :key="task.id" class="task-card">
              <div class="task-card__top">
                <div class="task-card__icon task-card__icon--tomorrow">
                  <BaseIcon name="solar:calendar-outline" />
                </div>

                <div class="task-card__content">
                  <h4 class="task-card__farm">{{ task.farmName }}</h4>
                  <p class="task-card__meta">
                    {{ task.palmTypeName || '--' }} • {{ task.formattedDate }}
                  </p>
                </div>

                <BaseButton variant="soft" color="blue" size="sm" @click="openTaskSection(task, 'all')">
                  <BaseIcon name="solar:arrow-left-outline" />
                  عرض
                </BaseButton>
              </div>

              <div class="task-card__body">
                <div class="task-card__summary">
                  <div class="task-card__summary-item">
                    <span class="task-card__summary-label">المزرعة</span>
                    <strong class="task-card__summary-value">{{ task.farmName }}</strong>
                  </div>

                  <div class="task-card__summary-item">
                    <span class="task-card__summary-label">نوع النخيل</span>
                    <strong class="task-card__summary-value">{{ task.palmTypeName || '--' }}</strong>
                  </div>

                  <div class="task-card__summary-item">
                    <span class="task-card__summary-label">التاريخ</span>
                    <strong class="task-card__summary-value">{{ task.formattedDate }}</strong>
                  </div>
                </div>

                <div class="task-card__actions">
                  <BaseButton v-for="operation in task.operations" :key="operation.key" size="sm" variant="soft"
                    class="task-card__action-btn" :class="`task-card__action-btn--${operation.key}`"
                    @click="openTaskSection(task, operation.key)">
                    <BaseIcon :name="operation.icon" :width="16" :height="16" />
                    {{ operation.label }}
                  </BaseButton>

                  <BaseButton size="sm" variant="outline" class="task-card__details-btn"
                    @click="openTaskSection(task, 'all')">
                    <BaseIcon name="solar:eye-outline" :width="16" :height="16" />
                    كل التفاصيل
                  </BaseButton>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="tasks-overview__empty">
            <div class="tasks-overview__empty-icon tasks-overview__empty-icon--violet">
              <BaseIcon name="solar:calendar-mark-outline" />
            </div>
            <h4>ممتاز</h4>
            <p>مفيش مهام لحد دلوقتي مجدولة لبكرة.</p>
          </div>
        </article>
      </section>

      <div class="farms__list">
        <BaseTable :headers="TABLE_HEADERS" :items="farmsList" :meta="meta" :isLoading="uiFlags.isFetchingList"
          :title="t('farms.list.table_title')" :search-placeholder="t('farms.list.search_placeholder')" pagination
          bordered @onPageChange="fetchRecords" @on-search="handleTableSearch">
          <template #buttons>
            <BaseButton variant="soft" color="blue" size="sm" @click="router.push({ name: 'create_farm' })">
              <BaseIcon name="solar:add-circle-outline" />
              {{ t('auth.register.actions.add_farm') }}
            </BaseButton>
          </template>

          <template #farm_name="{ item }">
            <div class="farm-row">
              <div class="farm-row__avatar">
                <BaseIcon name="mdi:palm-tree" />
              </div>
              <div class="farm-row__content">
                <span class="farm-row__name">
                  {{ item.farm_name }}
                </span>

                <p class="farm-row__meta">
                  <BaseIcon name="solar:map-point-outline" :width="14" :height="14" />
                  <span>{{ item.location || '--' }}</span>
                </p>

                <div class="farm-row__chips">
                  <span class="farm-chip farm-chip--emerald">
                    {{ item.palm_types_count }} {{ t('farms.table.headers.palm_types') }}
                  </span>
                  <span class="farm-chip farm-chip--amber">
                    {{ item.total_trees }} {{ t('farms.table.headers.palm_count') }}
                  </span>
                </div>
              </div>
            </div>
          </template>

          <template #location="{ item }">
            <span class="farm-chip farm-chip--slate">{{ item.location || '--' }}</span>
          </template>

          <template #palm_types_count="{ item }">
            <span class="farm-badge farm-badge--emerald">
              {{ item.palm_types_count }}
            </span>
          </template>

          <template #total_trees="{ item }">
            <span class="farm-badge farm-badge--amber">
              {{ item.total_trees }}
            </span>
          </template>

          <template #actions="{ item }">
            <div class="farms__actions-cell">
              <BaseButton variant="soft" color="blue" size="sm"
                @click="router.push({ name: 'show_farm', params: { id: item.id } })">
                <BaseIcon name="solar:clipboard-list-outline" />
                {{ t('farms.actions.tasks') }}
              </BaseButton>

              <BaseButton dropdown variant="soft" color="gray" size="icon-sm" :dropdownItems="ROW_ACTIONS"
                @dropdown-select="(action) => triggerShowModal(action.key, item)">
                <BaseIcon name="pepicons-pop:dots-y" />
              </BaseButton>
            </div>
          </template>

          <template #initial>
            <div class="farms__empty-state">
              <div class="farms__empty-icon">
                <BaseIcon name="mdi:palm-tree" />
              </div>
              <h3 class="farms__empty-title">{{ t('farms.list.empty_title') }}</h3>
              <p class="farms__empty-text">
                {{ t('farms.list.empty_message') }}
              </p>
              <BaseButton size="sm" @click="router.push({ name: 'create_farm' })">
                <BaseIcon name="solar:add-circle-outline" />
                {{ t('auth.register.actions.add_farm') }}
              </BaseButton>
            </div>
          </template>
        </BaseTable>

        <FarmDeleteModal ref="deleteFarmModalRef" />
      </div>
    </div>
  </BasePageWrapper>
</template>

<script setup>
import { computed, onMounted, useTemplateRef } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useFarmsStore } from '@/stores/farms.store';
import { useReportsStore } from '@/stores/reports.store';
import FarmDeleteModal from './Modals/FarmDeleteModal.vue';
import { debounceHelper } from '@/helpers/debounceHelper';

const farmsStore = useFarmsStore();
const reportsStore = useReportsStore();
const router = useRouter();
const { t, locale } = useI18n();

const TABLE_HEADERS = computed(() => [
  {
    text: t('farms.table.headers.farm_name'),
    value: 'farm_name',
    width: 340,
  },
  {
    text: t('farms.table.headers.location'),
    value: 'location',
    width: 220,
  },
  {
    text: t('farms.list.stats.palm_types_count'),
    value: 'palm_types_count',
    alignment: 'center',
    width: 140,
  },
  {
    text: t('farms.list.stats.trees_count'),
    value: 'total_trees',
    alignment: 'center',
    width: 140,
  },
  {
    text: t('farms.table.headers.actions'),
    value: 'actions',
    alignment: 'center',
    width: 220,
  },
]);

const ROW_ACTIONS = computed(() => [
  {
    key: 'edit',
    label: t('farms.actions.edit'),
    icon: 'solar:pen-2-outline',
  },
  {
    key: 'delete',
    label: t('farms.actions.delete'),
    icon: 'solar:trash-bin-trash-outline',
    danger: true,
  },
]);

const deleteFarmModalRef = useTemplateRef('deleteFarmModalRef');

const { records, uiFlags, meta } = storeToRefs(farmsStore);
const {
  records: reportsRecords,
  uiFlags: reportsUiFlags,
} = storeToRefs(reportsStore);

const farmsList = computed(() => {
  return (records.value || []).map((record) => {
    const palmTypes = record?.palm_types || [];
    const totalTrees = palmTypes.reduce(
      (sum, palmType) => sum + Number(palmType?.number_of_trees || 0),
      0,
    );

    return {
      ...record,
      farm_name: record?.name,
      location: record?.location,
      palm_types_count: palmTypes.length,
      total_trees: totalTrees,
    };
  });
});

const overviewStats = computed(() => {
  const farmsCount = meta.value?.total || farmsList.value.length;
  const totalPalmTypes = farmsList.value.reduce(
    (sum, farm) => sum + Number(farm.palm_types_count || 0),
    0,
  );
  const totalTrees = farmsList.value.reduce(
    (sum, farm) => sum + Number(farm.total_trees || 0),
    0,
  );

  return [
    {
      key: 'farms_count',
      label: t('farms.list.stats.farms_count'),
      value: farmsCount,
      icon: 'solar:leaf-outline',
    },
    {
      key: 'palm_types_count',
      label: t('farms.list.stats.palm_types_count'),
      value: totalPalmTypes,
      icon: 'solar:leaf-outline',
    },
    {
      key: 'trees_count',
      label: t('farms.list.stats.trees_count'),
      value: totalTrees,
      icon: 'solar:leaf-outline',
    },
  ];
});

const tasksStoreLoading = computed(() => reportsUiFlags.value?.isFetchingList);

const normalizeDateKey = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const formatTaskDate = (value) => {
  if (!value) return '--';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat(locale.value || 'ar', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
};

const hasFertilization = (day) => {
  return (day?.fertilizations || []).some(
    (item) =>
      (item?.type_of_fertilization && String(item.type_of_fertilization) !== '0') ||
      (item?.fertilizer_quantity_per_palm_tree &&
        String(item.fertilizer_quantity_per_palm_tree) !== '0'),
  );
};

const hasIrrigation = (day) => {
  return (
    (day?.irrigation_amount_per_palm_tree &&
      String(day.irrigation_amount_per_palm_tree) !== '0') ||
    (day?.duration_of_irrigation_per_palm_tree &&
      String(day.duration_of_irrigation_per_palm_tree) !== '0')
  );
};

const hasSpraying = (day) => {
  return (
    (day?.spraying && String(day.spraying) !== '0') ||
    (day?.amount_of_spray && String(day.amount_of_spray) !== '0')
  );
};

const allUpcomingTasks = computed(() => {
  const items = [];

  for (const report of reportsRecords.value || []) {
    const weeks = report?.report_weeks || [];

    for (const week of weeks) {
      for (const day of week?.days || []) {
        const operations = [];

        if (hasIrrigation(day)) {
          operations.push({
            key: 'irrigation',
            label: 'ري',
            icon: 'solar:waterdrops-outline',
          });
        }

        if (hasFertilization(day)) {
          operations.push({
            key: 'fertilization',
            label: 'تسميد',
            icon: 'solar:leaf-outline',
          });
        }

        if (hasSpraying(day)) {
          operations.push({
            key: 'spraying',
            label: 'رش',
            icon: 'solar:bug-outline',
          });
        }

        if (!operations.length) continue;

        items.push({
          id: `${report?.id}-${week?.id}-${day?.date}`,
          farmId: report?.farm?.id,
          farmName: report?.farm?.name || '--',
          palmTypeName: report?.palm_type?.name || '--',
          date: day?.date,
          dateKey: normalizeDateKey(day?.date),
          formattedDate: formatTaskDate(day?.date),
          operations,
          reportId: report?.id,
          weekId: week?.id,
        });
      }
    }
  }

  return items.sort((a, b) => new Date(a.date) - new Date(b.date));
});

const todayKey = computed(() => {
  return normalizeDateKey(new Date());
});

const tomorrowKey = computed(() => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return normalizeDateKey(tomorrow);
});

const todayTasks = computed(() => {
  return allUpcomingTasks.value.filter((task) => task.dateKey === todayKey.value);
});

const tomorrowTasks = computed(() => {
  return allUpcomingTasks.value.filter((task) => task.dateKey === tomorrowKey.value);
});

onMounted(async () => {
  fetchRecords(1);
  await reportsStore.fetchRecords({
    page: 1,
    per_page: 300,
  });
});

const fetchRecords = (page, searchTerm = undefined) => {
  farmsStore.fetchRecords({
    page,
    name: searchTerm || undefined,
  });
};

const handleTableSearch = debounceHelper(function (query) {
  fetchRecords(1, query);
}, 500);

const triggerShowModal = (action, item) => {
  const actionsMap = {
    delete: () => deleteFarmModalRef.value.openModal(item),
    edit: () => router.push({ name: 'edit_farm', params: { id: item.id } }),
  };

  actionsMap[action]?.();
};

const openTaskSection = (task, section = 'all') => {
  if (!task?.farmId || !task?.reportId || !task?.weekId) return;

  router.push({
    name: 'show_farm_week',
    params: {
      id: task.farmId,
      reportId: task.reportId,
      weekId: task.weekId,
    },
    query: {
      focus: section,
      day: task.dateKey,
    },
  });
};
</script>

<style lang="scss" scoped>
.farms {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__hero {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    padding: 24px;
    border-radius: 24px;
    border: 1px solid var(--blue-100);
    background:
      linear-gradient(135deg, rgba(59, 130, 246, 0.14), rgba(255, 255, 255, 0.98)),
      var(--white);
    box-shadow: 0 20px 40px rgba(30, 64, 175, 0.08);
  }

  &__hero-content {
    max-width: 720px;
  }

  &__eyebrow {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 999px;
    background-color: var(--blue-100);
    color: var(--blue-800);
    font-size: 1.25rem;
    font-weight: 700;
    margin-block-end: 12px;
  }

  &__hero-title {
    font-size: clamp(2.4rem, 3vw, 3.4rem);
    font-weight: 800;
    color: var(--gray-950);
    margin-block-end: 10px;
  }

  &__hero-text {
    max-width: 620px;
    color: var(--gray-600);
    font-size: 1.55rem;
    line-height: 1.8;
  }

  &__hero-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 16px;
  }

  &__stat-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px;
    border-radius: 20px;
    background-color: var(--white);
    border: 1px solid var(--gray-200);
    box-shadow: 0 10px 30px rgba(17, 24, 39, 0.06);
  }

  &__stat-icon {
    width: 52px;
    height: 52px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--blue-100), var(--sky-50));
    color: var(--blue-700);
    font-size: 2rem;
    flex-shrink: 0;
  }

  &__stat-copy {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__stat-label {
    color: var(--gray-500);
    font-size: 1.35rem;
    font-weight: 600;
  }

  &__stat-value {
    color: var(--gray-950);
    font-size: 2.25rem;
    font-weight: 800;
  }

  &__list {
    overflow: hidden;
  }

  &__actions-cell {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__empty-state {
    min-height: 320px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 14px;
    padding: 24px;
  }

  &__empty-icon {
    width: 72px;
    height: 72px;
    border-radius: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--blue-100), var(--sky-50));
    color: var(--blue-700);
    font-size: 2.8rem;
  }

  &__empty-title {
    font-size: 2rem;
    font-weight: 800;
    color: var(--gray-950);
  }

  &__empty-text {
    max-width: 420px;
    color: var(--gray-500);
    font-size: 1.5rem;
    line-height: 1.8;
  }
}

.tasks-overview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;

  &__panel {
    border-radius: 24px;
    padding: 20px;
    background: var(--white);
    border: 1px solid var(--gray-200);
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-height: 280px;
  }

  &__panel--today {
    background:
      linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(255, 255, 255, 1)),
      var(--white);
  }

  &__panel--tomorrow {
    background:
      linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(255, 255, 255, 1)),
      var(--white);
  }

  &__panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  &__eyebrow {
    color: var(--gray-500);
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 8px;
  }

  &__title {
    color: var(--gray-950);
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 6px;
  }

  &__subtitle {
    color: var(--gray-600);
    font-size: 1.35rem;
    line-height: 1.7;
  }

  &__count {
    min-width: 88px;
    padding: 14px 16px;
    border-radius: 20px;
    background-color: rgba(255, 255, 255, 0.8);
    border: 1px solid var(--gray-200);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;

    strong {
      font-size: 2rem;
      font-weight: 800;
      color: var(--gray-950);
      line-height: 1;
    }

    span {
      font-size: 1.2rem;
      color: var(--gray-500);
      font-weight: 700;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__loading {
    min-height: 150px;
    display: grid;
    place-items: center;
    color: var(--gray-500);
    font-size: 1.35rem;
    font-weight: 600;
  }

  &__empty {
    flex: 1;
    min-height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    gap: 10px;

    h4 {
      font-size: 1.7rem;
      color: var(--gray-900);
      font-weight: 800;
    }

    p {
      font-size: 1.35rem;
      color: var(--gray-500);
      max-width: 320px;
      line-height: 1.8;
    }
  }

  &__empty-icon {
    width: 58px;
    height: 58px;
    border-radius: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--blue-100), var(--sky-50));
    color: var(--blue-700);
    font-size: 2rem;
  }

  &__empty-icon--violet {
    background: linear-gradient(135deg, #ede9fe, #f5f3ff);
    color: #7c3aed;
  }
}

.task-card {
  padding: 14px;
  border-radius: 20px;
  border: 1px solid var(--gray-200);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__top {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #dbeafe, #eff6ff);
    color: var(--blue-700);
    font-size: 1.9rem;
    flex-shrink: 0;
  }

  &__icon--tomorrow {
    background: linear-gradient(135deg, #ede9fe, #f5f3ff);
    color: #7c3aed;
  }

  &__content {
    min-width: 0;
    flex: 1;
  }

  &__farm {
    color: var(--gray-950);
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 4px;
  }

  &__meta {
    color: var(--gray-500);
    font-size: 1.2rem;
    line-height: 1.7;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 999px;
    padding: 7px 12px;
    font-size: 1.15rem;
    font-weight: 700;
    white-space: nowrap;
  }

  &__chip--irrigation {
    background: #eff6ff;
    color: #1d4ed8;
  }

  &__chip--fertilization {
    background: #ecfdf5;
    color: #047857;
  }

  &__chip--spraying {
    background: #fff7ed;
    color: #c2410c;
  }
}

.task-card {
  position: relative;
  padding: 16px;
  border-radius: 24px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
  box-shadow:
    0 14px 34px rgba(15, 23, 42, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset-inline: 0;
    top: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  }

  &__top {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__icon {
    width: 52px;
    height: 52px;
    border-radius: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #dbeafe, #eff6ff);
    color: var(--blue-700);
    font-size: 1.9rem;
    flex-shrink: 0;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  }

  &__icon--tomorrow {
    background: linear-gradient(135deg, #ede9fe, #f5f3ff);
    color: #7c3aed;
  }

  &__content {
    min-width: 0;
    flex: 1;
  }

  &__farm {
    color: var(--gray-950);
    font-size: 1.55rem;
    font-weight: 900;
    margin-bottom: 4px;
  }

  &__meta {
    color: var(--gray-500);
    font-size: 1.2rem;
    line-height: 1.7;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  &__summary-item {
    padding: 12px;
    border-radius: 18px;
    background: rgba(248, 250, 252, 0.9);
    border: 1px solid rgba(226, 232, 240, 0.9);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__summary-label {
    color: var(--gray-500);
    font-size: 1.05rem;
    font-weight: 700;
  }

  &__summary-value {
    color: var(--gray-950);
    font-size: 1.18rem;
    font-weight: 800;
    line-height: 1.6;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__action-btn,
  &__details-btn {
    border-radius: 999px !important;
  }

  &__action-btn--irrigation {
    background: #eff6ff !important;
    color: #1d4ed8 !important;
    border: 1px solid #bfdbfe !important;
  }

  &__action-btn--fertilization {
    background: #ecfdf5 !important;
    color: #047857 !important;
    border: 1px solid #a7f3d0 !important;
  }

  &__action-btn--spraying {
    background: #fff7ed !important;
    color: #c2410c !important;
    border: 1px solid #fdba74 !important;
  }

  &__details-btn {
    border: 1px solid var(--gray-300) !important;
    background: #fff !important;
    color: var(--gray-700) !important;
  }
}

@media (max-width: 768px) {
  .task-card {
    &__summary {
      grid-template-columns: 1fr;
    }

    &__top {
      align-items: flex-start;
      flex-wrap: wrap;
    }
  }
}

.farm-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;

  &__avatar {
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--blue-100), var(--sky-50));
    color: var(--blue-700);
    font-size: 2rem;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  &__name {
    color: var(--gray-950);
    font-size: 1.65rem;
    font-weight: 800;
    text-decoration: none;
    cursor: default;
  }

  &__meta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--gray-500);
    font-size: 1.35rem;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}

.farm-chip,
.farm-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 1.25rem;
  font-weight: 700;
  white-space: nowrap;
}

.farm-chip {
  &--emerald {
    background-color: var(--blue-50);
    color: var(--blue-700);
  }

  &--amber {
    background-color: var(--amber-50);
    color: var(--amber-700);
  }

  &--slate {
    background-color: var(--gray-100);
    color: var(--gray-700);
  }
}

.farm-badge {
  min-width: 42px;

  &--emerald {
    background-color: var(--blue-100);
    color: var(--blue-800);
  }

  &--amber {
    background-color: var(--amber-100);
    color: var(--amber-800);
  }
}

@media (max-width: 1024px) {
  .tasks-overview {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .farms {
    &__hero {
      flex-direction: column;
      align-items: flex-start;
    }

    &__hero-actions {
      width: 100%;
      justify-content: flex-start;
    }
  }

  .tasks-overview {
    &__panel-head {
      flex-direction: column;
    }

    &__count {
      align-items: flex-start;
    }
  }

  .task-card {
    &__top {
      align-items: flex-start;
      flex-wrap: wrap;
    }
  }
}
</style>