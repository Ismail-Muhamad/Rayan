<template>
  <div class="card">
    <p class="card__title">{{ title }}</p>
    <p class="card__value">{{ value ?? "--" }}</p>
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
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: false,
  },
});
// ===== STORE INSTANCES =====
// ===== COMPOSABLES =====
// ===== CONSTANTS =====
// ===== REACTIVE STATE & TEMPLATE REFS =====
// ===== VALIDATION RULES =====
// ===== COMPUTED PROPERTIES =====
// ===== LIFECYCLE HOOKS =====
// ===== METHODS =====
// ===== WATCHERS =====
// ===== EXPOSE PUBLIC METHODS =====
</script>
<style lang="scss" scoped>
.card {
  border: 1px dashed var(--gray-300);
  padding: 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  &__title {
    font-size: 1.6rem;
    color: var(--gray-900);
    font-weight: 600;
  }
  &__value {
    font-size: 1.6rem;
    color: var(--blue-500);
    font-weight: 500;
  }
}
</style>
