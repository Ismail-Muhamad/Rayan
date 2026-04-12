<template>
  <header v-if="headerNavItem && showHeader" class="header">
    <div v-if="!$slots.title" class="header__wrapper">
      <!-- <button
        v-if="showSideMenuIcon"
        @click="handleToggleSideMenu"
        :class="[
          'header__icon header__icon--center',
          {
            'header__icon--active': sideMenuIconStatus,
          },
        ]"
      >
        <VsxIcon
          iconName="SidebarLeft"
          :size="32"
          color="#5584FF"
          type="linear"
        />
      </button> -->
      <Transition name="fade" mode="out-in">
        <div
          v-if="headerNavItem.icon"
          :key="headerNavItem.icon"
          class="header__icon"
        >
          <BaseIcon
            :name="headerNavItem.icon"
            :size="24"
            color="var(--blue-600)"
          />
        </div>
      </Transition>
      <div class="header__text">
        <Transition name="fade" mode="out-in">
          <h2
            v-if="headerNavItem.label"
            :key="headerNavItem.label"
            class="header__title"
          >
            {{ t(headerNavItem.label) }}
          </h2>
        </Transition>
        <Transition name="fade" mode="out-in">
          <p
            v-if="headerNavItem.description"
            :key="headerNavItem.description"
            class="header__description"
          >
            {{ t(headerNavItem.description) }}
          </p>
        </Transition>
      </div>
    </div>
    <slot v-else name="title"></slot>
    <slot name="actions"></slot>
  </header>
</template>

<script setup>
// ===== IMPORTS =====
// Vue and Libraries
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
// Stores
// Constants
import { NOT_ALLOWED_ROUTES } from "@/constants/navigation/header";
// Composables
import { useI18n } from "vue-i18n";
import { useSidebarNavigation } from "@/composables/useSidebarNavigation";
// Components

// ===== PROPS & EMITS =====
const props = defineProps({
  title: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  iconName: {
    type: String,
    required: false,
  },
  showSideMenuIcon: {
    type: Boolean,
    required: false,
    default: true,
  },
  sideMenuIconStatus: {
    type: Boolean,
    required: false,
    default: true,
  },
});
const emit = defineEmits(["toggleSideMenu"]);
// ===== STORE INSTANCES =====
// ===== COMPOSABLES =====
const route = useRoute();
const { t } = useI18n();
const { currentNavItem, headerNavItem } = useSidebarNavigation();
// ===== CONSTANTS =====
// ===== REACTIVE STATE & TEMPLATE REFS =====
// ===== COMPUTED PROPERTIES =====
const showHeader = computed(() => !NOT_ALLOWED_ROUTES.includes(route.name));
// ===== LIFECYCLE HOOKS =====
// ===== METHODS =====
const handleToggleSideMenu = () => {
  emit("toggleSideMenu");
};
// ===== WATCHERS =====
</script>
<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  // padding: 16px;
  padding-block: 8px;
  padding-inline: 16px;
  border-bottom: 1px solid var(--gray-200);
  // height: 70px;
  height: 64px;
  flex-shrink: 0;

  &__wrapper {
    display: flex;
    gap: 8px;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 2rem;
    font-weight: 700;
    color: var(--blue-600);
  }

  &__description {
    font-size: 1.4rem;
    font-weight: 400;
    color: var(--gray-400);
  }

  &__icon {
    line-height: 0;

    &--center {
      align-self: center;
      cursor: pointer;
      margin-inline-end: 16px;
    }

    &--active {
      transform: rotate(180deg);
    }
  }
}

// Transition animations
.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms ease, transform 300ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
