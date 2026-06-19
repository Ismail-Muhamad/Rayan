<template>
  <section class="reports-hero">
    <!-- Decorative Background Patterns -->
    <div class="reports-hero__pattern reports-hero__pattern--1"></div>
    <div class="reports-hero__pattern reports-hero__pattern--2"></div>
    <div class="reports-hero__pattern reports-hero__pattern--3"></div>

    <div class="reports-hero__inner">
      <!-- Text Content -->
      <div class="reports-hero__content">
        <div class="reports-hero__badge">
          <BaseIcon name="solar:document-text-outline" width="18" height="18" />
          <span>{{ t("reports.title") }}</span>
        </div>

        <h2 class="reports-hero__title">
          إدارة التقارير بشكل مرتب وواضح
        </h2>

        <p class="reports-hero__text">
          عرض المزارع المرتبطة بالتقارير والوصول السريع للتعديل أو الحذف أو فتح
          التقرير.
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="reports-hero__stats">
        <div class="reports-hero__stat-card reports-hero__stat-card--primary">
          <div class="reports-hero__stat-icon reports-hero__stat-icon--primary">
            <BaseIcon name="solar:buildings-outline" width="24" height="24" />
          </div>
          <div class="reports-hero__stat-info">
            <span class="reports-hero__stat-label">إجمالي المزارع</span>
            <strong class="reports-hero__stat-value">
              {{ totalFarms }}
            </strong>
          </div>
        </div>

        <!-- <div class="reports-hero__stat-card reports-hero__stat-card--accent">
          <div class="reports-hero__stat-icon reports-hero__stat-icon--accent">
            <BaseIcon name="solar:clipboard-list-outline" width="24" height="24" />
          </div>
          <div class="reports-hero__stat-info">
            <span class="reports-hero__stat-label">إجمالي التقارير</span>
            <strong class="reports-hero__stat-value">
              {{ totalReports }}
            </strong>
          </div>
        </div> -->
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import BaseIcon from "@/components/shared/BaseIcon.vue";

defineProps({
  totalFarms: {
    type: [Number, String],
    default: 0,
  },
  totalReports: {
    type: [Number, String],
    default: 0,
  },
});

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.reports-hero {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  background: linear-gradient(135deg, var(--blue-700) 0%, #4f46e5 50%, var(--blue-500) 100%);
  box-shadow:
    0 20px 50px rgba(37, 99, 235, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.06) inset;

  &__pattern {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;

    &--1 {
      top: -80px;
      right: -60px;
      width: 220px;
      height: 220px;
      background: rgba(255, 255, 255, 0.07);
      animation: float-slow 8s ease-in-out infinite;
    }

    &--2 {
      bottom: -90px;
      left: -40px;
      width: 180px;
      height: 180px;
      background: rgba(255, 255, 255, 0.05);
      animation: float-slow 10s ease-in-out infinite reverse;
    }

    &--3 {
      top: 40%;
      right: 30%;
      width: 100px;
      height: 100px;
      background: rgba(255, 255, 255, 0.04);
      animation: float-slow 6s ease-in-out infinite;
    }
  }

  &__inner {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    padding: 32px 36px;
  }

  &__content {
    max-width: 600px;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    border-radius: 99px;
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: rgba(255, 255, 255, 0.95);
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(6px);
    margin-bottom: 16px;
  }

  &__title {
    margin: 0 0 12px;
    font-size: clamp(2.2rem, 2.8vw, 3.2rem);
    font-weight: 800;
    line-height: 1.3;
    color: var(--white);
  }

  &__text {
    margin: 0;
    font-size: 1.4rem;
    line-height: 1.9;
    color: rgba(255, 255, 255, 0.85);
  }

  &__stats {
    display: flex;
    gap: 16px;
    flex-shrink: 0;
  }

  &__stat-card {
    min-width: 170px;
    padding: 20px 22px;
    border-radius: 22px;
    display: flex;
    align-items: center;
    gap: 14px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(12px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
    transition: transform 0.25s ease, background-color 0.25s ease;

    &:hover {
      transform: translateY(-3px);
      background: rgba(255, 255, 255, 0.14);
    }
  }

  &__stat-icon {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    flex-shrink: 0;

    &--primary {
      background: rgba(255, 255, 255, 0.15);
      color: var(--white);
    }

    &--accent {
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
    }
  }

  &__stat-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__stat-label {
    font-size: 1.15rem;
    color: rgba(255, 255, 255, 0.75);
    white-space: nowrap;
  }

  &__stat-value {
    font-size: 2.4rem;
    font-weight: 800;
    color: var(--white);
  }
}

@keyframes float-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

@media (max-width: 992px) {
  .reports-hero {
    &__inner {
      flex-direction: column;
      align-items: stretch;
    }

    &__stats {
      justify-content: stretch;
    }

    &__stat-card {
      flex: 1;
    }
  }
}

@media (max-width: 576px) {
  .reports-hero {
    &__inner {
      padding: 24px 20px;
    }

    &__title {
      font-size: 2rem;
    }

    &__text {
      font-size: 1.2rem;
    }

    &__stats {
      flex-direction: column;
    }

    &__stat-card {
      min-width: unset;
    }
  }
}
</style>
