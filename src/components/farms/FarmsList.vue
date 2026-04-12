<template>
  <BasePageWrapper
    titleKey="farms.title"
    subtitleKey="farms.subtitle"
    iconName="solar:buildings-3-outline"
  >
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
        <article
          v-for="stat in overviewStats"
          :key="stat.key"
          class="farms__stat-card"
        >
          <div class="farms__stat-icon">
            <BaseIcon :name="stat.icon" />
          </div>
          <div class="farms__stat-copy">
            <p class="farms__stat-label">{{ stat.label }}</p>
            <p class="farms__stat-value">{{ stat.value }}</p>
          </div>
        </article>
      </div>

      <div class="farms__list">
        <BaseTable
          :headers="TABLE_HEADERS"
          :items="farmsList"
          :meta="meta"
          :isLoading="uiFlags.isFetchingList"
          :title="t('farms.list.table_title')"
          :search-placeholder="t('farms.list.search_placeholder')"
          pagination
          bordered
          @onPageChange="fetchRecords"
          @on-search="handleTableSearch"
        >
          <template #buttons>
            <BaseButton
              variant="soft"
              color="green"
              size="sm"
              @click="router.push({ name: 'create_farm' })"
            >
              <BaseIcon name="solar:add-circle-outline" />
              {{ t('auth.register.actions.add_farm') }}
            </BaseButton>
          </template>

          <template #farm_name="{ item }">
            <div class="farm-row">
              <div class="farm-row__avatar">
                <BaseIcon name="solar:buildings-3-outline" />
              </div>
              <div class="farm-row__content">
                <router-link
                  class="farm-row__name"
                  :to="{ name: 'show_farm', params: { id: item.id } }"
                >
                  {{ item.farm_name }}
                </router-link>
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
              <BaseButton
                variant="soft"
                color="green"
                size="icon-sm"
                @click="router.push({ name: 'show_farm', params: { id: item.id } })"
              >
                <BaseIcon name="solar:eye-outline" />
              </BaseButton>
              <BaseButton
                dropdown
                variant="soft"
                color="gray"
                size="icon-sm"
                :dropdownItems="ROW_ACTIONS"
                @dropdown-select="(action) => triggerShowModal(action.key, item)"
              >
                <BaseIcon name="pepicons-pop:dots-y" />
              </BaseButton>
            </div>
          </template>

          <template #initial>
            <div class="farms__empty-state">
              <div class="farms__empty-icon">
                <BaseIcon name="solar:leaf-outline" />
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
import FarmDeleteModal from './Modals/FarmDeleteModal.vue';
import { debounceHelper } from '@/helpers/debounceHelper';

const farmsStore = useFarmsStore();
const router = useRouter();
const { t } = useI18n();

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
    width: 120,
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
      icon: 'solar:buildings-3-outline',
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
      icon: 'solar:trees-outline',
    },
  ];
});

onMounted(() => {
  fetchRecords(1);
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
    border: 1px solid var(--emerald-100);
    border-radius: 24px;
    background:
      linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(255, 255, 255, 0.98)),
      var(--white);
    box-shadow: 0 20px 40px rgba(2, 44, 34, 0.08);
  }

  &__hero-content {
    max-width: 720px;
  }

  &__eyebrow {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 999px;
    background-color: var(--emerald-100);
    color: var(--emerald-800);
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
    background: linear-gradient(135deg, var(--emerald-100), var(--green-50));
    color: var(--emerald-700);
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
    background: linear-gradient(135deg, var(--green-100), var(--emerald-50));
    color: var(--emerald-700);
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
    background: linear-gradient(135deg, var(--emerald-100), var(--green-50));
    color: var(--emerald-700);
    font-size: 2rem;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  &__name {
    color: var(--emerald-700);
    font-size: 1.65rem;
    font-weight: 800;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
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
    background-color: var(--emerald-50);
    color: var(--emerald-700);
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
    background-color: var(--emerald-100);
    color: var(--emerald-800);
  }

  &--amber {
    background-color: var(--amber-100);
    color: var(--amber-800);
  }
}

@media (max-width: 768px) {
  .farms {
    &__hero {
      flex-direction: column;
      align-items: flex-start;
      padding: 20px;
    }

    &__hero-actions {
      width: 100%;
      justify-content: stretch;
    }
  }
}
</style>
