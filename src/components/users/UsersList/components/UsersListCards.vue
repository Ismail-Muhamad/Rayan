<template>
  <section class="users-cards-section">
    <!-- Loading State -->
    <div v-if="isLoading" class="users-cards__loading">
      <BaseLoader />
    </div>

    <!-- Empty State -->
    <div v-else-if="!items.length" class="users-cards__empty">
      <div class="users-cards__empty-icon">
        <BaseIcon name="solar:user-cross-outline" width="56" height="56" />
      </div>
      <h3 class="users-cards__empty-title">لا يوجد مستخدمين</h3>
      <p class="users-cards__empty-text">لم يتم العثور على أي مستخدمين مسجلين</p>
    </div>

    <!-- Cards Grid -->
    <div v-else class="users-cards__grid">
      <div
        v-for="item in items"
        :key="item.id"
        class="user-card"
      >
        <!-- Card Top Accent (Dynamic based on status) -->
        <div
          class="user-card__accent"
          :class="`user-card__accent--${item.status}`"
        ></div>

        <!-- Card Body -->
        <div class="user-card__body">
          <!-- User Header -->
          <router-link
            :to="{ name: 'users_show', params: { id: item.id } }"
            class="user-card__link"
          >
            <div class="user-card__header">
              <div
                class="user-card__avatar"
                :style="{ background: getAvatarGradient(item.name) }"
              >
                {{ getInitials(item.name) }}
              </div>
              <div class="user-card__title-group">
                <h3 class="user-card__name">{{ item.name }}</h3>
                <div :class="['user-card__status-badge', `user-card__status-badge--${item.status}`]">
                  <span :class="['user-card__dot', `user-card__dot--${item.status}`]"></span>
                  {{ item.status_text }}
                </div>
              </div>
            </div>
          </router-link>

          <!-- Info Rows -->
          <div class="user-card__details">
            <div class="user-card__detail-row">
              <div class="user-card__detail-icon user-card__detail-icon--whatsapp">
                <BaseIcon name="ic:baseline-whatsapp" width="18" height="18" />
              </div>
              <div class="user-card__detail-content">
                <span class="user-card__detail-label">واتساب</span>
                <a
                  class="user-card__whatsapp-link"
                  :href="`https://wa.me/20${item.whatsapp_number}`"
                  target="_blank"
                  rel="noopener"
                >
                  {{ item.whatsapp_number || "—" }}
                </a>
              </div>
            </div>

            <div class="user-card__detail-row">
              <div class="user-card__detail-icon user-card__detail-icon--email">
                <BaseIcon name="solar:letter-outline" width="18" height="18" />
              </div>
              <div class="user-card__detail-content">
                <span class="user-card__detail-label">البريد الإلكتروني</span>
                <span class="user-card__detail-value">{{ item.email || "—" }}</span>
              </div>
            </div>

            <div class="user-card__detail-row">
              <div class="user-card__detail-icon user-card__detail-icon--date">
                <BaseIcon name="solar:calendar-date-outline" width="18" height="18" />
              </div>
              <div class="user-card__detail-content">
                <span class="user-card__detail-label">تاريخ التسجيل</span>
                <span class="user-card__detail-value">{{ item.created_at || "—" }}</span>
              </div>
            </div>
          </div>

          <!-- Card Actions Footer -->
          <div class="user-card__footer">
            <router-link
              :to="{ name: 'users_show', params: { id: item.id } }"
              class="user-card__action-btn user-card__action-btn--view"
            >
              <BaseIcon name="solar:eye-outline" width="18" height="18" />
              <span>عرض</span>
            </router-link>

            <template v-if="['pending', 'rejected', 'suspended'].includes(item.status)">
              <button
                type="button"
                class="user-card__action-btn user-card__action-btn--accept"
                @click="$emit('row-action', item, 'active')"
              >
                <BaseIcon name="solar:check-circle-outline" width="18" height="18" />
                <span>تفعيل</span>
              </button>
            </template>

            <template v-if="['active'].includes(item.status)">
              <button
                type="button"
                class="user-card__action-btn user-card__action-btn--suspended"
                @click="$emit('row-action', item, 'suspended')"
              >
                <BaseIcon name="solar:lock-keyhole-outline" width="18" height="18" />
                <span>ايقاف</span>
              </button>
            </template>

            <button
              type="button"
              class="user-card__action-btn user-card__action-btn--delete"
              @click="$emit('row-action', item, 'delete')"
            >
              <BaseIcon name="solar:trash-bin-minimalistic-outline" width="18" height="18" />
              <span>حذف</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="items.length && meta?.total" class="users-cards__pagination">
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

const getAvatarGradient = (name) => {
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
.users-cards-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.users-cards {
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

/* ─── User Card ─── */
.user-card {
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

    &--active {
      background: #22c55e;
    }

    &--rejected {
      background: #ef4444;
    }

    &--pending {
      background: #f59e0b;
    }

    &--suspended {
      background: #eab308;
    }
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
    width: 56px;
    height: 56px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 50%;
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--white);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
    transition: transform 0.25s ease;

    .user-card:hover & {
      transform: scale(1.08) rotate(-2deg);
    }
  }

  &__title-group {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
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
    width: 100%;

    .user-card__link:hover & {
      color: var(--blue-600);
    }
  }

  &__status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 1.1rem;
    font-weight: 700;
    white-space: nowrap;
    border: 1px solid transparent;

    &--active {
      color: #166534;
      background: #ecfdf3;
      border-color: #bbf7d0;
    }

    &--rejected {
      color: #b42318;
      background: #fff1f3;
      border-color: #fecdd3;
    }

    &--pending {
      color: #b54708;
      background: #fff7ed;
      border-color: #fed7aa;
    }

    &--suspended {
      color: #854d0e;
      background: #fefce8;
      border-color: #fef08a;
    }
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;

    &--active {
      background: #22c55e;
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.14);
    }

    &--rejected {
      background: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
    }

    &--pending {
      background: #f59e0b;
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.12);
    }

    &--suspended {
      background: #eab308;
      box-shadow: 0 0 0 3px rgba(234, 179, 8, 0.12);
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

    &--whatsapp {
      background: rgba(34, 197, 94, 0.08);
      color: #16a34a;
    }

    &--email {
      background: rgba(59, 130, 246, 0.08);
      color: var(--blue-500);
    }

    &--date {
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

  &__whatsapp-link {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--blue-600);
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: var(--blue-800);
      text-decoration: underline;
    }
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
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
      }
    }

    &--accept {
      background: rgba(34, 197, 94, 0.06);
      color: #16a34a;
      border-color: rgba(34, 197, 94, 0.12);

      &:hover {
        background: #16a34a;
        color: var(--white);
        border-color: #16a34a;
        box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
      }
    }

    &--suspended {
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
  .users-cards__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .user-card {
    &__body {
      padding: 18px;
    }

    &__footer {
      flex-wrap: wrap;
    }
  }
}
</style>
