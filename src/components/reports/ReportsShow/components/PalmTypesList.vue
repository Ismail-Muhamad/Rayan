<template>
  <section class="palm-types-list">
    <div class="palm-types-list__head">
      <div class="palm-types-list__title-wrapper">
        <div class="palm-types-list__title-icon">
          <BaseIcon name="solar:leaf-bold" width="22" height="22" />
        </div>
        <h2 class="palm-types-list__title">
          {{ t("farms.table.headers.palm_types") }}
        </h2>
      </div>
    </div>

    <div class="palm-types-list__grid">
      <div
        v-for="(type, idx) in palmTypesInfo"
        :key="idx"
        class="palm-types-list__card"
      >
        <div class="palm-types-list__card-top">
          <div class="palm-types-list__card-icon-container">
            <BaseIcon name="solar:leaf-bold-duotone" width="28" height="28" />
          </div>
          <span class="palm-types-list__card-badge">
            {{ type.palm_count }} {{ t("farms.table.headers.palm_count") }}
          </span>
        </div>

        <div class="palm-types-list__card-body">
          <h3 class="palm-types-list__card-name">
            {{ type.palm_type }}
          </h3>
        </div>

        <div class="palm-types-list__card-footer">
          <span class="palm-types-list__card-age-label">
            {{ t("farms.table.headers.palm_age") }}:
          </span>
          <strong class="palm-types-list__card-age-value">
            {{ type.palm_age }}
          </strong>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import BaseIcon from "@/components/shared/BaseIcon.vue";

const props = defineProps({
  palmTypesInfo: {
    type: Array,
    default: () => [],
  },
});

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.palm-types-list {
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
    color: #10b981;
    background: rgba(16, 185, 129, 0.08);
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

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  &__card {
    position: relative;
    overflow: hidden;
    padding: 20px;
    border-radius: 20px;
    border: 1px solid #eef2f6;
    background: linear-gradient(135deg, #ffffff 0%, #f7fcf9 100%);
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.02);
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), 
                box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), 
                border-color 0.25s ease;

    &::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(180deg, #10b981 0%, #34d399 100%);
      opacity: 0.8;
    }

    &:hover {
      transform: translateY(-4px);
      border-color: rgba(16, 185, 129, 0.2);
      box-shadow: 0 16px 30px rgba(16, 185, 129, 0.08);
    }
  }

  &__card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  &__card-icon-container {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border-radius: 12px;
    color: #10b981;
    background: rgba(16, 185, 129, 0.08);
    transition: transform 0.3s ease;

    .palm-types-list__card:hover & {
      transform: rotate(15deg) scale(1.1);
    }
  }

  &__card-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 99px;
    font-size: 1.1rem;
    font-weight: 700;
    color: #047857;
    background: #ecfdf5;
    border: 1px solid rgba(16, 185, 129, 0.15);
  }

  &__card-body {
    min-width: 0;
  }

  &__card-name {
    margin: 0;
    font-size: 1.45rem;
    font-weight: 800;
    color: var(--slate-900);
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__card-footer {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-top: 10px;
    border-top: 1px dashed #eef2f6;
    font-size: 1.15rem;
  }

  &__card-age-label {
    color: var(--slate-500);
    font-weight: 600;
  }

  &__card-age-value {
    color: var(--slate-800);
    font-weight: 700;
  }
}

@media (max-width: 576px) {
  .palm-types-list {
    padding: 16px;
    border-radius: 20px;

    &__card {
      padding: 16px;
    }
  }
}
</style>
