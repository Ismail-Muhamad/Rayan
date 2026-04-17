<template>
  <div class="report-create">
    <section class="report-create__hero">
      <div class="report-create__hero-content">
        <p class="report-create__eyebrow">
          {{ t("reports.title") }}
        </p>

        <h1 class="report-create__hero-title">
          إنشاء تقرير جديد بشكل مرتب وواضح
        </h1>

        <p class="report-create__hero-text">
          اختر المالك والمزرعة ونوع النخيل، وبعدها جهّز التقرير والتوصيات وخطة
          الأسابيع بسهولة.
        </p>
      </div>

      <div class="report-create__hero-side">
        <div class="report-create__stat-card">
          <span class="report-create__stat-label">
            عدد الأسابيع خلال الشهر
          </span>
          <strong class="report-create__stat-value">
            {{ report.report_weeks.length || 0 }}
          </strong>
        </div>
      </div>
    </section>

    <section class="report-create__section">
      <div class="report-create__section-head">
        <h2 class="report-create__section-title">بيانات التقرير الأساسية</h2>
      </div>

      <div class="report-create__grid">
        <div class="report-create__field-card">
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

        <div class="report-create__field-card">
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

        <div class="report-create__field-card">
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

        <div class="report-create__field-card">
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
      </div>
    </section>

    <section class="report-create__section">
      <div class="report-create__section-head">
        <h2 class="report-create__section-title">محتوى التقرير</h2>
      </div>

      <div class="report-create__stack">
        <div class="report-create__field-card">
          <BaseTextEditor
            :label="t('reports.form.labels.review')"
            :placeholder="t('reports.form.placeholders.review')"
            required
            v-model="report.review"
            :error-text="getFieldErrorMessage(v$.report.review)"
            :error="v$.report.review.$error"
          />
        </div>

        <div class="report-create__field-card">
          <BaseTextEditor
            :label="t('reports.form.labels.recommendations')"
            :placeholder="t('reports.form.placeholders.recommendations')"
            required
            v-model="report.recommendations"
            :error-text="getFieldErrorMessage(v$.report.recommendations)"
            :error="v$.report.recommendations.$error"
          />
        </div>
      </div>
    </section>

    <section
      v-if="report.report_weeks.length > 0"
      class="report-create__section"
    >
      <div class="report-create__section-head">
        <h2 class="report-create__section-title">خطة الأسابيع</h2>
      </div>

      <div class="report-create__weeks">
        <BaseStyledSection
          v-for="(week, weekIndex) in report.report_weeks"
          :key="weekIndex"
          class="report-create__week-shell"
        >
          <template #label>
            <div class="report-create__week-header">
              <h3 class="report-create__week-title">
                {{ t(`reports.form.options.week_number.${week.week_number}`) }}
              </h3>

              <span class="report-create__week-dates">
                {{ week.week_start_date }} — {{ week.week_end_date }}
              </span>
            </div>
          </template>

          <div class="report-create__rows">
            <ValidateEach
              v-for="(row, rowIndex) in week.days"
              :key="rowIndex"
              :state="row"
              :rules="rowRules"
            >
              <template #default="{ v }">
                <div class="report-create__row-card">
                  <BaseAccordion variant="splitted">
                    <BaseAccordionItem
                      :key="row.day"
                      :title="`${row.day} - ${row.date}`"
                    >
                      <div class="report-create__day-content">
                        <section class="report-create__sub-section">
                          <div class="report-create__sub-head">
                            <h4 class="report-create__sub-title">التسميد</h4>
                          </div>

                          <ValidateEach
                            v-for="(item, index) in row.fertilizations"
                            :key="index"
                            :state="item"
                            :rules="fertilizationRules"
                          >
                            <template #default="{ v }">
                              <div class="report-create__fertilization-row">
                                <div class="report-create__field-card">
                                  <BaseSelect
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
                                    :options="mappedFertilizerTypesRecords"
                                    v-model="item.type_of_fertilization"
                                  />
                                </div>

                                <div class="report-create__field-card">
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
                                    v-model="item.fertilizer_quantity_per_palm_tree"
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
                                </div>

                                <BaseButton
                                  v-if="row.fertilizations.length > 1"
                                  color="red"
                                  variant="ghost"
                                  size="icon-sm"
                                  class="report-create__remove-btn"
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
                            class="report-create__add-btn"
                          >
                            <BaseIcon name="mdi:plus" :width="16" :height="16" />
                            {{ t("reports.actions.add_fertilization") }}
                          </BaseButton>
                        </section>

                        <section class="report-create__sub-section">
                          <div class="report-create__sub-head">
                            <h4 class="report-create__sub-title">الري</h4>
                          </div>

                          <div class="report-create__grid">
                            <div class="report-create__field-card">
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
                            </div>

                            <div class="report-create__field-card">
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
                                :error="
                                  v.duration_of_irrigation_per_palm_tree.$error
                                "
                              />
                            </div>
                          </div>
                        </section>

                        <section class="report-create__sub-section">
                          <div class="report-create__sub-head">
                            <h4 class="report-create__sub-title">الرش</h4>
                          </div>

                          <div class="report-create__grid">
                            <div class="report-create__field-card">
                              <BaseSelect
                                :label="t('reports.form.labels.spraying')"
                                :placeholder="
                                  t('reports.form.placeholders.spraying')
                                "
                                :options="mappedPesticideTypesRecords"
                                v-model="row.spraying"
                              />
                            </div>

                            <div class="report-create__field-card">
                              <BaseInput
                                :label="t('reports.form.labels.amount_of_spray')"
                                :placeholder="
                                  t('reports.form.placeholders.amount_of_spray')
                                "
                                v-model="row.amount_of_spray"
                                :error-text="
                                  getFieldErrorMessage(v.amount_of_spray)
                                "
                                :error="v.amount_of_spray.$error"
                                type="number"
                              />
                            </div>
                          </div>
                        </section>
                      </div>
                    </BaseAccordionItem>
                  </BaseAccordion>
                </div>
              </template>
            </ValidateEach>
          </div>
        </BaseStyledSection>
      </div>
    </section>

    <section class="report-create__actions-shell">
      <div class="report-create__actions">
        <BaseButton
          class="report-create__action"
          color="gray"
          variant="outline"
          size="sm"
          @click="navigateBack"
        >
          {{ t("reports.actions.cancel") }}
        </BaseButton>

        <BaseButton
          class="report-create__action"
          color="gray"
          variant="outline"
          size="sm"
          @click="resetForm"
        >
          {{ t("reports.actions.reset") }}
        </BaseButton>

        <BaseButton
          class="report-create__action"
          size="sm"
          @click="submitForm"
          :loading="reportsUiFlags.isCreating"
        >
          {{ t("reports.actions.submit") }}
        </BaseButton>
      </div>
    </section>
  </div>
