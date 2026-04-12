<template>
  <div class="page-wrapper">
    <BaseHeaderLayout
      :title="t(titleKey)"
      :subtitle="t(subtitleKey)"
      :icon-name="iconName"
    />
    <div class="page-wrapper__view">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
// ===== IMPORTS =====
// Vue and Libraries
import { useI18n } from "vue-i18n";
import BaseHeaderLayout from "./BaseHeaderLayout.vue";

// ===== PROPS & EMITS =====
const props = defineProps({
  titleKey: { type: String, required: true },
  subtitleKey: { type: String, required: true },
  iconName: { type: String, required: true },
});
// ===== COMPOSABLES =====
const { t } = useI18n();
</script>
<style lang="scss" scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  &__view {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }
}
</style>
