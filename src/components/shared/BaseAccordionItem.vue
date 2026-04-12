<template>
  <!-- 
    Structure:
    - Base (Item Wrapper)
      - Heading (h2)
        - Trigger (Button)
          - StartContent
          - TitleWrapper
             - Title
             - Subtitle
          - Indicator
      - Content (Transition Wrapper)
  -->
  <div
    class="base-accordion-item"
    :class="[
      `base-accordion-item--${context.variant.value}`,
      { 'base-accordion-item--active': isOpen },
      { 'base-accordion-item--disabled': isDisabledComputed },
      { 'base-accordion-item--compact': isCompactComputed },
      { 'base-accordion-item--splitted': context.variant.value === 'splitted' },
      {
        'base-accordion-item--has-divider':
          context.showDivider.value &&
          context.variant.value !== 'splitted' &&
          !isLastItem,
      },
      computedItemClasses.base,
    ]"
  >
    <div
      class="base-accordion-item__heading"
      :class="computedItemClasses.heading"
    >
      <button
        :id="triggerId"
        type="button"
        class="base-accordion-item__trigger"
        :class="computedItemClasses.trigger"
        :aria-expanded="isOpen"
        :aria-controls="contentId"
        :disabled="isDisabledComputed"
        @click="handleToggle"
      >
        <!-- Start Content Slot -->
        <div
          v-if="$slots.startContent"
          class="base-accordion-item__start-content"
          :class="computedItemClasses.startContent"
        >
          <slot name="startContent"></slot>
        </div>

        <!-- Title & Subtitle Context -->
        <div
          class="base-accordion-item__title-wrapper"
          :class="computedItemClasses.titleWrapper"
        >
          <span
            class="base-accordion-item__title"
            :class="computedItemClasses.title"
          >
            <slot name="title">{{ title }}</slot>
          </span>
          <span
            v-if="subtitle || $slots.subtitle"
            class="base-accordion-item__subtitle"
            :class="computedItemClasses.subtitle"
          >
            <slot name="subtitle">{{ subtitle }}</slot>
          </span>
        </div>

        <!-- Indicator -->
        <div
          v-if="!hideIndicatorComputed"
          class="base-accordion-item__indicator"
          :class="[
            {
              'base-accordion-item__indicator--rotated':
                isOpen && !disableAnimationComputed,
            },
            computedItemClasses.indicator,
          ]"
        >
          <slot name="indicator" :is-open="isOpen">
            <!-- Default Chevron -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </slot>
        </div>
      </button>
    </div>

    <!-- Content Transition (Height Animation) -->
    <transition
      name="accordion-height"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @before-leave="onBeforeLeave"
      @leave="onLeave"
    >
      <div
        v-show="shouldShowContent"
        :id="contentId"
        class="base-accordion-item__content-wrapper"
        role="region"
        :aria-labelledby="triggerId"
      >
        <div
          class="base-accordion-item__content"
          :class="computedItemClasses.content"
        >
          <slot></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
// ===== IMPORTS =====
import { inject, computed, getCurrentInstance } from "vue";

// ===== PROPS =====
const props = defineProps({
  /**
   * Unique key for the item. Required for selection.
   * If not provided, should ideally use an auto-id, but we generally expect a key or index.
   * But wait, in the images, `selectedKeys` and `disabledKeys` work on keys.
   * We need a way to identify this item.
   * Let's accept a `value` or `name` prop, defaulting to title or auto-generated id.
   */
  value: {
    type: [String, Number],
    default: null, // If null, we might need random ID logic
  },
  title: {
    type: String,
    default: "",
  },
  subtitle: {
    type: String,
    default: "",
  },
  /**
   * Disables this specific item.
   */
  isDisabled: {
    type: Boolean,
    default: false,
  },
  /**
   * Compact mode for this item.
   */
  isCompact: {
    type: Boolean,
    default: undefined, // Inherit
  },
  /**
   * Hide the indicator for this item.
   */
  hideIndicator: {
    type: Boolean,
    default: undefined,
  },
  /**
   * HTML tag for the heading level.
   */
  headingComponent: {
    type: String,
    default: "h2",
  },
  /**
   * Classes override.
   */
  classNames: {
    type: Object,
    default: () => ({}),
  },
  /**
   * Keep content mounted.
   */
  keepContentMounted: {
    type: Boolean,
    default: undefined,
  },
});

// ===== INJECT =====
const context = inject("AccordionContext", {
  selectedKeys: computed(() => new Set()),
  toggleItem: () => {},
  variant: computed(() => "light"),
  isCompact: computed(() => false),
  isDisabled: computed(() => false),
  hideIndicator: computed(() => false),
  disableAnimation: computed(() => false),
  keepContentMounted: computed(() => false),
  itemClasses: computed(() => ({})),
  showDivider: computed(() => true),
});

// ===== SETUP STATE =====
const instance = getCurrentInstance();
const uid = instance.uid; // Fallback ID

// The unique key for this item in the parent's Set
const itemKey = computed(() => {
  if (props.value !== null && props.value !== undefined)
    return String(props.value);
  return `accordion-item-${uid}`;
});

// Accessibility IDs
const triggerId = computed(() => `accordion-trigger-${uid}`);
const contentId = computed(() => `accordion-content-${uid}`);

