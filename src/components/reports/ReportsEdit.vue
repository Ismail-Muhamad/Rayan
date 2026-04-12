<template>
  <div class="report">
    <BaseLoader v-if="reportsUiFlags.isFetchingItem" />
    <div v-else class="report__content">
      <!-- Owner -->
      <div class="report__input">
        <BaseSelect
          v-model="report.owner"
          :label="t('reports.form.labels.owner')"
          :placeholder="t('reports.form.placeholders.owner')"
          :options="mappedUsersRecords"
          :error="v$.report.owner.$error"
          :error-text="getFieldErrorMessage(v$.report.owner)"
          required
          :loading="usersUiFlags.isFetchingList"
        />
      </div>
      <!-- Farm -->
      <div class="report__input">
        <BaseSelect
          v-model="report.farm_id"
          :label="t('reports.form.labels.farm')"
          :placeholder="t('reports.form.placeholders.farm')"
          :options="mappedFarmsRecords"
          :error="v$.report.farm_id.$error"
          :error-text="getFieldErrorMessage(v$.report.farm_id)"
          required
          :disabled="!report.owner"
        />
      </div>
      <!-- Palm Type -->
      <div class="report__input">
        <BaseSelect
          v-model="report.palm_type_id"
          :label="t('reports.form.labels.palm_type')"
          :placeholder="t('reports.form.placeholders.palm_type')"
          :options="mappedPalmTypesRecords"
          :error="v$.report.palm_type_id.$error"
          :error-text="getFieldErrorMessage(v$.report.palm_type_id)"
          required
          :disabled="!report.farm_id"
        />
      </div>
      <!-- Month -->
      <div class="report__input">
        <BaseDatePicker
          :label="t('reports.form.labels.month')"
          v-model="report.month"
          month-picker
          required
          @update:model-value="generateWeeks"
          :error-text="getFieldErrorMessage(v$.report.month)"
          :error="v$.report.month.$error"
          :disabled="!report.palm_type_id"
        />
      </div>
      <!-- Review -->
      <div class="report__input">
        <BaseTextEditor
          :label="t('reports.form.labels.review')"
          :placeholder="t('reports.form.placeholders.review')"
          required
          v-model="report.review"
          :error-text="getFieldErrorMessage(v$.report.review)"
          :error="v$.report.review.$error"
        />
      </div>
      <!-- Recommendations -->
      <div class="report__input">
        <BaseTextEditor
          :label="t('reports.form.labels.recommendations')"
          :placeholder="t('reports.form.placeholders.recommendations')"
          required
          v-model="report.recommendations"
          :error-text="getFieldErrorMessage(v$.report.recommendations)"
          :error="v$.report.recommendations.$error"
        />
      </div>
      <!-- Weeks -->
      <div v-if="report.report_weeks.length > 0" class="report__weeks">
        <BaseStyledSection
          v-for="(week, weekIndex) in report.report_weeks"
          :key="weekIndex"
        >
          <template #label>
            <!-- Week Header -->
            <h3 class="report__week-title">
              {{ t(`reports.form.options.week_number.${week.week_number}`) }}
              <span
                v-if="week.days && week.days.length"
                class="report__week-dates"
              >
                ({{ week.days[0].date }} -
                {{ week.days[week.days.length - 1].date }})
              </span>
            </h3>
          </template>
          <!-- Week Rows -->
          <div class="report__rows">
            <ValidateEach
              v-for="(row, rowIndex) in week.days"
              :key="rowIndex"
              :state="row"
              :rules="rowRules"
            >
              <template #default="{ v }">
                <!-- Row -->
                <div class="report__row">
                  <BaseAccordion variant="splitted">
                    <BaseAccordionItem
                      :key="row.day"
                      :title="`${row.day} ${row.date}`"
                    >
                      <div class="report__fields">
                        <div class="report__section">
                          <!-- Fertilization -->
                          <ValidateEach
                            v-for="(item, index) in row.fertilizations"
                            :key="index"
                            :state="item"
                            :rules="fertilizationRules"
                          >
                            <template #default="{ v }">
                              <div
                                class="report__row report__row--fertilization"
                              >
                                <BaseInput
                                  :label="
                                    t(
                                      'reports.form.labels.type_of_fertilization',
                                    )
                                  "
                                  :placeholder="
                                    t(
                                      'reports.form.placeholders.type_of_fertilization',
                                    )
                                  "
                                  v-model="item.type_of_fertilization"
                                />
                                <BaseInput
                                  :label="
                                    t(
                                      'reports.form.labels.fertilizer_quantity_per_palm_tree',
                                    )
                                  "
                                  :placeholder="
                                    t(
                                      'reports.form.placeholders.fertilizer_quantity_per_palm_tree',
                                    )
                                  "
                                  v-model="
                                    item.fertilizer_quantity_per_palm_tree
                                  "
                                  type="number"
                                  :error-text="
                                    getFieldErrorMessage(
                                      v.fertilizer_quantity_per_palm_tree,
                                    )
                                  "
                                  :error="
                                    v.fertilizer_quantity_per_palm_tree.$error
                                  "
                                />
                                <BaseButton
                                  v-if="row.fertilizations.length > 1"
                                  color="red"
                                  variant="ghost"
                                  size="icon-sm"
                                  @click="removeFertilization(row, index)"
                                >
                                  <BaseIcon
                                    name="mdi:close"
                                    :width="16"
                                    :height="16"
                                  />
                                </BaseButton>
                              </div>
                            </template>
                          </ValidateEach>
                          <BaseButton
                            variant="outline"
                            size="sm"
                            @click="addFertilization(row)"
                            class="report__add-btn"
                          >
                            <BaseIcon
                              name="mdi:plus"
                              :width="16"
                              :height="16"
                            />
                            {{ t("reports.actions.add_fertilization") }}
                          </BaseButton>
                        </div>
                      </div>
                      <!-- Irrigation -->
                      <div class="report__fields">
                        <BaseInput
                          :label="
                            t(
                              'reports.form.labels.irrigation_amount_per_palm_tree',
                            )
                          "
                          :placeholder="
                            t(
                              'reports.form.placeholders.irrigation_amount_per_palm_tree',
                            )
                          "
                          v-model="row.irrigation_amount_per_palm_tree"
                          type="number"
                          :error-text="
                            getFieldErrorMessage(
                              v.irrigation_amount_per_palm_tree,
                            )
                          "
                          :error="v.irrigation_amount_per_palm_tree.$error"
                        />
                        <BaseInput
                          :label="
                            t(
                              'reports.form.labels.duration_of_irrigation_per_palm_tree',
                            )
                          "
                          :placeholder="
                            t(
                              'reports.form.placeholders.duration_of_irrigation_per_palm_tree',
                            )
                          "
                          v-model="row.duration_of_irrigation_per_palm_tree"
                          type="number"
                          :error-text="
                            getFieldErrorMessage(
                              v.duration_of_irrigation_per_palm_tree,
                            )
                          "
                          :error="v.duration_of_irrigation_per_palm_tree.$error"
                        />
                      </div>
                      <!-- Spraying -->
                      <div class="report__fields">
                        <BaseInput
                          :label="t('reports.form.labels.spraying')"
                          :placeholder="t('reports.form.placeholders.spraying')"
                          v-model="row.spraying"
                        />
                        <BaseInput
                          :label="t('reports.form.labels.amount_of_spray')"
                          :placeholder="
                            t('reports.form.placeholders.amount_of_spray')
                          "
                          v-model="row.amount_of_spray"
                          :error-text="getFieldErrorMessage(v.amount_of_spray)"
                          :error="v.amount_of_spray.$error"
                          type="number"
                        />
                      </div>
                    </BaseAccordionItem>
                  </BaseAccordion>
                </div>
              </template>
            </ValidateEach>
          </div>
        </BaseStyledSection>
      </div>
      <!-- Actions -->
      <div class="report__actions">
        <BaseButton
          class="report__action report__action--back"
          color="gray"
          variant="outline"
          size="sm"
          @click="navigateBack"
        >
          {{ t("reports.actions.cancel") }}
        </BaseButton>
        <BaseButton color="gray" variant="outline" size="sm" @click="resetForm">
          {{ t("reports.actions.reset") }}
        </BaseButton>
        <BaseButton
          size="sm"
          @click="submitForm"
          :loading="reportsUiFlags.isUpdating"
        >
          {{ t("reports.actions.submit") }}
        </BaseButton>
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
import { ValidateEach } from "@vuelidate/components";
import {
  required,
  numeric,
  minValue,
  maxValue,
  helpers,
} from "@vuelidate/validators";
import { useRouter, useRoute } from "vue-router";
import moment from "moment";
import { useI18n } from "vue-i18n";
// Stores
import { useUsersStore } from "@/stores/users.store";
import { useFarmsStore } from "@/stores/farms.store";
import { useReportsStore } from "@/stores/reports.store";
// Composables
import { useValidation } from "@/composables/useValidation";
// Components
// Constants
// Helpers
// ===== PROPS & EMITS =====
// ===== STORE INSTANCES =====
const usersStore = useUsersStore();
const farmsStore = useFarmsStore();
const reportsStore = useReportsStore();
// ===== COMPOSABLES =====
const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const { getFieldErrorMessage, isFieldHasError } = useValidation();
// ===== CONSTANTS =====
// ===== REACTIVE STATE & TEMPLATE REFS =====
const report = ref({
  owner: null,
  farm_id: null,
  palm_type_id: null,
  month: null,
  review: null,
  recommendations: null,
  report_weeks: [],
});
// ===== VALIDATION RULES =====
// Fertilization-level validation rules
const fertilizationRules = {
  fertilizer_quantity_per_palm_tree: {
    numeric,
    minValue: minValue(0),
    maxValue: maxValue(10000),
  },
};

