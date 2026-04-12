<template>
  <div :class="['spinner', `spinner--${size}`]">
    <div :class="['spinner__wrapper', `spinner__wrapper--${size}`]">
      <i
        class="spinner__circle1"
        :class="`spinner__circle1--${color}`"
      />
      <i
        class="spinner__circle2"
        :class="`spinner__circle2--${color}`"
      />
    </div>
    <div class="spinner__message">
      <slot>
        <span
          v-if="message"
          :style="messageStyle"
        >
          {{ message }}
        </span>
      </slot>
    </div>
  </div>
</template>

<script setup>
// ===== IMPORTS =====
// Vue and Libraries
import { computed } from "vue";
// Stores
// Composables
// Components
// Constants
// Helpers
// ===== PROPS & EMITS =====
const props = defineProps({
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg"].includes(v),
  },
  color: {
    type: String,
    default: "current",
    validator: (v) =>
      [
        "current",
        "white",
        "emerald",
        "green",
        "lime",
        "red",
        "orange",
        "amber",
        "yellow",
        "teal",
        "cyan",
        "sky",
        "blue",
        "indigo",
        "violet",
        "purple",
        "fuchsia",
        "pink",
        "rose",
        "slate",
        "gray",
        "zinc",
        "neutral",
        "stone",
      ].includes(v),
  },
  message: {
    type: String,
    default: "",
  },
});
// ===== STORE INSTANCES =====
// ===== COMPOSABLES =====
// ===== CONSTANTS =====
// ===== REACTIVE STATE & TEMPLATE REFS =====
// ===== VALIDATION RULES =====
// ===== COMPUTED PROPERTIES =====
const messageStyle = computed(() => {
  if (props.color === "current") return { color: "currentColor" };
  if (props.color === "white") return { color: "#ffffff" };
  return { color: `var(--${props.color}-500)` };
});
// ===== LIFECYCLE HOOKS =====
// ===== METHODS =====
// ===== WATCHERS =====
// ===== EXPOSE PUBLIC METHODS =====
</script>

<style scoped lang="scss">
.spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  // Wrapper
  &__wrapper {
    position: relative;
    display: flex;
    flex-shrink: 0;
    // Sizes
    &--sm {
      width: 20px;
      height: 20px;
      --border: 2px;
    }
    &--md {
      width: 32px;
      height: 32px;
      --border: 3px;
    }
    &--lg {
      width: 40px;
      height: 40px;
      --border: 3px;
    }
  }
  // Message
  &__message {
    margin-inline-start: 8px;
    font-size: 1.4rem;
    font-weight: 400;
  }
}

// Shared circle base
%circle-base {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: var(--border) solid transparent;
  border-top-color: transparent;
  border-left-color: transparent;
  border-right-color: transparent;
}
// Circle 1
.spinner__circle1 {
  @extend %circle-base;
  border-style: solid;
  animation: spinner-ease-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;

  @each $name
    in (
      red,
      blue,
      green,
      emerald,
      lime,
      orange,
      amber,
      yellow,
      teal,
      cyan,
      sky,
      indigo,
      violet,
      purple,
      fuchsia,
      pink,
      rose,
      slate,
      gray,
      zinc,
      neutral,
      stone
    )
  {
    &--#{$name} {
      border-bottom-color: var(--#{$name}-500);
    }
  }
  &--white {
    border-bottom-color: #ffffff;
  }
  &--current {
    border-bottom-color: currentColor;
  }
}

// Circle 2
.spinner__circle2 {
  @extend %circle-base;
  border-style: dotted;
  opacity: 0.75;
  animation: spinner-linear-spin 0.8s linear infinite;
  @each $name
    in (
      red,
      blue,
      green,
      emerald,
      lime,
      orange,
      amber,
      yellow,
      teal,
      cyan,
      sky,
      indigo,
      violet,
      purple,
      fuchsia,
      pink,
      rose,
      slate,
      gray,
      zinc,
      neutral,
      stone
    )
  {
    &--#{$name} {
      border-bottom-color: var(--#{$name}-500);
    }
  }
  &--white {
    border-bottom-color: #ffffff;
  }
  &--current {
    border-bottom-color: currentColor;
  }
}

// Keyframes
@keyframes spinner-ease-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes spinner-linear-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
