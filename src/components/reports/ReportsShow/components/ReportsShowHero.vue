<template>
  <section class="report-show__hero">
    <!-- Background patterns for dynamic premium look -->
    <div class="report-show__hero-pattern report-show__hero-pattern--1"></div>
    <div class="report-show__hero-pattern report-show__hero-pattern--2"></div>

    <div class="report-show__hero-main">
      <div class="report-show__avatar">
        {{ getInitials(farmRecord?.name) }}
      </div>

      <div class="report-show__hero-text">
        <p class="report-show__eyebrow">
          {{ t("farms.table.headers.farm_info") }}
        </p>

        <h1 class="report-show__hero-title">
          {{ farmRecord?.name || "-" }}
        </h1>

        <div class="report-show__hero-meta">
          <span class="report-show__meta-chip">
            <BaseIcon name="solar:map-point-outline" width="18" height="18" />
            {{ farmRecord?.location || "-" }}
          </span>

          <span class="report-show__meta-chip report-show__meta-chip--light">
            <BaseIcon name="solar:leaf-outline" width="18" height="18" />
            {{ palmTypesCount }}
            {{ t("farms.table.headers.palm_types") }}
          </span>
        </div>
      </div>
    </div>

    <div class="report-show__hero-side">
      <div class="report-show__stat-card">
        <div class="report-show__stat-icon-wrapper">
          <BaseIcon name="solar:document-text-outline" class="report-show__stat-icon" width="28" height="28" />
        </div>
        <div class="report-show__stat-details">
          <span class="report-show__stat-label">
            {{ t("farms.table.headers.reports") }}
          </span>
          <strong class="report-show__stat-value">
            {{ reportsCount }}
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
  farmRecord: {
    type: Object,
    default: () => ({}),
  },
  palmTypesCount: {
    type: Number,
    default: 0,
  },
  reportsCount: {
    type: Number,
    default: 0,
  },
});

const { t } = useI18n();

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
};
</script>

<style lang="scss" scoped>
.report-show {
  &__hero {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 32px;
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: linear-gradient(135deg, var(--blue-800) 0%, var(--blue-600) 50%, var(--blue-500) 100%);
    box-shadow: 
      0 20px 40px rgba(37, 99, 235, 0.14),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      box-shadow: 
        0 24px 48px rgba(37, 99, 235, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.25);
    }
  }

  &__hero-pattern {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;

    &--1 {
      top: -60px;
      right: -60px;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
      filter: blur(10px);
    }

    &--2 {
      bottom: -80px;
      left: -40px;
      width: 180px;
      height: 180px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%);
      filter: blur(15px);
    }
  }

  &__hero-main {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 20px;
    flex: 1;
  }

  &__hero-side {
    position: relative;
    z-index: 1;
  }

  &__avatar {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 20px;
    color: var(--white);
    font-size: 2.2rem;
    font-weight: 800;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.08) 100%);
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    transform: rotate(-3deg);
    transition: transform 0.3s ease;

    &:hover {
      transform: rotate(0deg) scale(1.05);
    }
  }

  &__hero-text {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__eyebrow {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.75);
  }

  &__hero-title {
    margin: 0;
    font-size: clamp(1.8rem, 2.5vw, 2.6rem);
    line-height: 1.25;
    font-weight: 900;
    color: var(--white);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &__hero-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 4px;
  }

  &__meta-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 34px;
    padding: 6px 14px;
    border-radius: 99px;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--white);
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(4px);
    transition: background 0.2s ease, border-color 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.22);
      border-color: rgba(255, 255, 255, 0.3);
    }

    &--light {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.12);

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.2);
      }
    }
  }

  &__stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 200px;
    padding: 16px 20px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(12px);
    box-shadow: 
      0 10px 30px rgba(0, 0, 0, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition: transform 0.2s ease, background 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.14);
    }
  }

  &__stat-icon-wrapper {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    border-radius: 14px;
    color: var(--white);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  }

  &__stat-details {
    display: flex;
    flex-direction: column;
  }

  &__stat-label {
    font-size: 1.15rem;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 700;
  }

  &__stat-value {
    font-size: 2.2rem;
    font-weight: 900;
    color: var(--white);
    line-height: 1.1;
  }
}

@media (max-width: 992px) {
  .report-show {
    &__hero {
      flex-direction: column;
      align-items: stretch;
      padding: 24px;
    }

    &__hero-main {
      align-items: flex-start;
    }

    &__stat-card {
      min-width: 100%;
    }
  }
}

@media (max-width: 576px) {
  .report-show {
    &__avatar {
      width: 64px;
      height: 64px;
      font-size: 1.8rem;
      border-radius: 16px;
    }
  }
}
</style>