// Row-level validation rules (for ValidateEach)
const rowRules = computed(() => ({
  // Fertilization
  fertilizations: {
    $each: helpers.forEach(fertilizationRules),
  },
  // Irrigation
  irrigation_amount_per_palm_tree: {
    numeric,
    minValue: minValue(0),
    maxValue: maxValue(10000),
  },
  duration_of_irrigation_per_palm_tree: {
    numeric,
    minValue: minValue(0),
    maxValue: maxValue(10000),
  },
  // Spraying
  amount_of_spray: {
    numeric,
    minValue: minValue(0),
    maxValue: maxValue(10000),
  },
}));

// Top-level validation rules
const rules = computed(() => ({
  report: {
    owner: {
      required,
    },
    farm_id: {
      required,
    },
    palm_type_id: {
      required,
    },
    month: {
      required,
    },
    review: {
      required,
    },
    recommendations: {
      required,
    },
    report_weeks: {
      $each: helpers.forEach({
        rows: {
          $each: helpers.forEach(rowRules.value),
        },
      }),
    },
  },
}));

// Initialize Vuelidate
const v$ = useVuelidate(rules, { report });
// ===== COMPUTED PROPERTIES =====
const reportId = computed(() => {
  return route.params.id;
});
const { uiFlags: reportsUiFlags, record: reportsRecord } =
  storeToRefs(reportsStore);
