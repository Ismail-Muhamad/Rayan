<template>
  <BaseAccordionItem :value="report.id" class="report-item">
    <!-- Title Slot -->
    <template #title>
      <div class="report-item__header">
        <div class="report-item__header-left">
          <div class="report-item__month-icon">
            <BaseIcon name="solar:document-bold-duotone" width="26" height="26" />
          </div>
          <div class="report-item__title-details">
            <h3 class="report-item__heading">
              {{ title }}
            </h3>
            <span class="report-item__subtitle">
              <BaseIcon name="solar:leaf-outline" width="14" height="14" />
              {{ report.palm_type_name || "-" }}
            </span>
          </div>
        </div>

        <div class="report-item__actions" @click.stop>
          <!-- Quick Download Action (Direct UX Improvement) -->
          <BaseButton
            variant="soft"
            color="blue"
            size="sm"
            class="report-item__download-btn"
            :disabled="isExporting"
            @click="onAction('download')"
          >
            <BaseSpinner v-if="isExporting" size="sm" color="blue" />
            <BaseIcon v-else name="solar:download-minimalistic-outline" width="16" height="16" />
            <span class="report-item__btn-text">{{ t("reports.actions.download") }}</span>
          </BaseButton>

          <!-- Dropdown for Edit/Delete Actions -->
          <BaseButton
            dropdown
            variant="soft"
            color="gray"
            size="icon-sm"
            class="report-item__more-btn"
            :dropdownItems="filteredActions"
          >
            <template #dropdown>
              <div class="report-item__actions-dropdown">
                <BaseButton
                  v-for="item in filteredActions"
                  :key="item.action"
                  variant="soft"
                  :color="item.color"
                  size="sm"
                  class="report-item__dropdown-item"
                  @click="onAction(item.action)"
                >
                  <BaseIcon v-if="item.icon" :name="item.icon" width="16" height="16" />
                  {{ item.text }}
                </BaseButton>
              </div>
            </template>
            <BaseIcon name="pepicons-pop:dots-y" width="18" height="18" />
          </BaseButton>
        </div>
      </div>
    </template>

    <!-- Content Body Slot -->
    <div class="report-item__body">
      <div class="report-item__rich-grid">
        <!-- Review Section -->
        <div class="report-item__rich-card report-item__rich-card--review">
          <div class="report-item__card-header">
            <div class="report-item__card-icon report-item__card-icon--review">
              <BaseIcon name="solar:clipboard-list-outline" width="20" height="20" />
            </div>
            <h4 class="report-item__card-title">{{ t('farms.table.headers.review') }}</h4>
          </div>
          <div class="report-item__card-content v-html-content" v-html="report.review"></div>
        </div>

        <!-- Recommendations Section -->
        <div class="report-item__rich-card report-item__rich-card--recommendations">
          <div class="report-item__card-header">
            <div class="report-item__card-icon report-item__card-icon--recommendations">
              <BaseIcon name="solar:like-outline" width="20" height="20" />
            </div>
            <h4 class="report-item__card-title">{{ t('farms.table.headers.recommendations') }}</h4>
          </div>
          <div class="report-item__card-content v-html-content" v-html="report.recommendations"></div>
        </div>
      </div>

      <!-- Weekly Stats Loop -->
      <div class="report-item__weeks-section">
        <ReportWeekTable
          v-for="week in weeks"
          :key="week.id"
          :week="week"
          @edit-activity="(payload) => $emit('edit-activity', payload)"
          @delete-activity="(payload) => $emit('delete-activity', payload)"
        />
      </div>
    </div>
  </BaseAccordionItem>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import BaseAccordionItem from "@/components/shared/BaseAccordionItem.vue";
import BaseButton from "@/components/shared/BaseButton.vue";
import BaseIcon from "@/components/shared/BaseIcon.vue";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";
import ReportWeekTable from "./ReportWeekTable.vue";

const props = defineProps({
  report: {
    type: Object,
    required: true,
  },
  weeks: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    required: true,
  },
  exportingReportId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(["action", "edit-activity", "delete-activity"]);

const { t } = useI18n();

const isExporting = computed(() => props.exportingReportId === props.report.id);

// Actions computed array
const actions = computed(() => [
  {
    text: t("reports.actions.download"),
    icon: "solar:download-minimalistic-outline",
    color: "blue",
    action: "download",
  },
  {
    text: "إضافة يوم للتقرير",
    icon: "solar:calendar-add-outline",
    color: "green",
    action: "add-day",
  },
  {
    text: t("reports.actions.edit"),
    icon: "basil:edit-outline",
    color: "blue",
    action: "edit",
  },
  {
    text: t("reports.actions.delete"),
    icon: "solar:clipboard-remove-outline",
    color: "red",
    action: "delete",
  },
]);

// We keep edit and delete in the dropdown since download has its own direct button
const filteredActions = computed(() => {
  return actions.value.filter(item => item.action !== "download");
});

const onAction = (actionName) => {
  emit("action", { report: props.report, action: actionName });
};
</script>

<style lang="scss" scoped>
.report-item {
  border-radius: 20px;
  border: 1px solid var(--blue-100) !important;
  background: #ffffff;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04) !important;
  margin-bottom: 16px;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: var(--blue-200) !important;
    box-shadow: 0 14px 34px rgba(37, 99, 235, 0.07) !important;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    width: 100%;
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }

  &__month-icon {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    border-radius: 12px;
    color: var(--blue-600);
    background: rgba(59, 130, 246, 0.08);
    flex-shrink: 0;
  }

  &__title-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__heading {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--blue-800);
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__subtitle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 1.1rem;
    color: var(--slate-600);
    font-weight: 600;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__download-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 700;
    padding: 8px 14px;
    border-radius: 10px;
    min-height: 36px;
  }

  &__btn-text {
    font-size: 1.1rem;
  }

  &__actions-dropdown {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 6px;
  }

  &__dropdown-item {
    justify-content: flex-start;
    gap: 8px;
    width: 100%;
    font-weight: 700;
    font-size: 1.1rem;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding-top: 16px;
  }

  &__rich-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 18px;
  }

  &__rich-card {
    padding: 20px;
    border-radius: 20px;
    background: #ffffff;
    border: 1px solid #eef2f6;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.02);
    display: flex;
    flex-direction: column;
    gap: 14px;

    &--review {
      border-left: 4px solid var(--blue-500);
    }

    &--recommendations {
      border-left: 4px solid #10b981;
    }
  }

  &__card-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__card-icon {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;

    &--review {
      color: var(--blue-600);
      background: rgba(59, 130, 246, 0.08);
    }

    &--recommendations {
      color: #10b981;
      background: rgba(16, 185, 129, 0.08);
    }
  }

  &__card-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--slate-800);
  }

  &__card-content {
    font-size: 1.15rem;
    line-height: 1.7;
    color: var(--slate-700);
  }

  &__weeks-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

:deep(.v-html-content) {
  ul, ol {
    margin-block-start: 0.5em;
    margin-block-end: 0.5em;
    padding-inline-start: 24px;
  }
  p {
    margin: 0 0 8px 0;
    &:last-child {
      margin-bottom: 0;
    }
  }
}

@media (max-width: 768px) {
  .report-item {
    &__header {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    &__actions {
      justify-content: flex-end;
      width: 100%;
    }
  }
}

@media (max-width: 576px) {
  .report-item {
    &__btn-text {
      display: none;
    }

    &__download-btn {
      padding: 8px;
    }
  }
}
</style>
