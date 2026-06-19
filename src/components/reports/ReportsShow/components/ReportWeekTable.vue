<template>
  <div 
    class="report-week-card" 
    :class="{ 'report-week-card--open': isOpen }"
  >
    <!-- Collapsible Week Header Button -->
    <button
      type="button"
      class="report-week-card__header"
      @click="isOpen = !isOpen"
    >
      <div class="report-week-card__header-left">
        <div class="report-week-card__icon-wrapper">
          <BaseIcon name="solar:calendar-date-outline" width="28" height="28" />
        </div>
        <h3 class="report-week-card__title">
          {{ t(`farms.form.options.week_number.${week.week_number}`) }}
        </h3>
      </div>

      <div class="report-week-card__header-right">
        <span class="report-week-card__days-badge">
          {{ week.days.length }} {{ t("farms.show.days_count") || "أيام" }}
        </span>
        <BaseIcon 
          name="solar:alt-arrow-down-outline" 
          width="20" 
          height="20" 
          class="report-week-card__chevron" 
        />
      </div>
    </button>

    <!-- Collapsible Content Body -->
    <transition name="fade-slide">
      <div v-show="isOpen" class="report-week-card__body">
        <!-- Daily activity cards grid -->
        <div class="report-week-card__days-grid">
          <div
            v-for="day in week.days"
            :key="day.date"
            class="day-activity-card"
          >
            <!-- Day Card Header -->
            <div class="day-activity-card__header">
              <div class="day-activity-card__day-info">
                <BaseIcon name="solar:calendar-outline" width="22" height="22" class="day-activity-card__cal-icon" />
                <span class="day-activity-card__day-name">{{ day.day }}</span>
              </div>
              <span class="day-activity-card__date">{{ day.date }}</span>
            </div>

            <!-- Day Card Body -->
            <div class="day-activity-card__body">
              
              <!-- 1. Fertilization Block -->
              <div
                v-if="hasFertilization(day)"
                class="activity-block activity-block--fertilization"
              >
                <div class="activity-block__header">
                  <div class="activity-block__header-left">
                    <BaseIcon name="solar:leaf-bold" width="24" height="24" class="activity-block__icon" />
                    <strong class="activity-block__title">{{ t("farms.table.headers.fertilization_section") }}</strong>
                  </div>
                  <div class="activity-block__actions">
                    <button class="activity-block__delete-btn" @click.stop="$emit('delete-activity', { dayDate: day.date, activityType: 'fertilization' })">
                      <BaseIcon name="solar:trash-bin-trash-bold" width="16" height="16" />
                    </button>
                    <button class="activity-block__edit-btn" @click.stop="$emit('edit-activity', { dayDate: day.date, activityType: 'fertilization' })">
                      <BaseIcon name="solar:pen-bold" width="16" height="16" />
                    </button>
                  </div>
                </div>
                <div class="activity-block__content">
                  <div
                    v-for="(f, i) in getActiveFertilizations(day)"
                    :key="i"
                    class="activity-block__sub-item"
                  >
                    <div class="activity-block__item-name">
                      <BaseIcon name="solar:hashtag-outline" width="16" height="16" class="activity-block__hash-icon" />
                      {{ f.type_of_fertilization }}
                    </div>
                    <div class="activity-block__details-list">
                      <div class="activity-block__detail-row">
                        <span class="activity-block__detail-label">{{ t("farms.table.headers.fertilizer_quantity_per_palm_tree") }}:</span>
                        <strong class="activity-block__detail-value">{{ f.fertilizer_quantity_per_palm_tree }}</strong>
                      </div>
                      <div class="activity-block__detail-row">
                        <span class="activity-block__detail-label">{{ t("farms.table.headers.fertilization_total") }}:</span>
                        <strong class="activity-block__detail-value">{{ f.fertilization_total }}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2. Irrigation Block -->
              <div
                v-if="hasIrrigation(day)"
                class="activity-block activity-block--irrigation"
              >
                <div class="activity-block__header">
                  <div class="activity-block__header-left">
                    <BaseIcon name="solar:droplet-bold" width="24" height="24" class="activity-block__icon" />
                    <strong class="activity-block__title">{{ t("farms.table.headers.irrigation_section") }}</strong>
                  </div>
                  <div class="activity-block__actions">
                    <button class="activity-block__delete-btn" @click.stop="$emit('delete-activity', { dayDate: day.date, activityType: 'irrigation' })">
                      <BaseIcon name="solar:trash-bin-trash-bold" width="16" height="16" />
                    </button>
                    <button class="activity-block__edit-btn" @click.stop="$emit('edit-activity', { dayDate: day.date, activityType: 'irrigation' })">
                      <BaseIcon name="solar:pen-bold" width="16" height="16" />
                    </button>
                  </div>
                </div>
                <div class="activity-block__content">
                  <div class="activity-block__details-list">
                    <div 
                      v-if="day.irrigation_amount_per_palm_tree !== t('farms.form.no_quantity')"
                      class="activity-block__detail-row"
                    >
                      <span class="activity-block__detail-label">{{ t("farms.table.headers.irrigation_amount_per_palm_tree") }}:</span>
                      <strong class="activity-block__detail-value">{{ day.irrigation_amount_per_palm_tree }}</strong>
                    </div>
                    <div 
                      v-if="day.total_amount_of_irrigation !== t('farms.form.no_quantity')"
                      class="activity-block__detail-row"
                    >
                      <span class="activity-block__detail-label">{{ t("farms.table.headers.total_amount_of_irrigation") }}:</span>
                      <strong class="activity-block__detail-value">{{ day.total_amount_of_irrigation }}</strong>
                    </div>
                    <div 
                      v-if="day.duration_of_irrigation_per_palm_tree !== t('farms.form.no_quantity')"
                      class="activity-block__detail-row"
                    >
                      <span class="activity-block__detail-label">{{ t("farms.table.headers.duration_of_irrigation_per_palm_tree") }}:</span>
                      <strong class="activity-block__detail-value">{{ day.duration_of_irrigation_per_palm_tree }}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 3. Spraying Block -->
              <div
                v-if="hasSpraying(day)"
                class="activity-block activity-block--spraying"
              >
                <div class="activity-block__header">
                  <div class="activity-block__header-left">
                    <BaseIcon name="solar:shield-warning-bold" width="24" height="24" class="activity-block__icon" />
                    <strong class="activity-block__title">{{ t("farms.table.headers.spraying_section") }}</strong>
                  </div>
                  <div class="activity-block__actions">
                    <button class="activity-block__delete-btn" @click.stop="$emit('delete-activity', { dayDate: day.date, activityType: 'spraying' })">
                      <BaseIcon name="solar:trash-bin-trash-bold" width="16" height="16" />
                    </button>
                    <button class="activity-block__edit-btn" @click.stop="$emit('edit-activity', { dayDate: day.date, activityType: 'spraying' })">
                      <BaseIcon name="solar:pen-bold" width="16" height="16" />
                    </button>
                  </div>
                </div>
                <div class="activity-block__content">
                  <div class="activity-block__sub-item">
                    <div class="activity-block__item-name">
                      <BaseIcon name="solar:hashtag-outline" width="16" height="16" class="activity-block__hash-icon" />
                      {{ day.spraying }}
                    </div>
                    <div class="activity-block__details-list">
                      <div 
                        v-if="day.spraying_per_tree !== t('farms.form.no_quantity')"
                        class="activity-block__detail-row"
                      >
                        <span class="activity-block__detail-label">{{ t("farms.table.headers.spraying_per_tree") }}:</span>
                        <strong class="activity-block__detail-value">{{ day.spraying_per_tree }}</strong>
                      </div>
                      <div 
                        v-if="day.amount_of_spray !== t('farms.form.no_quantity')"
                        class="activity-block__detail-row"
                      >
                        <span class="activity-block__detail-label">{{ t("farms.table.headers.amount_of_spray") }}:</span>
                        <strong class="activity-block__detail-value">{{ day.amount_of_spray }}</strong>
                      </div>
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
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import BaseIcon from "@/components/shared/BaseIcon.vue";

