<template>
  <section class="reports-cards-section">
    <!-- Loading State -->
    <div v-if="isLoading" class="reports-cards__loading">
      <BaseLoader />
    </div>

    <!-- Empty State -->
    <div v-else-if="!items.length" class="reports-cards__empty">
      <div class="reports-cards__empty-icon">
        <BaseIcon name="solar:document-text-outline" width="56" height="56" />
      </div>
      <h3 class="reports-cards__empty-title">لا توجد مزارع حالياً</h3>
      <p class="reports-cards__empty-text">قم بإنشاء تقرير جديد للبدء</p>
    </div>

    <!-- Cards Grid -->
    <div v-else class="reports-cards__grid">
      <div
        v-for="item in items"
        :key="item.id"
        class="farm-card"
      >
        <!-- Card Top Accent -->
        <div
          class="farm-card__accent"
          :style="{ background: getCardGradient(item.farm_name) }"
        ></div>

        <!-- Card Body -->
        <div class="farm-card__body">
          <!-- Farm Header -->
          <router-link
            :to="{ name: 'show_report', params: { id: item.id } }"
            class="farm-card__link"
          >
            <div class="farm-card__header">
              <div
                class="farm-card__avatar"
                :style="{ background: getCardGradient(item.farm_name) }"
              >
                {{ getInitials(item.farm_name) }}
              </div>
              <div class="farm-card__title-group">
                <h3 class="farm-card__name">{{ item.farm_name }}</h3>
              </div>
            </div>
          </router-link>

          <!-- Info Rows -->
          <div class="farm-card__details">
            <div class="farm-card__detail-row">
              <div class="farm-card__detail-icon farm-card__detail-icon--location">
                <BaseIcon name="solar:map-point-outline" width="18" height="18" />
              </div>
              <div class="farm-card__detail-content">
                <span class="farm-card__detail-label">الموقع</span>
                <span class="farm-card__detail-value">{{ item.location || "—" }}</span>
              </div>
            </div>

            <div class="farm-card__detail-row">
              <div class="farm-card__detail-icon farm-card__detail-icon--owner">
                <BaseIcon name="solar:user-rounded-outline" width="18" height="18" />
              </div>
              <div class="farm-card__detail-content">
                <span class="farm-card__detail-label">المالك</span>
                <span class="farm-card__detail-value">{{ item.owner_name || "—" }}</span>
              </div>
            </div>
          </div>

          <!-- Card Actions Footer -->
          <div class="farm-card__footer">
            <router-link
              :to="{ name: 'show_report', params: { id: item.id } }"
              class="farm-card__action-btn farm-card__action-btn--view"
            >
              <BaseIcon name="solar:eye-outline" width="18" height="18" />
              <span>عرض</span>
            </router-link>

            <button
              type="button"
              class="farm-card__action-btn farm-card__action-btn--edit"
              @click="$emit('row-action', 'edit', item)"
            >
              <BaseIcon name="solar:pen-2-outline" width="18" height="18" />
              <span>تعديل</span>
            </button>

            <button
              type="button"
              class="farm-card__action-btn farm-card__action-btn--delete"
              @click="$emit('row-action', 'delete', item)"
            >
              <BaseIcon name="solar:trash-bin-minimalistic-outline" width="18" height="18" />
              <span>حذف</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="items.length && meta?.total" class="reports-cards__pagination">
      <BasePagination :meta="meta" @page-change="(page) => $emit('page-change', page)" />
    </div>
  </section>
</template>

<script setup>
import BaseIcon from "@/components/shared/BaseIcon.vue";
import BaseLoader from "@/components/shared/BaseLoader.vue";
import BasePagination from "@/components/shared/Table/BasePagination.vue";

