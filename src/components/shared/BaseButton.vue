<template>
  <!-- Split Button Wrapper -->
  <div
    v-if="split && hasDropdown"
    class="button-split-wrapper"
    :class="{ 'button-split-wrapper--full-width': fullWidth || block }"
  >
    <!-- Main Button (Split) -->
    <component
      :is="componentTag"
      :class="[...buttonClasses, 'button--split-main']"
      :style="buttonStyles"
      :disabled="isDisabled"
      :type="buttonType"
      :href="href"
      :target="target"
      :rel="computedRel"
      :to="to"
      :aria-label="ariaLabel"
      :aria-disabled="isDisabled"
      :aria-busy="loading"
      :aria-pressed="isPressed"
      :title="title"
      :name="name"
      :value="value"
      :form="form"
      @click="handleClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @focus="handleFocus"
      @blur="handleBlur"
      ref="buttonRef"
    >
      <!-- Ripple Effect -->
      <span
        v-if="ripple && !isDisabled"
        class="button__ripple"
        :class="{ 'button__ripple--active': showRipple }"
        :style="rippleStyle"
      ></span>

      <!-- Loading State -->
      <BaseIcon
        v-if="loading"
        name="line-md:loading-loop"
        :width="iconSize"
        :height="iconSize"
        class="button__spinner"
      />

      <!-- Button Content -->
      <span
        :class="['button__content', { 'button__content--hidden': loading }]"
      >
        <!-- Left Icon Slot -->
        <slot name="icon-left">
          <BaseIcon
            v-if="iconLeft"
            :name="iconLeft"
            :width="iconSize"
            :height="iconSize"
            class="button__icon button__icon--left"
          />
        </slot>

        <!-- Default Slot (Text Content) -->
        <slot></slot>

        <!-- Right Icon Slot -->
        <slot name="icon-right">
          <BaseIcon
            v-if="iconRight"
            :name="iconRight"
            :width="iconSize"
            :height="iconSize"
            class="button__icon button__icon--right"
          />
        </slot>

        <!-- Badge/Counter -->
        <span
          v-if="badge || badge === 0"
          class="button__badge"
          :class="badgeClasses"
        >
          {{ badge }}
        </span>
      </span>
    </component>

    <!-- Separator -->
    <span class="button__separator" :style="separatorStyles"></span>

    <!-- Dropdown Toggle Button (Split) -->
    <button
      :class="[...buttonClasses, 'button--split-toggle']"
      :style="buttonStyles"
      :disabled="isDisabled"
      type="button"
      :aria-label="`${ariaLabel || 'Button'} options`"
      v-bind="dropdownAriaAttributes"
      @click="toggleDropdown"
      ref="splitTriggerRef"
    >
      <BaseIcon :name="splitIcon" :width="iconSize" :height="iconSize" />
    </button>

    <!-- Dropdown Menu -->
    <Teleport to="body">
      <Transition :name="props.dropdownTransition">
        <div
          v-if="isDropdownOpen"
          ref="dropdownRef"
          class="button__dropdown"
          :class="[`button__dropdown--${dropdownDirection}`]"
          :style="dropdownPositionStyle"
          role="menu"
        >
          <template
            v-for="(item, index) in dropdownItems"
            :key="item.key || index"
          >
            <!-- Divider -->
            <div v-if="item.divider" class="button__dropdown-divider"></div>

            <!-- Menu Item -->
            <button
              v-else
              type="button"
              class="button__dropdown-item"
              :class="{
                'button__dropdown-item--disabled': item.disabled,
                'button__dropdown-item--danger': item.danger,
              }"
              :disabled="item.disabled"
              @click="handleDropdownItemClick(item)"
              role="menuitem"
            >
              <BaseIcon
                v-if="item.icon"
                :name="item.icon"
                :width="16"
                :height="16"
                class="button__dropdown-item-icon"
              />
              <span class="button__dropdown-item-label">{{ item.label }}</span>
              <BaseIcon
                v-if="item.iconRight"
                :name="item.iconRight"
                :width="16"
                :height="16"
                class="button__dropdown-item-icon-right"
              />
            </button>
          </template>
        </div>
      </Transition>
    </Teleport>
  </div>

  <!-- Regular Button (Non-Split) -->
  <component
    v-else
    :is="componentTag"
    :class="buttonClasses"
    :style="buttonStyles"
    :disabled="isDisabled"
    :type="buttonType"
    :href="href"
    :target="target"
    :rel="computedRel"
    :to="to"
    :aria-label="ariaLabel"
    :aria-disabled="isDisabled"
    :aria-busy="loading"
    :aria-pressed="isPressed"
    :title="title"
    :name="name"
    :value="value"
    :form="form"
    v-bind="hasDropdown && !split ? dropdownAriaAttributes : {}"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
    ref="buttonRef"
  >
    <!-- Ripple Effect -->
    <span
      v-if="ripple && !isDisabled"
      class="button__ripple"
      :class="{ 'button__ripple--active': showRipple }"
      :style="rippleStyle"
    ></span>

    <!-- Loading State -->
    <BaseIcon
      v-if="loading"
      name="line-md:loading-loop"
      :width="iconSize"
      :height="iconSize"
      class="button__spinner"
    />

    <!-- Button Content -->
    <span :class="['button__content', { 'button__content--hidden': loading }]">
      <!-- Left Icon Slot -->
      <slot name="icon-left">
        <BaseIcon
          v-if="iconLeft"
          :name="iconLeft"
          :width="iconSize"
          :height="iconSize"
          class="button__icon button__icon--left"
        />
      </slot>

      <!-- Default Slot (Text Content) -->
      <slot></slot>

      <!-- Right Icon Slot -->
      <slot name="icon-right">
        <BaseIcon
          v-if="iconRight"
          :name="iconRight"
          :width="iconSize"
          :height="iconSize"
          class="button__icon button__icon--right"
        />
      </slot>

      <!-- Badge/Counter -->
      <span
        v-if="badge || badge === 0"
        class="button__badge"
        :class="badgeClasses"
      >
        {{ badge }}
      </span>
    </span>

    <!-- Dropdown Menu (Non-Split) -->
    <Teleport to="body">
      <Transition :name="props.dropdownTransition">
        <div
          v-if="hasDropdown && !split && isDropdownOpen"
          ref="dropdownRef"
          class="button__dropdown"
          :class="[`button__dropdown--${dropdownDirection}`]"
          :style="dropdownPositionStyle"
          role="menu"
        >
          <slot name="dropdown" :dropdownItems="dropdownItems">
            <template
              v-for="(item, index) in dropdownItems"
              :key="item.key || index"
            >
              <slot name="item" :item="item">
                <!-- Divider -->
                <div v-if="item.divider" class="button__dropdown-divider"></div>

                <!-- Menu Item -->
                <button
                  v-else
                  type="button"
                  class="button__dropdown-item"
                  :class="{
                    'button__dropdown-item--disabled': item.disabled,
                    'button__dropdown-item--danger': item.danger,
                  }"
                  :disabled="item.disabled"
                  @click="handleDropdownItemClick(item)"
                  role="menuitem"
                >
                  <BaseIcon
                    v-if="item.icon"
                    :name="item.icon"
                    :width="16"
                    :height="16"
                    class="button__dropdown-item-icon"
                  />
                  <span class="button__dropdown-item-label">{{
                    item.label
                  }}</span>
                  <BaseIcon
                    v-if="item.iconRight"
                    :name="item.iconRight"
                    :width="16"
                    :height="16"
                    class="button__dropdown-item-icon-right"
                  />
                </button>
              </slot>
            </template>
          </slot>
        </div>
      </Transition>
    </Teleport>
  </component>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useDropdown } from "@/composables/UseDropdownOptions";