</template>

<script setup>
// ===== IMPORTS =====
import { ref, computed, onMounted, watch } from "vue";
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
import { useRouter } from "vue-router";
import moment from "moment";
import { useI18n } from "vue-i18n";

// ===== STORES =====
import { useUsersStore } from "@/stores/users.store";
import { useFarmsStore } from "@/stores/farms.store";
import { useReportsStore } from "@/stores/reports.store";
import FertilizerTypesServices from "@/services/fertilizerTypes.services";
import PesticideTypesServices from "@/services/pesticideTypes.services";

// ===== COMPOSABLES =====
import { useValidation } from "@/composables/useValidation";

// ===== STORE INSTANCES =====
const usersStore = useUsersStore();
const farmsStore = useFarmsStore();
const reportsStore = useReportsStore();

// ===== COMPOSABLES =====
const router = useRouter();
const { t } = useI18n();
const { getFieldErrorMessage } = useValidation();

// ===== REACTIVE STATE =====
const report = ref({
  owner: null,
  farm_id: null,
  palm_type_id: null,
  month: null,
  review: null,
  recommendations: null,
  report_weeks: [],
});

const fertilizerTypesRecords = ref([]);
const pesticideTypesRecords = ref([]);

// ===== VALIDATION RULES =====
const fertilizationRules = {
  fertilizer_quantity_per_palm_tree: {
    numeric,
    minValue: minValue(0),
    maxValue: maxValue(10000),
  },
};

const rowRules = computed(() => ({
  fertilizations: {
    $each: helpers.forEach(fertilizationRules),
  },
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
  amount_of_spray: {
    numeric,
    minValue: minValue(0),
    maxValue: maxValue(10000),
  },
}));

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

const v$ = useVuelidate(rules, { report });

// ===== COMPUTED =====
const { uiFlags: reportsUiFlags } = storeToRefs(reportsStore);
const { uiFlags: usersUiFlags, records: usersRecords } = storeToRefs(usersStore);
const { records: farmsRecords } = storeToRefs(farmsStore);