const { uiFlags: usersUiFlags, records: usersRecords } =
  storeToRefs(usersStore);
const { uiFlags: farmsUiFlags, records: farmsRecords } =
  storeToRefs(farmsStore);
const mappedUsersRecords = computed(() => {
  return usersRecords.value.map((user) => ({
    label: user.name,
    id: user.id,
  }));
});
const mappedFarmsRecords = computed(() => {
  return (farmsRecords.value || [])
    .filter((farm) => farm.owner_id === report.value.owner)
    .map((farm) => ({
      label: farm.name,
      id: farm.id,
    }));
});
const mappedPalmTypesRecords = computed(() => {
  const farm = (farmsRecords.value || []).find(
    (farm) => farm.id === report.value.farm_id,
  );
  return (farm?.palm_types || []).map((treeType) => ({
    label: treeType.name,
    id: treeType.id,
  }));
});
// ===== LIFECYCLE HOOKS =====
onMounted(async () => {
  await reportsStore.fetchRecord(reportId.value);
  await usersStore.fetchRecords({
    role: "farm_owner",
  });
  await farmsStore.fetchRecords();
  report.value = {
    owner: reportsRecord.value?.farm?.owner_id,
    farm_id: reportsRecord.value?.farm?.id,
    palm_type_id: reportsRecord.value?.palm_type_id,
    month: (() => {
      const dateStr = reportsRecord.value?.report_weeks?.[0]?.days?.[0]?.date;
      if (!dateStr) return null;
      const m = moment(dateStr);
      return { month: m.month(), year: m.year() };
    })(),
    review: reportsRecord.value?.review,
    recommendations: reportsRecord.value?.recommendations,
    report_weeks: reportsRecord.value?.report_weeks,
  };
});

