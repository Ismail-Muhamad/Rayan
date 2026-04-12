<template>
  <div
    class="base-accordion"
    :class="[
      `base-accordion--${variant}`,
      { 'base-accordion--compact': isCompact },
      { 'base-accordion--full-width': fullWidth },
      { 'base-accordion--disabled': isDisabled },
      { 'base-accordion--splitted': variant === 'splitted' },
      { 'base-accordion--bordered': variant === 'bordered' },
      { 'base-accordion--shadow': variant === 'shadow' },
      { 'base-accordion--has-divider': showDivider && variant !== 'splitted' },
    ]"
  >
    <slot></slot>
  </div>
</template>

<script setup>
// ===== IMPORTS =====
import { provide, computed, toRef, ref, watch } from "vue";

// ===== PROPS & EMITS =====
const props = defineProps({
  /**
   * Selection mode: 'none', 'single', 'multiple'
   * Note: 'none' disables interaction.
   */
  selectionMode: {
    type: String, // 'none' | 'single' | 'multiple'
    default: "single",
    validator: (v) => ["none", "single", "multiple"].includes(v),
  },
  /**
   * Controlled value (v-model).
   * Can be a string (single) or array/Set (multiple).
   */
  modelValue: {
    type: [String, Array, Set],
    default: undefined,
  },
  /**
   * Default keys expanded on mount (uncontrolled mode).
   */
  defaultExpandedKeys: {
    type: [String, Array, Set],
    default: () => [],
  },
  /**
   * Disables all items.
   */
  isDisabled: {
    type: Boolean,
    default: false,
  },
  /**
   * Keys of items that should be disabled.
   */
  disabledKeys: {
    type: [Array, Set],
    default: () => [],
  },
  /**
   * Visual variant: 'light', 'shadow', 'bordered', 'splitted'
   */
  variant: {
    type: String, // 'light' | 'shadow' | 'bordered' | 'splitted'
    default: "light",
    validator: (v) => ["light", "shadow", "bordered", "splitted"].includes(v),
  },
  /**
   * Compact mode (less padding).
   */
  isCompact: {
    type: Boolean,
    default: false,
  },
  /**
   * Show dividers between items (ignored in 'splitted' variant).
   */
  showDivider: {
    type: Boolean,
    default: true,
  },
  /**
   * Hide the expansion indicator (chevron).
   */
  hideIndicator: {
    type: Boolean,
    default: false,
  },
  /**
   * Disable expansion animations.
   */
  disableAnimation: {
    type: Boolean,
    default: false,
  },
  /**
   * Keep content mounted when collapsed (v-show vs v-if).
   */
  keepContentMounted: {
    type: Boolean,
    default: false,
  },
  /**
   * Expand to full width of container.
   */
  fullWidth: {
    type: Boolean,
    default: true,
  },
  /**
   * Custom class names for item slots.
   * { base: "", title: "", trigger: "", ... }
   */
  itemClasses: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

// ===== STATE =====
// Internal state for uncontrolled usage
const internalKeys = ref(new Set());

// Initialize default keys if provided and not controlled
if (props.modelValue === undefined && props.defaultExpandedKeys) {
  const defaults = Array.isArray(props.defaultExpandedKeys)
    ? props.defaultExpandedKeys
    : [props.defaultExpandedKeys];
  defaults.forEach((k) => internalKeys.value.add(String(k)));
}

// ===== COMPUTED =====
const isControlled = computed(() => props.modelValue !== undefined);

const selectedKeys = computed(() => {
  if (isControlled.value) {
    const val = props.modelValue;
    if (!val) return new Set();
    if (val instanceof Set) return new Set(Array.from(val).map(String));
    if (Array.isArray(val)) return new Set(val.map(String));
    return new Set([String(val)]);
  }
  return internalKeys.value;
});

const disabledKeysSet = computed(() => {
  if (!props.disabledKeys) return new Set();
  if (props.disabledKeys instanceof Set) return props.disabledKeys;
  return new Set(props.disabledKeys);
});

// ===== METHODS =====

/**
 * Toggles an item key.
 * @param {String} key - The unique key of the item
 */
const toggleItem = (key) => {
  if (props.selectionMode === "none" || props.isDisabled) return;
  if (disabledKeysSet.value.has(key)) return;

  const currentKeys = new Set(selectedKeys.value);
  const isSelected = currentKeys.has(key);

  if (props.selectionMode === "single") {
    // If it's single mode:
    // - If clicking the active one, close it (unless we want to enforce one open? optional but standard behavior allows closing)
    // - If clicking a new one, clear all and open new
    currentKeys.clear();
    if (!isSelected) {
      currentKeys.add(key);
    }
  } else {
    // Multiple mode
    if (isSelected) {
      currentKeys.delete(key);
    } else {
      currentKeys.add(key);
    }
  }

  updateModel(currentKeys);
};

const updateModel = (newSet) => {
  if (!isControlled.value) {
    internalKeys.value = newSet;
  }

  // Emit update:modelValue in the expected format (Array or String depending on input/mode)
  // For consistency, if multiple -> Array, if single -> String or null
  // But usually tools prefer consistency. Let's try to match input type or standard.
  // We'll emit Array for multiple, String (or null) for single.

  if (props.selectionMode === "single") {
    const val = newSet.size > 0 ? Array.from(newSet)[0] : null;
    emit("update:modelValue", val);
    emit("change", newSet); // Set for change event is robust
  } else {
    emit("update:modelValue", Array.from(newSet));
    emit("change", newSet);
  }
};

// ===== PROVIDE =====
// Provide state and configuration to children
provide("AccordionContext", {
  selectedKeys,
  toggleItem,
  variant: toRef(props, "variant"),
  isCompact: toRef(props, "isCompact"),
  isDisabled: toRef(props, "isDisabled"),
  hideIndicator: toRef(props, "hideIndicator"),
  disableAnimation: toRef(props, "disableAnimation"),
  keepContentMounted: toRef(props, "keepContentMounted"),
  showDivider: toRef(props, "showDivider"),
  itemClasses: toRef(props, "itemClasses"),
});
</script>

<style lang="scss" scoped>
.base-accordion {
  display: flex;
  flex-direction: column;
  // Default Spacing for 'light'/'shadow'/'bordered' implies contiguous items,
  // but 'splitted' implies gaps.

  &--full-width {
    width: 100%;
  }

  &--splitted {
    gap: 12px; // Space between splitted cards
  }

  &--shadow {
    // Shadow variant usually wraps the whole list or items.
    // HeroUI shadow variant seems to apply shadow to the *container* if items are contiguous,
    // or could be on items. Based on images, 'shadow' variant looks like a card.
    // box-shadow:
    //   0 4px 6px -1px rgba(0, 0, 0, 0.1),
    //   0 2px 4px -1px rgba(0, 0, 0, 0.06);
    // border-radius: 12px;
    // background-color: var(--white, #fff);
    border-radius: 8px;
    box-shadow: rgba(0, 0, 0, 0.15) 0px 0 4px 0px;
    padding: 8px;
    border: 1px solid var(--gray-300);
  }

  &--bordered {
    border: 1px solid var(--gray-300);
    // border-radius: 12px;
    border-radius: 8px;
    overflow: hidden; // Clip children
    padding: 8px;
  }
}
</style>