// ===== COMPUTED =====
const isOpen = computed(() => context.selectedKeys.value.has(itemKey.value));

const isDisabledComputed = computed(() => {
  return props.isDisabled || context.isDisabled.value;
});

const isCompactComputed = computed(() => {
  return props.isCompact !== undefined
    ? props.isCompact
    : context.isCompact.value;
});

const hideIndicatorComputed = computed(() => {
  return props.hideIndicator !== undefined
    ? props.hideIndicator
    : context.hideIndicator.value;
});

const keepContentMountedComputed = computed(() => {
  return props.keepContentMounted !== undefined
    ? props.keepContentMounted
    : context.keepContentMounted.value;
});

const shouldShowContent = computed(() => {
  if (keepContentMountedComputed.value) return isOpen.value; // v-show controls logic
  return isOpen.value; // For v-if controlled by transition we might assume v-show actually implies keeping DOM
});

// Class Merging
const computedItemClasses = computed(() => {
  const parentClasses = context.itemClasses.value || {};
  const itemClasses = props.classNames || {};

  // keys: base, heading, trigger, titleWrapper, title, subtitle, startContent, indicator, content
  const keys = [
    "base",
    "heading",
    "trigger",
    "titleWrapper",
    "title",
    "subtitle",
    "startContent",
    "indicator",
    "content",
  ];
  const merged = {};
  keys.forEach((key) => {
    merged[key] = [parentClasses[key], itemClasses[key]]
      .filter(Boolean)
      .join(" ");
  });
  return merged;
});

const disableAnimationComputed = computed(() => context.disableAnimation.value);

// We need to know if this is the last item for dividers?
// CSS :last-child handles this usually for dividers.

// ===== METHODS =====
const handleToggle = () => {
  if (isDisabledComputed.value) return;
  context.toggleItem(itemKey.value);
};

// --- Animations (Height) ---

// ENTER: 0 -> scrollHeight
const onEnter = (el) => {
  if (disableAnimationComputed.value) {
    el.style.height = "auto";
    return;
  }
  // 1. Set start height to 0
  el.style.height = "0px";
  // 2. Force reflow so browser knows 0 is the start
  // eslint-disable-next-line no-unused-expressions
  el.offsetHeight;
  // 3. Set end height to scrollHeight
  el.style.height = `${el.scrollHeight}px`;
};

const onAfterEnter = (el) => {
  if (disableAnimationComputed.value) return;
  // Cleanup to allow content to grow if needed later
  el.style.height = "auto";
};

// LEAVE: scrollHeight -> 0
const onBeforeLeave = (el) => {
  if (disableAnimationComputed.value) return;
  // 1. Lock height to current pixel value (start state)
  el.style.height = `${el.scrollHeight}px`;
  // 2. Force reflow
  // eslint-disable-next-line no-unused-expressions
  el.offsetHeight;
};

const onLeave = (el) => {
  if (disableAnimationComputed.value) return;
  // 3. Transition to 0
  el.style.height = "0px";
};
</script>

<style lang="scss" scoped>
.base-accordion-item {
  width: 100%;
  border-block-end: 0px solid transparent; // Prepare props

  &--compact {
    .base-accordion-item__trigger {
      padding: 8px 0; // Tighter padding
    }
    .base-accordion-item__content {
      padding-bottom: 8px;
    }
  }

  // Divider logic (except splitted)
  &--has-divider {
    border-block-end: 1px solid var(--gray-300);
    &:last-child {
      border-block-end: none;
    }
  }

  // Splitted Variant Specifics
  &--splitted {
    // background-color: var(--white, #fff);
    // border-radius: 12px;
    border-radius: 8px;
    // box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); // Light card shadow
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-300); // Optional border for splitted
    overflow: hidden;

    // Splitted items have their own padding
    .base-accordion-item__trigger {
      padding: 12px 16px;
    }
    .base-accordion-item__content {
      padding: 0 16px 16px 16px;
    }
  }

  // Basic states
  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  // Elements
  &__heading {
  }

  &__trigger {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 16px 8px; // Default padding
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: start;
    outline: none;
    transition: background-color 0.2s;

    // Focus styles
    &:focus-visible {
      box-shadow: 0 0 0 2px var(--blue-500, #3b82f6);
      border-radius: 4px;
      z-index: 10;
    }
  }

  &__start-content {
    margin-right: 12px;
    display: flex;
    align-items: center;
    color: var(--gray-500);
  }

  &__title-wrapper {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  &__title {
    font-size: 1.6rem;
    font-weight: 400;
    color: var(--gray-900);
  }

  &__subtitle {
    font-size: 1.4rem;
    color: var(--gray-500);
    margin-block-start: 4px;
  }

  &__indicator {
    margin-left: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gray-400);
    transition: transform 0.25s ease;

    &--rotated {
      transform: rotate(180deg);
    }
  }

  &__content-wrapper {
    overflow: hidden;
    transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__content {
    padding: 0 8px 16px 8px;
    font-size: 1.6rem;
    color: var(--gray-900);
  }
}

// Vue Transition Classes (if simple CSS transition isn't enough, but handled in JS hooks)
.accordion-height-enter-active,
.accordion-height-leave-active {
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
</style>