// ===== METHODS =====
const submitForm = async () => {
  v$.value.$validate();
  if (v$.value.$invalid) return;
  const reponse = await reportsStore.updateRecord(reportId.value, report.value);
};
const resetForm = () => {
  report.value = {
    owner: null,
    farm_id: null,
    palm_type_id: null,
    month: null,
    review: null,
    recommendations: null,
    report_weeks: [],
  };
};
const navigateBack = () => {
  router.push({ name: "reports_list" });
};
// Generate 4 weeks based on selected month
const generateWeeks = ({ year, month }) => {
  report.value.report_weeks = [];

  const firstDayOfMonth = new Date(year, month, 1);
  let currentDate = new Date(firstDayOfMonth);
  let weekNum = 1;

  while (currentDate.getMonth() === month) {
    const week = {
      week_number: weekNum,
      date: moment(currentDate).format("YYYY-MM-DD"),
      week_start_date: moment(currentDate).format("YYYY-MM-DD"),
      week_end_date: null,
      days: [],
    };

    for (let dayNum = 0; dayNum < 7; dayNum++) {
      if (currentDate.getMonth() !== month) break;

      const row = createRow(currentDate);
      week.days.push(row);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    week.week_end_date =
      week.days.length > 0
        ? week.days[week.days.length - 1].date
        : moment(week.week_start_date).format("YYYY-MM-DD");

    report.value.report_weeks.push(week);
    weekNum++;
  }
};

// Create a row object for a specific date
const createRow = (date) => {
  const dayIndex = date.getDay();
  const dayName = t(`reports.form.options.days.${dayIndex}`);
  return {
    // Day & Date
    day: dayName,
    date: moment(date).format("YYYY-MM-DD"),
    // Fertilization
    fertilizations: [
      {
        type_of_fertilization: "0",
        fertilizer_quantity_per_palm_tree: "0",
      },
    ],
    // Irrigation
    irrigation_amount_per_palm_tree: "0",
    duration_of_irrigation_per_palm_tree: "0",
    total_amount_of_irrigation: "0",
    // Spraying
    spraying: "0",
    amount_of_spray: "0",
  };
};

const addFertilization = (row) => {
  row.fertilizations.push({
    type_of_fertilization: "0",
    fertilizer_quantity_per_palm_tree: "0",
  });
};

const removeFertilization = (row, index) => {
  if (row.fertilizations.length > 1) {
    row.fertilizations.splice(index, 1);
  }
};

// ===== WATCHERS =====
// ===== EXPOSE PUBLIC METHODS =====
</script>
<style lang="scss" scoped>
.report {
  &__content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  &__weeks {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-block-start: 16px;
  }

  &__week {
    border: 1px solid var(--gray-300);
    border-radius: 8px;
    padding: 12px;
    overflow-x: auto;
  }

  &__week-title {
    font-size: 1.8rem;
    color: var(--blue-600);
    font-weight: 700;
  }

  &__week-dates {
    font-size: 1.2rem;
    font-weight: 400;
    color: var(--gray-600);
  }
  &__rows {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-block-start: 16px;
  }
  &__fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    padding-block-start: 16px;
  }
  &__row {
    &--fertilization {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      align-items: end;
      gap: 16px;
    }
  }
  &__section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    grid-column: 1 / -1;
  }
  &__add-btn {
    width: fit-content;
    margin-inline-start: auto;
  }
  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-block-start: 16px;
  }
  &__action {
    &--back {
      margin-inline-end: auto;
    }
  }
}
</style>