defineProps({
  items: {
    type: Array,
    required: true,
  },
  meta: {
    type: Object,
    default: () => ({}),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["page-change", "row-action"]);

const GRADIENTS = [
  "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  "linear-gradient(135deg, #8b5cf6, #6d28d9)",
  "linear-gradient(135deg, #06b6d4, #0e7490)",
  "linear-gradient(135deg, #10b981, #047857)",
  "linear-gradient(135deg, #f59e0b, #b45309)",
  "linear-gradient(135deg, #ef4444, #b91c1c)",
  "linear-gradient(135deg, #ec4899, #be185d)",
  "linear-gradient(135deg, #6366f1, #4338ca)",
];

const getCardGradient = (name) => {
  if (!name) return GRADIENTS[0];
  const charSum = name.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return GRADIENTS[charSum % GRADIENTS.length];
};

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
};
</script>

<style lang="scss" scoped>
.reports-cards-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.reports-cards {
  &__loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 320px;
    padding: 40px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.9);
    border: 2px dashed #e2e8f0;
  }

  &__empty-icon {
    display: grid;
    place-items: center;
    width: 88px;
    height: 88px;
    border-radius: 24px;
    background: #f1f5f9;
    color: var(--slate-400);
    margin-bottom: 8px;
  }

  &__empty-title {
    margin: 0;
    font-size: 1.7rem;
    font-weight: 800;
    color: var(--slate-700);
  }

  &__empty-text {
    margin: 0;
    font-size: 1.3rem;
    color: var(--slate-500);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 22px;
  }

  &__pagination {
    padding: 16px 20px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #eef2f6;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
  }
}

/* ─── Farm Card ─── */
.farm-card {
  position: relative;
  border-radius: 22px;
  background: #ffffff;
  border: 1px solid #eef2f6;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
    border-color: var(--blue-200);
  }

  &__accent {
    height: 5px;
    width: 100%;
    flex-shrink: 0;
  }

  &__body {
    padding: 22px 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
  }

  &__link {
    text-decoration: none;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__avatar {
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 16px;
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--white);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
    transition: transform 0.25s ease;

    .farm-card:hover & {
      transform: scale(1.06) rotate(-2deg);
    }
  }

  &__title-group {
    min-width: 0;
    flex: 1;
  }

  &__name {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--slate-800);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.2s;

    .farm-card__link:hover & {
      color: var(--blue-600);
    }
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #f1f5f9;
  }

  &__detail-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__detail-icon {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    flex-shrink: 0;

    &--location {
      background: rgba(59, 130, 246, 0.08);
      color: var(--blue-500);
    }

    &--owner {
      background: rgba(139, 92, 246, 0.08);
      color: #8b5cf6;
    }
  }

  &__detail-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__detail-label {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--slate-400);
  }

  &__detail-value {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--slate-700);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 4px;
    border-top: 1px solid #f1f5f9;
    margin-top: auto;
  }

  &__action-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 8px;
    border-radius: 12px;
    border: 1.5px solid transparent;
    font-size: 1.2rem;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s ease;

    &--view {
      background: rgba(59, 130, 246, 0.06);
      color: var(--blue-600);
      border-color: rgba(59, 130, 246, 0.12);

      &:hover {
        background: var(--blue-600);
        color: var(--white);
        border-color: var(--blue-600);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
      }
    }

    &--edit {
      background: rgba(245, 158, 11, 0.06);
      color: #d97706;
      border-color: rgba(245, 158, 11, 0.12);

      &:hover {
        background: #d97706;
        color: var(--white);
        border-color: #d97706;
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);
      }
    }

    &--delete {
      background: rgba(239, 68, 68, 0.06);
      color: #dc2626;
      border-color: rgba(239, 68, 68, 0.12);

      &:hover {
        background: #dc2626;
        color: var(--white);
        border-color: #dc2626;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
      }
    }
  }
}

@media (max-width: 768px) {
  .reports-cards__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .farm-card {
    &__body {
      padding: 18px;
    }

    &__footer {
      flex-wrap: wrap;
    }
  }
}
</style>
