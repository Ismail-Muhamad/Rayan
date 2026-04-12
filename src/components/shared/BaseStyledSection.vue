<template>
  <div class="section">
    <div class="section__header">
      <slot name="label">
        <h3
          v-if="label"
          class="section__label"
        >
          {{ label }}
        </h3>
      </slot>
    </div>
    <slot name="description">
      <p
        v-if="description"
        class="section__description"
      >
        {{ description }}
      </p>
    </slot>
    <div class="section__body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
// ===== IMPORTS =====
// Vue and Libraries
// Stores
// Composables
// Components
// Constants
// Helpers
// ===== PROPS & EMITS =====
const props = defineProps({
  label: {
    type: String,
    required: false,
    default: "",
  },
  description: {
    type: String,
    required: false,
    default: "",
  },
});
// ===== STORE INSTANCES =====
// ===== COMPOSABLES =====
// ===== CONSTANTS =====
// ===== REACTIVE STATE & TEMPLATE REFS =====
// ===== VALIDATION RULES =====
// ===== LIFECYCLE HOOKS =====
// ===== METHODS =====
// ===== TEMPLATE REFS AND DOM-RELATED LOGIC =====
// ===== WATCHERS =====
// ===== EXPOSE PUBLIC METHODS =====
</script>

<style lang="scss" scoped>
.section {
  position: relative;
  border-radius: 8px;
  // padding: 24px;
  padding: 16px;
  border: 1px solid var(--gray-300);
  background-color: var(--white);
  box-shadow: var(--shadow-sm);

  &__header {
    padding: 2px 8px;
    border-radius: 4px;
    background-color: var(--white);
    position: absolute;
    top: 0;
    inset-inline-start: 12px;
    transform: translateY(-50%);
    z-index: 999;
  }

  &__label {
    font-size: 1.8rem;
    color: var(--blue-600);
    font-weight: 700;
    // padding: 2px 8px;
    // border-radius: 4px;
    // color: var(--blue-600);
    // background-color: var(--white);
    // position: absolute;
    // top: 0;
    // inset-inline-start: 12px;
    // transform: translateY(-50%);
    // z-index: 999;
  }

  &__description {
    font-size: 1.6rem;
    font-size: 1.4rem;
    font-weight: 400;
    color: var(--gray-400);
    margin-block-end: 16px;
  }
}
</style>