const props = defineProps({
  week: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["edit-activity", "delete-activity"]);

const { t } = useI18n();

// Collapsible state (Closed by default)
const isOpen = ref(false);

const hasFertilization = (day) => {
  return (
    day.fertilizations &&
    day.fertilizations.length > 0 &&
    day.fertilizations.some(
      (f) => f.type_of_fertilization !== t("farms.form.no_quantity"),
    )
  );
};

const getActiveFertilizations = (day) => {
  return (day.fertilizations || []).filter(
    (f) => f.type_of_fertilization !== t("farms.form.no_quantity"),
  );
};

const hasIrrigation = (day) => {
  return (
    (day.irrigation_amount_per_palm_tree &&
      day.irrigation_amount_per_palm_tree !== t("farms.form.no_quantity")) ||
    (day.duration_of_irrigation_per_palm_tree &&
      day.duration_of_irrigation_per_palm_tree !==
        t("farms.form.no_quantity")) ||
    (day.total_amount_of_irrigation &&
      day.total_amount_of_irrigation !== t("farms.form.no_quantity"))
  );
};

const hasSpraying = (day) => {
  return (
    (day.spraying && day.spraying !== t("farms.form.no_quantity")) ||
    (day.spraying_per_tree &&
      day.spraying_per_tree !== t("farms.form.no_quantity")) ||
    (day.amount_of_spray && day.amount_of_spray !== t("farms.form.no_quantity"))
  );
};
</script>

<style lang="scss" scoped>
.report-week-card {
  padding: 0;
  border-radius: 20px;
  border: 1px solid #eef2f6;
  background: #ffffff;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.02);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    border-color: var(--blue-100);
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  }

  &--open {
    border-color: var(--blue-100);
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  }

  &__header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 28px;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: start;
    outline: none;
    transition: background-color 0.2s;

    &:hover {
      background-color: #fbfdff;
    }
  }

  &__header-left,
  &__header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__icon-wrapper {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    color: var(--blue-600);
    background: rgba(59, 130, 246, 0.08);
  }

  &__title {
    margin: 0;
    font-size: 1.9rem;
    font-weight: 800;
    color: var(--blue-700);
  }

  &__days-badge {
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    border-radius: 99px;
    font-size: 1.45rem;
    font-weight: 700;
    color: var(--blue-700);
    background: rgba(59, 130, 246, 0.06);
  }

  &__chevron {
    color: var(--slate-400);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    .report-week-card--open & {
      transform: rotate(180deg);
      color: var(--blue-600);
    }
  }

  &__body {
    padding: 0 28px 28px 28px;
    width: 100%;
  }

  &__days-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px; // Enlarged spacing
    width: 100%;
  }
}

