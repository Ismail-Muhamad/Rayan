<template>
  <div class="user">
    <BaseLoader
      v-if="usersUiFlags.isFetchingItem || farmsUiFlags.isFetchingList"
    />
    <div v-else class="user__content">
      <!-- User Info -->
      <div class="user__info">
        <h2 class="user__title">{{ t("users.table.headers.user_info") }}</h2>
        <div class="user__grid">
          <BaseCard
            v-for="info in userInfo"
            :key="info.key"
            :title="info.title"
            :value="info.value"
          />
        </div>
      </div>
      <!-- Farm Info -->
      <div class="user__info">
        <h2 class="user__title user__title--lg">
          {{ t("users.table.headers.farms_info") }}
        </h2>
        <div
          v-for="(item, index) in farmsInfo"
          :key="item.id"
          class="user__farm"
        >
          <h3 class="user__title user__title--sm">
            {{ t("users.table.headers.farm_info", { number: index + 1 }) }}
          </h3>
          <div class="user__grid">
            <BaseCard
              v-for="info in item.farm"
              :key="info.key"
              :title="info.title"
              :value="info.value"
            />
          </div>
          <!-- Palm Types Info -->
          <div class="user__palm">
            <h2 class="user__title user__title--sm">
              {{ t("farms.table.headers.palm_types") }}
            </h2>
            <div class="user__table">
              <BaseTable
                :headers="PALM_TYPES_HEADERS"
                :items="item.palm_types"
                :showToolbar="false"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
// ===== IMPORTS =====
// Vue and Libraries
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useVuelidate } from "@vuelidate/core";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import moment from "moment";
// Stores
import { useUsersStore } from "@/stores/users.store";
import { useFarmsStore } from "@/stores/farms.store";
// Composables
// Components
// Constants
// Helpers
// ===== PROPS & EMITS =====
// ===== STORE INSTANCES =====
const usersStore = useUsersStore();
const farmsStore = useFarmsStore();
// ===== COMPOSABLES =====
const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
// ===== CONSTANTS =====
const PALM_TYPES_HEADERS = [
  {
    text: t("farms.table.headers.palm_type"),
    value: "palm_type",
  },
  {
    text: t("farms.table.headers.palm_count"),
    value: "palm_count",
  },
  {
    text: t("farms.table.headers.palm_age"),
    value: "palm_age",
  },
];
const REPORT_HEADERS = [
  {
    text: t("farms.table.headers.day"),
    value: "day",
  },
  {
    text: t("farms.table.headers.date"),
    value: "date",
  },
  {
    text: t("farms.table.headers.type_of_fertilization"),
    value: "type_of_fertilization",
  },
  {
    text: t("farms.table.headers.fertilizer_quantity_per_palm_tree"),
    value: "fertilizer_quantity_per_palm_tree",
  },
  {
    text: t("farms.table.headers.fertilization_total"),
    value: "fertilization_total",
  },
  {
    text: t("farms.table.headers.irrigation_amount_per_palm_tree"),
    value: "irrigation_amount_per_palm_tree",
  },
  {
    text: t("farms.table.headers.duration_of_irrigation_per_palm_tree"),
    value: "duration_of_irrigation_per_palm_tree",
  },
  {
    text: t("farms.table.headers.total_amount_of_irrigation"),
    value: "total_amount_of_irrigation",
  },
  {
    text: t("farms.table.headers.total_duration_of_irrigation"),
    value: "total_duration_of_irrigation",
  },
  {
    text: t("farms.table.headers.spraying"),
    value: "spraying",
  },
  {
    text: t("farms.table.headers.spraying_per_tree"),
    value: "spraying_per_tree",
  },
  {
    text: t("farms.table.headers.amount_of_spray"),
    value: "amount_of_spray",
  },
];
// ===== REACTIVE STATE & TEMPLATE REFS =====
// ===== VALIDATION RULES =====
// ===== COMPUTED PROPERTIES =====
const currentRouteId = computed(() => route.params.id);
const { record: userRecord, uiFlags: usersUiFlags } = storeToRefs(usersStore);
const { records: farmsList, uiFlags: farmsUiFlags } = storeToRefs(farmsStore);

const userInfo = computed(() => {
  return [
    {
      key: "name",
      title: t("users.table.headers.user_name"),
      value: userRecord.value?.name,
    },
    {
      key: "whatsapp_number",
      title: t("users.table.headers.whatsapp_number"),
      value: userRecord.value?.whatsapp_number,
    },
    {
      key: "email",
      title: t("users.table.headers.email"),
      value: userRecord.value?.email,
    },
    {
      key: "created_at",
      title: t("users.table.headers.created_at"),
      value: new Date(userRecord.value?.created_at).toLocaleDateString(),
    },
    {
      key: "status_text",
      title: t("users.table.headers.status"),
      value: t(`users.status.${userRecord.value?.status}`),
    },
  ];
});
const farmsInfo = computed(() => {
  return farmsList.value.map((farm) => {
    return {
      id: farm.id,
      farm: [
        {
          key: "farm_name",
          title: t("farms.table.headers.farm_name"),
          value: farm.name,
        },
        {
          key: "location",
          title: t("farms.table.headers.location"),
          value: farm.location,
        },
      ],
      palm_types: farm.palm_types.map((palmType) => {
        return {
          palm_type: palmType.name,
          palm_count: palmType.number_of_trees,
          palm_age: palmType.palm_age,
        };
      }),
    };
  });
});
// ===== LIFECYCLE HOOKS =====
onMounted(async () => {
  await usersStore.fetchRecord(currentRouteId.value);
  await farmsStore.fetchRecords({
    owner_id: currentRouteId.value,
  });
});
// ===== METHODS =====
// ===== WATCHERS =====
// ===== EXPOSE PUBLIC METHODS =====
</script>
<style lang="scss" scoped>
.user {
  &__title {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--gray-900);
    margin-block-end: 12px;
    &--lg {
      font-size: 2rem;
    }
    &--sm {
      font-size: 1.4rem;
    }
  }
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
  }
  &__cell-stack {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  &__cell-text {
    white-space: nowrap;
  }
  &__farm,
  &__info {
    &:not(:last-child) {
      border-block-end: 1px dashed var(--gray-300);
      padding-block-end: 24px;
      margin-block-end: 24px;
    }
  }
  &__palm {
    margin-block-start: 24px;
  }
}
:deep(ul) {
  display: block;
  list-style-type: disc;
  margin-block-start: 1em;
  margin-block-end: 1em;
  padding-inline-start: 40px;
  unicode-bidi: isolate;
}
:deep(ol) {
  display: block;
  list-style-type: decimal;
  margin-block-start: 1em;
  margin-block-end: 1em;
  padding-inline-start: 40px;
  unicode-bidi: isolate;
}
</style>
