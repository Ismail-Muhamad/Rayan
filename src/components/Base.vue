<template></template>
<script setup>
// ===== IMPORTS =====
// Vue and Libraries
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useVuelidate } from "@vuelidate/core";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
// Stores
// Composables
// Components
// Constants
// Helpers
// ===== PROPS & EMITS =====
// ===== STORE INSTANCES =====
// ===== COMPOSABLES =====
const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
// ===== CONSTANTS =====
// ===== REACTIVE STATE & TEMPLATE REFS =====
// ===== VALIDATION RULES =====
// ===== COMPUTED PROPERTIES =====
// ===== LIFECYCLE HOOKS =====
// ===== METHODS =====
// ===== WATCHERS =====
// ===== EXPOSE PUBLIC METHODS =====
</script>
<style lang="scss" scoped></style>
