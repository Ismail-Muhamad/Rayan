<template>
  <section class="farm-info-grid">
    <div class="farm-info-grid__head">
      <div class="farm-info-grid__title-wrapper">
        <div class="farm-info-grid__title-icon">
          <BaseIcon name="solar:info-square-outline" width="22" height="22" />
        </div>
        <h2 class="farm-info-grid__title">
          {{ t("farms.table.headers.farm_info") }}
        </h2>
      </div>
    </div>

    <div class="farm-info-grid__body">
      <!-- Farm Name Card -->
      <div class="farm-info-grid__card">
        <div class="farm-info-grid__card-icon farm-info-grid__card-icon--blue">
          <BaseIcon name="solar:home-smile-outline" width="24" height="24" />
        </div>
        <div class="farm-info-grid__card-details">
          <span class="farm-info-grid__card-label">{{ t("farms.table.headers.farm_name") }}</span>
          <strong class="farm-info-grid__card-value">{{ farmRecord?.name || "-" }}</strong>
        </div>
      </div>

      <!-- Location Card -->
      <div class="farm-info-grid__card">
        <div class="farm-info-grid__card-icon farm-info-grid__card-icon--green">
          <BaseIcon name="solar:map-point-outline" width="24" height="24" />
        </div>
        <div class="farm-info-grid__card-details">
          <span class="farm-info-grid__card-label">{{ t("farms.table.headers.location") }}</span>
          <strong class="farm-info-grid__card-value">{{ farmRecord?.location || "-" }}</strong>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import BaseIcon from "@/components/shared/BaseIcon.vue";

const props = defineProps({
  farmRecord: {
    type: Object,
    default: () => ({}),
  },
});

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.farm-info-grid {
  padding: 24px;
  border-radius: 24px;
  border: 1px solid var(--blue-100);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.05);

  &__head {
    margin-bottom: 20px;
  }

  &__title-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__title-icon {
    display: grid;
    place-items: center;
    color: var(--blue-600);
    background: rgba(59, 130, 246, 0.08);
    width: 38px;
    height: 38px;
    border-radius: 10px;
  }

  &__title {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--blue-800);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 18px;
    border-radius: 20px;
    border: 1px solid var(--blue-100);
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.03);
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      border-color: var(--blue-200);
      box-shadow: 0 12px 24px rgba(37, 99, 235, 0.08);
    }
  }

  &__card-icon {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);

    &--blue {
      color: var(--blue-600);
      background: rgba(59, 130, 246, 0.08);
    }

    &--green {
      color: #10b981;
      background: rgba(16, 185, 129, 0.08);
    }
  }

  &__card-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__card-label {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--blue-600);
  }

  &__card-value {
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--slate-900);
    word-break: break-word;
    line-height: 1.4;
  }
}

@media (max-width: 576px) {
  .farm-info-grid {
    padding: 16px;
    border-radius: 20px;

    &__card {
      padding: 14px;
      gap: 12px;
    }

    &__card-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
    }
  }
}
</style>
