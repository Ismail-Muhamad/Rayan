<template>
  <header class="header">
    <div class="header__wrapper">
      <div class="header__group">
        <slot name="back">
          <BaseButton
            v-if="showBack"
            @click="navigateBack"
            size="icon-sm"
            variant="ghost"
            color="gray"
            class="header__back"
          >
            <BaseIcon
              name="solar:arrow-left-outline"
              :width="20"
              :height="20"
              color="var(--gray-400)"
            />
          </BaseButton>
        </slot>
        <div class="header__content">
          <div class="header__title">
            <div v-if="iconName" class="header__icon">
              <slot name="icon">
                <BaseIcon
                  :name="iconName"
                  :width="24"
                  :height="24"
                  color="var(--blue-600)"
                />
              </slot>
            </div>
            <h2 v-if="title" class="header__text">
              <slot name="title">
                {{ title }}
              </slot>
            </h2>
          </div>
          <p
            v-if="subtitle"
            :class="['header__subtitle', `header__subtitle--${subtitleSpace}`]"
          >
            <slot name="subtitle">
              {{ subtitle }}
            </slot>
          </p>
        </div>
      </div>
      <div class="header__actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </header>
</template>
<script setup>
// ===== IMPORTS =====
// Vue and Libraries
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
// Stores
// Composables
// Components
// Constants
// Helpers
// ===== PROPS & EMITS =====
const props = defineProps({
  title: {
    type: String,
    required: true,
    default: "",
  },
  subtitle: {
    type: String,
    required: false,
    default: "",
  },
  showBack: {
    type: Boolean,
    required: false,
    default: false,
  },
  iconName: {
    type: String,
    required: false,
    default: null,
  },
});
// ===== STORE INSTANCES =====
// ===== COMPOSABLES =====
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
// ===== CONSTANTS =====
// ===== REACTIVE STATE & TEMPLATE REFS =====
// ===== VALIDATION RULES =====
// ===== COMPUTED PROPERTIES =====
const subtitleSpace = computed(() => {
  if (!props.showBack && props.iconName) {
    return "spacing";
  }
  return "";
});
// ===== LIFECYCLE HOOKS =====
// ===== METHODS =====
const navigateBack = () => {
  router.back();
};
// ===== WATCHERS =====
// ===== EXPOSE PUBLIC METHODS =====
</script>
<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: 8px;
  padding-inline: 16px;
  border-bottom: 1px solid var(--gray-300);
  height: 64px;
  flex-shrink: 0;

  &__wrapper {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  &__group {
    display: flex;
    gap: 8px;
  }
  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__text {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 2rem;
    font-weight: 700;
    color: var(--blue-600);
  }

  &__subtitle {
    font-size: 1.4rem;
    font-weight: 400;
    color: var(--gray-400);
    margin-block-start: 4px;
    &--spacing {
      padding-inline-start: 34px;
    }
  }

  &__icon {
    line-height: 0;
  }
}
</style>