const mappedUsersRecords = computed(() => {
  return (usersRecords.value || []).map((user) => ({
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

const mappedFertilizerTypesRecords = computed(() => {
  return (fertilizerTypesRecords.value || []).map((item) => ({
    label: item.name,
    id: item.name,
  }));
});

const mappedPesticideTypesRecords = computed(() => {
  return (pesticideTypesRecords.value || []).map((item) => ({
    label: item.name,
    id: item.name,
  }));
});

const fetchOwnerFarms = async (ownerId) => {
  if (!ownerId) {
    farmsStore.$patch({ records: [] });
    return;
  }

  await farmsStore.fetchRecords({
    owner_id: ownerId,
    per_page: 1000,
  });
};

// ===== LIFECYCLE =====
onMounted(async () => {
  await usersStore.fetchRecords({
    role: "farm_owner",
    per_page: 1000,
  });

  const [fertilizerTypesResponse, pesticideTypesResponse] = await Promise.all([
    FertilizerTypesServices.get(),
    PesticideTypesServices.get(),
  ]);

  fertilizerTypesRecords.value = fertilizerTypesResponse?.data || [];
  pesticideTypesRecords.value = pesticideTypesResponse?.data || [];
});

watch(
  () => report.value.owner,
  async (newOwner, oldOwner) => {
    if (!newOwner) {
      report.value.farm_id = null;
      report.value.palm_type_id = null;
      farmsStore.$patch({ records: [] });
      return;
    }

    if (newOwner !== oldOwner) {
      report.value.farm_id = null;
      report.value.palm_type_id = null;
    }

    await fetchOwnerFarms(newOwner);
  },
);

watch(
  () => report.value.farm_id,
  (newFarmId, oldFarmId) => {
    if (newFarmId !== oldFarmId) {
      report.value.palm_type_id = null;
    }
  },
);

// ===== METHODS =====
const submitForm = async () => {
  v$.value.$validate();
  if (v$.value.$invalid) return;

  await reportsStore.createRecord(report.value);
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

  v$.value.$reset();
};

const navigateBack = () => {
  router.push({ name: "reports_list" });
};

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

const createRow = (date) => {
  const dayIndex = date.getDay();
  const dayName = t(`reports.form.options.days.${dayIndex}`);

  return {
    day: dayName,
    date: moment(date).format("YYYY-MM-DD"),
    fertilizations: [
      {
        type_of_fertilization: "0",
        fertilizer_quantity_per_palm_tree: "0",
      },
    ],
    irrigation_amount_per_palm_tree: "0",
    duration_of_irrigation_per_palm_tree: "0",
    total_amount_of_irrigation: "0",
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
</script>

<style lang="scss" scoped>
.report-create {
  min-height: 100%;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 28%),
    linear-gradient(180deg, #f8fbff 0%, #f4f8ff 100%);

  &__hero {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 24px;
    border-radius: 24px;
    border: 1px solid rgba(59, 130, 246, 0.14);
    background: linear-gradient(135deg, var(--blue-700) 0%, var(--blue-500) 100%);
    box-shadow: 0 18px 40px rgba(37, 99, 235, 0.16);

    &::before {
      content: "";
      position: absolute;
      top: -70px;
      right: -70px;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
    }

    &::after {
      content: "";
      position: absolute;
      bottom: -80px;
      left: -50px;
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
    }
  }

  &__hero-content,
  &__hero-side {
    position: relative;
    z-index: 1;
  }

  &__hero-content {
    max-width: 760px;
  }

  &__eyebrow {
    margin: 0 0 8px;
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.78);
  }

  &__hero-title {
    margin: 0 0 10px;
    font-size: clamp(2rem, 2.6vw, 3rem);
    line-height: 1.25;
    font-weight: 800;
    color: var(--white);
  }

  &__hero-text {
    margin: 0;
    font-size: 1.35rem;
    line-height: 1.9;
    color: rgba(255, 255, 255, 0.88);
  }

  &__stat-card {
    min-width: 180px;
    padding: 18px 20px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(10px);
  }

  &__stat-label {
    display: block;
    margin-bottom: 8px;
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
  }

  &__stat-value {
    display: block;
    font-size: 2.3rem;
    font-weight: 800;
    color: var(--white);
  }

  &__section,
  &__actions-shell {
    padding: 18px;
    border-radius: 24px;
    border: 1px solid var(--blue-100);
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
  }

  &__section-head {
    margin-bottom: 16px;
  }

  &__section-title {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--blue-800);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
  }

  &__stack,
  &__weeks,
  &__rows,
  &__day-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__field-card,
  &__row-card {
    padding: 16px;
    border-radius: 20px;
    border: 1px solid var(--blue-100);
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
  }

  &__week-shell {
    border-radius: 22px;
  }

  &__week-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
  }

  &__week-title {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--blue-800);
  }

  &__week-dates {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 1.08rem;
    font-weight: 700;
    color: var(--blue-700);
    background: #eff6ff;
    border: 1px solid var(--blue-100);
  }

  &__sub-section {
    padding: 16px;
    border-radius: 18px;
    border: 1px solid #e7f0ff;
    background: #fbfdff;
  }

  &__sub-head {
    margin-bottom: 12px;
  }

  &__sub-title {
    margin: 0;
    font-size: 1.28rem;
    font-weight: 800;
    color: var(--blue-700);
  }

  &__fertilization-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 12px;
    align-items: end;
    margin-bottom: 12px;
  }

  &__remove-btn {
    align-self: center;
  }

  &__add-btn {
    margin-top: 4px;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__action {
    min-width: 120px;
  }
}

:deep(.report-create__field-card .base-input),
:deep(.report-create__field-card .base-select),
:deep(.report-create__field-card .base-date-picker),
:deep(.report-create__field-card .base-text-editor) {
  width: 100%;
}

:deep(.accordion),
:deep(.accordion-item) {
  border-radius: 18px;
  overflow: hidden;
}

:deep(input),
:deep(textarea),
:deep(.dp__main),
:deep(.ql-container),
:deep(.ql-toolbar) {
  border-radius: 14px !important;
}
</style>