// ===== PROPS =====
const props = defineProps({
  // ===== APPEARANCE =====
  variant: {
    type: String,
    default: "solid",
    validator: (value) =>
      ["classic", "solid", "soft", "surface", "outline", "ghost"].includes(
        value,
      ),
  },
  color: {
    type: String,
    default: "blue",
    validator: (value) =>
      [
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
      ].includes(value),
  },
  size: {
    type: String,
    default: "md",
    validator: (value) =>
      ["xs", "sm", "md", "lg", "xl", "icon-sm", "icon-md", "icon-lg"].includes(
        value,
      ),
  },
  rounded: { type: Boolean, default: false },
  elevation: {
    type: [String, Number],
    default: "none",
    validator: (value) =>
      ["none", "sm", "md", "lg", "xl", 0, 1, 2, 3, 4].includes(value),
  },
  gradient: { type: Boolean, default: false },

  // ===== STATES =====
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
  pressed: { type: Boolean, default: false },

  // ===== LAYOUT =====
  fullWidth: { type: Boolean, default: false },
  block: { type: Boolean, default: false }, // Alias for fullWidth

  // ===== LINK/ROUTER =====
  href: { type: String, default: "" },
  to: { type: [String, Object], default: "" },
  target: { type: String, default: "" },
  rel: { type: String, default: "" },
  external: { type: Boolean, default: false },

  // ===== FORM =====
  type: {
    type: String,
    default: "button",
    validator: (value) => ["button", "submit", "reset"].includes(value),
  },
  name: { type: String, default: "" },
  value: { type: String, default: "" },
  form: { type: String, default: "" },

  // ===== BADGE =====
  badge: { type: [String, Number], default: null },
  badgeVariant: {
    type: String,
    default: "solid",
    validator: (value) => ["solid", "outline", "dot"].includes(value),
  },
  badgeColor: { type: String, default: "red" },

  // ===== EFFECTS =====
  ripple: { type: Boolean, default: false },
  haptic: { type: Boolean, default: false },

  // ===== INTERACTIONS =====
  debounce: { type: Number, default: 0 },
  throttle: { type: Number, default: 0 },
  confirm: { type: Boolean, default: false },
  confirmMessage: { type: String, default: "Are you sure?" },

  // ===== ACCESSIBILITY =====
  ariaLabel: { type: String, default: "" },
  role: { type: String, default: "" },
  title: { type: String, default: "" },

  // ===== ICONS =====
  iconLeft: { type: String, default: "" },
  iconRight: { type: String, default: "" },

  // ===== DROPDOWN =====
  dropdown: { type: Boolean, default: false },
  dropdownItems: {
    type: Array,
    default: () => [],
    // Expected format: [{ label, icon?, iconRight?, disabled?, danger?, divider?, key?, action? }]
  },
  dropdownPosition: {
    type: String,
    default: "auto",
    validator: (value) => ["auto", "up", "down"].includes(value),
  },
  dropdownTransition: {
    type: String,
    default: "dropdown-slide",
    validator: (value) =>
      [
        "dropdown-slide",
        "dropdown-fade",
        "dropdown-scale",
        "dropdown-bounce",
        "dropdown-flip",
        "dropdown-zoom",
      ].includes(value),
  },
  dropdownOffset: { type: Number, default: 8 },
  closeOnSelect: { type: Boolean, default: true },

  // ===== SPLIT BUTTON =====
  split: { type: Boolean, default: false },
  splitIcon: { type: String, default: "mdi:chevron-down" },

  // ===== CUSTOM STYLING =====
  customClass: { type: String, default: "" },
  customStyle: { type: Object, default: () => ({}) },
  borderWidth: { type: [String, Number], default: "1" },

  // ===== ANIMATION =====
  animationDuration: { type: Number, default: 200 },
  animationEasing: { type: String, default: "ease-in-out" },

  // ===== DARK MODE =====
  darkMode: { type: Boolean, default: false },
});