.day-activity-card {
  border-radius: 18px;
  border: 1px solid #eef2f6;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.02);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--blue-100);
    box-shadow: 0 10px 24px rgba(37, 99, 235, 0.05);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 22px;
    background: #fcfdfe;
    border-bottom: 1px solid #edf2f7;
  }

  &__day-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__cal-icon {
    color: var(--blue-500);
  }

  &__day-name {
    font-size: 1.7rem;
    font-weight: 800;
    color: var(--blue-800);
  }

  &__date {
    font-size: 1.45rem;
    font-weight: 600;
    color: var(--slate-500);
  }

  &__body {
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    flex: 1;
  }
}

.activity-block {
  padding: 18px;
  border-radius: 16px;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &--fertilization {
    background: #f0fdf4;
    border-color: #dcfce7;
    
    .activity-block__icon {
      color: #16a34a;
    }
    .activity-block__title {
      color: #14532d;
    }
  }

  &--irrigation {
    background: #f0f9ff;
    border-color: #e0f2fe;

    .activity-block__icon {
      color: #0284c7;
    }
    .activity-block__title {
      color: #0c4a6e;
    }
  }

  &--spraying {
    background: #fffbeb;
    border-color: #fef3c7;

    .activity-block__icon {
      color: #d97706;
    }
    .activity-block__title {
      color: #78350f;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-radius: 12px;
    margin-bottom: 14px;
    gap: 12px;
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__edit-btn,
  &__delete-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: none;
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  &__edit-btn {
    color: var(--blue-600);
    &:hover {
      background: #ffffff;
      color: var(--blue-800);
      transform: scale(1.05);
    }
  }

  &__delete-btn {
    color: var(--red-500);
    &:hover {
      background: #ffffff;
      color: var(--red-700);
      transform: scale(1.05);
    }
  }

  &__title {
    font-size: 1.6rem;
    font-weight: 800;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__sub-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    &:not(:last-child) {
      border-bottom: 1px dashed rgba(0, 0, 0, 0.04);
      padding-bottom: 10px;
    }
  }

  &__item-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--slate-800);
  }

  &__hash-icon {
    color: var(--slate-400);
  }

  &__details-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    font-size: 1.35rem;
    line-height: 1.5;
  }

  &__detail-label {
    color: var(--slate-500);
    font-weight: 600;
  }

  &__detail-value {
    color: var(--slate-900);
    font-weight: 700;
  }
}

// Fade & Slide transition animation
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
