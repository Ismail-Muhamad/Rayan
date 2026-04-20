<template>
  <BasePageWrapper
    :title-key="pageTitleKey"
    :subtitle-key="pageSubtitleKey"
    :icon-name="pageIconName"
  >
    <RouterView />
  </BasePageWrapper>
</template>

<script setup>
// ===== IMPORTS =====
import { computed } from "vue";
import { useRoute } from "vue-router";

// ===== COMPOSABLES =====
const route = useRoute();

// ===== COMPUTED =====
const pageTitleKey = computed(() => {
  if (route.name === "users_consumptions") {
    return "users.consumptionsTitle";
  }

  return "users.title";
});

const pageSubtitleKey = computed(() => {
  if (route.name === "users_consumptions") {
    return "users.consumptionsSubtitle";
  }

  return "users.subtitle";
});

const pageIconName = computed(() => {
  if (route.name === "users_consumptions") {
    return "solar:chart-outline";
  }

  return "solar:users-group-rounded-outline";
});
</script>

<style lang="scss" scoped></style>