const emit = defineEmits([
  "click",
  "mouseenter",
  "mouseleave",
  "focus",
  "blur",
  "confirm",
  "cancel",
  "dropdown-open",
  "dropdown-close",
  "dropdown-select",
]);

// ===== REFS =====
const buttonRef = ref(null);
const dropdownRef = ref(null);
const splitTriggerRef = ref(null);
const router = useRouter();

// ===== STATE =====
const isHovered = ref(false);
const isFocused = ref(false);
const showRipple = ref(false);
const rippleStyle = ref({});
const debounceTimer = ref(null);
const throttleTimer = ref(null);
const lastThrottleTime = ref(0);

// ===== DROPDOWN SETUP =====
const hasDropdown = computed(
  () => props.dropdown && props.dropdownItems.length > 0,
);

// Use dropdown composable only if dropdown is enabled
const dropdownComposable = hasDropdown.value
  ? useDropdown(props.split ? splitTriggerRef : buttonRef, dropdownRef, {
      position: props.dropdownPosition,
      offset: props.dropdownOffset,
      closeOnSelect: props.closeOnSelect,
      onOpen: () => emit("dropdown-open"),
      onClose: () => emit("dropdown-close"),
    })
  : null;

const isDropdownOpen = computed(
  () => dropdownComposable?.isOpen.value || false,
);
const dropdownDirection = computed(
  () => dropdownComposable?.direction.value || "down",
);
const dropdownPositionStyle = computed(
  () => dropdownComposable?.positionStyle.value || {},
);
const dropdownAriaAttributes = computed(
  () => dropdownComposable?.ariaAttributes.value || {},
);

// ===== COMPUTED =====
const componentTag = computed(() => {
  if (props.href) return "a";
  if (props.to) return "router-link";
  return "button";
});

const buttonType = computed(() => {
  if (props.href || props.to) return undefined;
  return props.type;
});

const isDisabled = computed(() => {
  return props.disabled || props.loading;
});

const isPressed = computed(() => {
  return props.pressed || props.active || props.selected;
});

const computedRel = computed(() => {
  if (props.rel) return props.rel;
  if (props.external || props.target === "_blank") {
    return "noopener noreferrer";
  }
  return undefined;
});

const buttonClasses = computed(() => [
  "button",
  `button--${props.variant}`,
  `button--${props.color}`,
  `button--${props.size}`,
  {
    "button--rounded": props.rounded,
    "button--full-width": props.fullWidth || props.block,
    "button--disabled": isDisabled.value,
    "button--loading": props.loading,
    "button--active": props.active,
    "button--selected": props.selected,
    "button--pressed": isPressed.value,
    "button--hovered": isHovered.value,
    "button--focused": isFocused.value,
    "button--gradient": props.gradient,
    "button--dark": props.darkMode,
    [`button--elevation-${props.elevation}`]:
      props.elevation !== "none" && props.elevation !== 0,
  },
  props.customClass,
]);

const iconSize = computed(() => {
  const sizeMap = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "icon-sm": 16,
    "icon-md": 18,
    "icon-lg": 20,
  };
  return sizeMap[props.size] || 16;
});

const buttonStyles = computed(() => {
  const c = props.color;
  const baseStyles = {
    "--btn-color": c,
    "--btn-animation-duration": `${props.animationDuration}ms`,
    "--btn-animation-easing": props.animationEasing,
    "--btn-border-width": `${props.borderWidth}px`,
  };

  // Color variables
  const colorVars = props.darkMode
    ? {
        // Dark mode colors
        "--btn-solid-bg": `var(--${c}-500)`,
        "--btn-solid-hover": `var(--${c}-400)`,
        "--btn-solid-text": `var(--gray-900)`,
        "--btn-soft-bg": `var(--${c}-900)`,
        "--btn-soft-hover": `var(--${c}-800)`,
        "--btn-soft-text": `var(--${c}-200)`,
        "--btn-surface-bg": `var(--gray-800)`,
        "--btn-surface-border": `var(--${c}-600)`,
        "--btn-surface-hover-border": `var(--${c}-500)`,
        "--btn-surface-text": `var(--${c}-200)`,
        "--btn-outline-border": `var(--${c}-600)`,
        "--btn-outline-text": `var(--${c}-200)`,
        "--btn-outline-hover-bg": `var(--${c}-900)`,
        "--btn-outline-hover-border": `var(--${c}-500)`,
        "--btn-ghost-text": `var(--${c}-200)`,
        "--btn-ghost-hover-bg": `var(--${c}-900)`,
        "--btn-focus-ring": `var(--${c}-500)`,
      }
    : {
        // Light mode colors
        "--btn-solid-bg": `var(--${c}-600)`,
        "--btn-solid-hover": `var(--${c}-700)`,
        "--btn-solid-text": "#ffffff",
        "--btn-soft-bg": `var(--${c}-100)`,
        "--btn-soft-hover": `var(--${c}-200)`,
        "--btn-soft-text": `var(--${c}-700)`,
        "--btn-surface-bg": "#ffffff",
        "--btn-surface-border": `var(--${c}-300)`,
        "--btn-surface-hover-border": `var(--${c}-400)`,
        "--btn-surface-text": `var(--${c}-700)`,
        "--btn-outline-border": `var(--${c}-300)`,
        "--btn-outline-text": `var(--${c}-700)`,
        "--btn-outline-hover-bg": `var(--${c}-50)`,
        "--btn-outline-hover-border": `var(--${c}-400)`,
        "--btn-ghost-text": `var(--${c}-700)`,
        "--btn-ghost-hover-bg": `var(--${c}-100)`,
        "--btn-focus-ring": `var(--${c}-400)`,
      };

  // Gradient variables
  const gradientVars = props.gradient
    ? {
        "--btn-gradient-from": `var(--${c}-500)`,
        "--btn-gradient-to": `var(--${c}-700)`,
      }
    : {};

  return {
    ...baseStyles,
    ...colorVars,
    ...gradientVars,
    ...props.customStyle,
  };
});

const badgeClasses = computed(() => [
  `button__badge--${props.badgeVariant}`,
  `button__badge--${props.badgeColor}`,
]);

const separatorStyles = computed(() => {
  const c = props.color;
  let color = "rgba(255, 255, 255, 0.2)";
  if (["soft", "outline", "ghost", "surface"].includes(props.variant)) {
    color = `var(--${c}-300)`;
  }
  return { backgroundColor: color };
});

const ariaAttributes = computed(() => {
  const attrs = {};
  if (props.role) attrs.role = props.role;
  return attrs;
});

// ===== METHODS =====
const handleClick = async (event) => {
  if (isDisabled.value) {
    event.preventDefault();
    return;
  }

  // If button has dropdown and is not split, toggle dropdown
  if (hasDropdown.value && !props.split) {
    toggleDropdown();
    return;
  }

  // Confirmation dialog
  if (props.confirm) {
    const confirmed = window.confirm(props.confirmMessage);
    if (!confirmed) {
      emit("cancel", event);
      return;
    }
    emit("confirm", event);
  }

  // Haptic feedback (mobile)
  if (props.haptic && window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(10);
  }

  // Ripple effect
  if (props.ripple) {
    createRipple(event);
  }

  // Handle debounce
  if (props.debounce > 0) {
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value);
    }
    debounceTimer.value = setTimeout(() => {
      emitClick(event);
    }, props.debounce);
    return;
  }

  // Handle throttle
  if (props.throttle > 0) {
    const now = Date.now();
    if (now - lastThrottleTime.value < props.throttle) {
      return;
    }
    lastThrottleTime.value = now;
  }

  emitClick(event);
};

const emitClick = (event) => {
  emit("click", event);
};

const toggleDropdown = () => {
  if (dropdownComposable) {
    dropdownComposable.toggle();
  }
};

const handleDropdownItemClick = (item) => {
  if (item.disabled) return;
  // Emit event
  emit("dropdown-select", item);

  // Execute item action if provided
  if (typeof item.action === "function") {
    item.action();
  }

  // Close dropdown if configured
  if (props.closeOnSelect && dropdownComposable) {
    dropdownComposable.close();
  }
};

const handleMouseEnter = (event) => {
  isHovered.value = true;
  emit("mouseenter", event);
};

const handleMouseLeave = (event) => {
  isHovered.value = false;
  emit("mouseleave", event);
};

const handleFocus = (event) => {
  isFocused.value = true;
  emit("focus", event);
};

const handleBlur = (event) => {
  isFocused.value = false;
  emit("blur", event);
};

const createRipple = (event) => {
  if (!buttonRef.value) return;

  const button = buttonRef.value;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  rippleStyle.value = {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}px`,
    top: `${y}px`,
  };

  showRipple.value = true;

  setTimeout(() => {
    showRipple.value = false;
  }, 600);
};

// ===== PUBLIC METHODS (via ref) =====
const focus = () => {
  buttonRef.value?.focus();
};

const blur = () => {
  buttonRef.value?.blur();
};

const click = () => {
  buttonRef.value?.click();
};

// ===== LIFECYCLE =====
onUnmounted(() => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value);
  }
});

// ===== EXPOSE PUBLIC API =====
defineExpose({
  focus,
  blur,
  click,
  el: buttonRef,
});
</script>

<style lang="scss" scoped>
// ===== CSS CUSTOM PROPERTIES =====
:root {
  // Elevation shadows
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md:
    0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg:
    0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl:
    0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  // Touch target minimum (WCAG AAA)
  --btn-min-touch-target: 44px;
}

// ===== BASE BUTTON =====
.button {
  // Base styles
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  white-space: nowrap;
  border: var(--btn-border-width) solid transparent;
  text-decoration: none;
  user-select: none;
  overflow: hidden;
  flex-shrink: 0;

  // Transitions
  transition-property:
    background-color, border-color, color, box-shadow, transform;
  transition-duration: var(--btn-animation-duration);
  transition-timing-function: var(--btn-animation-easing);

  // Focus styles
  &:focus-visible {
    outline: 2px solid var(--btn-focus-ring);
    outline-offset: 2px;
    z-index: 2;
  }

  // Disabled state
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  // Loading state
  &--loading {
    cursor: wait;
  }

  // ===== SPLIT BUTTON =====
  &-split-wrapper {
    display: inline-flex;
    align-items: stretch;
    position: relative;

    &--full-width {
      display: flex;
      width: 100%;

      .button--split-main {
        flex: 1;
      }
    }
  }

  &--split-main {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  &--split-toggle {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    padding-left: 8px;
    padding-right: 8px;
    min-width: unset;
  }

  &__separator {
    width: 1px;
    align-self: stretch;
    position: relative;
  }

  // ===== DROPDOWN =====
  &__dropdown {
    background: white;
    border: 1px solid var(--gray-200, #e5e7eb);
    border-radius: 8px;
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    padding: 4px;
    min-width: 200px;
    max-height: 400px;
    overflow-y: auto;
    z-index: 9999;

    &--up {
      // Styles for upward dropdown
    }

    &--down {
      // Styles for downward dropdown
    }

    &-divider {
      height: 1px;
      margin: 4px 0;
      background-color: var(--gray-200, #e5e7eb);
    }

    &-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 8px 12px;
      font-size: 14px;
      text-align: left;
      background: transparent;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.15s;
      color: var(--gray-700, #374151);
      font-weight: 400;

      &:hover:not(&--disabled) {
        background-color: var(--gray-50, #f9fafb);
      }

      &:focus-visible {
        outline: 2px solid var(--blue-500, #3b82f6);
        outline-offset: -2px;
      }

      &--disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &--danger {
        color: var(--red-600, #dc2626);

        &:hover:not(&--disabled) {
          background-color: var(--red-50, #fef2f2);
        }
      }

      &-icon {
        flex-shrink: 0;
      }

      &-label {
        flex: 1;
      }

      &-icon-right {
        flex-shrink: 0;
        opacity: 0.5;
      }
    }
  }

  // ===== VARIANTS =====
  &--classic {
    background-color: var(--btn-solid-bg);
    color: var(--btn-solid-text);
    box-shadow: var(--shadow-sm);

    &:hover:not(.button--disabled):not(.button--loading) {
      background-color: var(--btn-solid-hover);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    &:active:not(.button--disabled):not(.button--loading) {
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }
  }

  &--solid {
    background-color: var(--btn-solid-bg);
    color: var(--btn-solid-text);

    &:hover:not(.button--disabled):not(.button--loading) {
      background-color: var(--btn-solid-hover);
    }

    &.button--gradient {
      background: linear-gradient(
        135deg,
        var(--btn-gradient-from) 0%,
        var(--btn-gradient-to) 100%
      );

      &:hover:not(.button--disabled):not(.button--loading) {
        filter: brightness(1.1);
      }
    }
  }

  &--soft {
    background-color: var(--btn-soft-bg);
    color: var(--btn-soft-text);

    &:hover:not(.button--disabled):not(.button--loading) {
      background-color: var(--btn-soft-hover);
    }
  }

  &--surface {
    background-color: var(--btn-surface-bg);
    color: var(--btn-surface-text);
    border-color: var(--btn-surface-border);
    box-shadow: var(--shadow-sm);

    &:hover:not(.button--disabled):not(.button--loading) {
      border-color: var(--btn-surface-hover-border);
    }
  }

  &--outline {
    background-color: transparent;
    color: var(--btn-outline-text);
    border-color: var(--btn-outline-border);

    &:hover:not(.button--disabled):not(.button--loading) {
      background-color: var(--btn-outline-hover-bg);
      border-color: var(--btn-outline-hover-border);
    }
  }

  &--ghost {
    background-color: transparent;
    color: var(--btn-ghost-text);

    &:hover:not(.button--disabled):not(.button--loading) {
      background-color: var(--btn-ghost-hover-bg);
    }
  }

  // ===== SIZES =====
  &--xs {
    padding: 0 8px;
    font-size: 12px;
    height: 28px;
    min-height: 28px;
  }

  &--sm {
    padding: 0 12px;
    font-size: 14px;
    height: 32px;
    min-height: 32px;
  }

  &--md {
    padding: 0 16px;
    font-size: 14px;
    height: 40px;
    min-height: 40px;
  }

  &--lg {
    padding: 0 20px;
    font-size: 16px;
    height: 48px;
    min-height: 48px;
  }

  &--xl {
    padding: 0 24px;
    font-size: 18px;
    height: 56px;
    min-height: 56px;
  }

  &--icon-sm {
    padding: 0;
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
  }

  &--icon-md {
    padding: 0;
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
  }

  &--icon-lg {
    padding: 0;
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
  }

  // ===== ELEVATION =====
  &--elevation-sm,
  &--elevation-1 {
    box-shadow: var(--shadow-sm);
  }

  &--elevation-md,
  &--elevation-2 {
    box-shadow: var(--shadow-md);
  }

  &--elevation-lg,
  &--elevation-3 {
    box-shadow: var(--shadow-lg);
  }

  &--elevation-xl,
  &--elevation-4 {
    box-shadow: var(--shadow-xl);
  }

  // ===== STATE MODIFIERS =====
  &--active,
  &--selected,
  &--pressed {
    &.button--solid {
      background-color: var(--btn-solid-hover);
    }

    &.button--soft {
      background-color: var(--btn-soft-hover);
    }

    &.button--outline,
    &.button--ghost {
      background-color: var(--btn-outline-hover-bg);
    }
  }

  // ===== LAYOUT =====
  &--full-width {
    width: 100%;
    display: flex;
  }

  &--rounded {
    border-radius: 9999px;
  }

  // ===== DARK MODE =====
  &--dark {
    // Dark mode styles are handled via CSS variables
  }

  // ===== CONTENT =====
  &__content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
    z-index: 1;

    &--hidden {
      opacity: 0;
      visibility: hidden;
    }
  }

  &__icon {
    flex-shrink: 0;
    display: inline-flex;
  }

  &__spinner {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  }

  // ===== BADGE =====
  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 6px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    border-radius: 9999px;
    margin-left: 4px;

    &--solid {
      background-color: var(--red-500);
      color: white;
    }

    &--outline {
      background-color: transparent;
      border: 1px solid var(--red-500);
      color: var(--red-500);
    }

    &--dot {
      min-width: 8px;
      width: 8px;
      height: 8px;
      padding: 0;
      background-color: var(--red-500);
      position: absolute;
      top: -2px;
      right: -2px;
    }

    // Badge colors
    @each $color
      in (
        emerald,
        green,
        lime,
        red,
        orange,
        amber,
        yellow,
        teal,
        cyan,
        sky,
        blue,
        indigo,
        violet,
        purple,
        fuchsia,
        pink,
        rose,
        gray
      )
    {
      &--#{$color} {
        &.button__badge--solid {
          background-color: var(--#{$color}-500);
        }

        &.button__badge--outline {
          border-color: var(--#{$color}-500);
          color: var(--#{$color}-500);
        }

        &.button__badge--dot {
          background-color: var(--#{$color}-500);
        }
      }
    }
  }

  // ===== RIPPLE EFFECT =====
  &__ripple {
    position: absolute;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.6);
    pointer-events: none;
    transform: scale(0);
    opacity: 1;

    &--active {
      animation: ripple-animation 600ms ease-out;
    }
  }
}

// ===== ANIMATIONS =====
@keyframes ripple-animation {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

// ===== DROPDOWN ANIMATIONS =====

// Slide Animation (Default)
.dropdown-slide-enter-active {
  animation: dropdown-slide-in 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-slide-leave-active {
  animation: dropdown-slide-out 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dropdown-slide-in {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes dropdown-slide-out {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
  }
}

// Upward Slide Animation (for dropdowns opening upward)
.button__dropdown--up {
  &.dropdown-slide-enter-active {
    animation: dropdown-slide-up-in 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &.dropdown-slide-leave-active {
    animation: dropdown-slide-up-out 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@keyframes dropdown-slide-up-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes dropdown-slide-up-out {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
}

// Fade Animation
.dropdown-fade-enter-active {
  animation: dropdown-fade-in 0.2s ease-out;
}

.dropdown-fade-leave-active {
  animation: dropdown-fade-out 0.15s ease-in;
}

@keyframes dropdown-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes dropdown-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

// Scale Animation
.dropdown-scale-enter-active {
  animation: dropdown-scale-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dropdown-scale-leave-active {
  animation: dropdown-scale-out 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dropdown-scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
    transform-origin: top center;
  }
  to {
    opacity: 1;
    transform: scale(1);
    transform-origin: top center;
  }
}

@keyframes dropdown-scale-out {
  from {
    opacity: 1;
    transform: scale(1);
    transform-origin: top center;
  }
  to {
    opacity: 0;
    transform: scale(0.9);
    transform-origin: top center;
  }
}

// Scale animation for upward dropdown
.button__dropdown--up {
  &.dropdown-scale-enter-active,
  &.dropdown-scale-leave-active {
    transform-origin: bottom center;
  }
}

// Bounce Animation (Extra)
.dropdown-bounce-enter-active {
  animation: dropdown-bounce-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.dropdown-bounce-leave-active {
  animation: dropdown-bounce-out 0.2s ease-in;
}

@keyframes dropdown-bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(-20px);
  }
  50% {
    transform: scale(1.05) translateY(0);
  }
  70% {
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes dropdown-bounce-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

// Flip Animation (Extra)
.dropdown-flip-enter-active {
  animation: dropdown-flip-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-flip-leave-active {
  animation: dropdown-flip-out 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dropdown-flip-in {
  from {
    opacity: 0;
    transform: perspective(400px) rotateX(-90deg);
    transform-origin: top center;
  }
  to {
    opacity: 1;
    transform: perspective(400px) rotateX(0deg);
    transform-origin: top center;
  }
}

@keyframes dropdown-flip-out {
  from {
    opacity: 1;
    transform: perspective(400px) rotateX(0deg);
    transform-origin: top center;
  }
  to {
    opacity: 0;
    transform: perspective(400px) rotateX(-90deg);
    transform-origin: top center;
  }
}

// Zoom Animation (Extra)
.dropdown-zoom-enter-active {
  animation: dropdown-zoom-in 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-zoom-leave-active {
  animation: dropdown-zoom-out 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dropdown-zoom-in {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes dropdown-zoom-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.5);
  }
}

// Smooth item stagger animation
.button__dropdown-item {
  animation: dropdown-item-appear 0.2s ease-out backwards;

  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.03}s;
    }
  }
}

@keyframes dropdown-item-appear {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// ===== MOBILE TOUCH TARGETS =====
@media (hover: none) and (pointer: coarse) {
  .button {
    min-height: var(--btn-min-touch-target);
    min-width: var(--btn-min-touch-target);

    &--xs,
    &--sm {
      min-height: var(--btn-min-touch-target);
    }

    &--icon-sm {
      min-width: var(--btn-min-touch-target);
      min-height: var(--btn-min-touch-target);
    }
  }
}

// ===== REDUCED MOTION =====
@media (prefers-reduced-motion: reduce) {
  .button {
    transition: none;

    &__ripple {
      animation: none;
    }
  }
}
</style>
