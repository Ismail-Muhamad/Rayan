<template>
  <RouterView />
  <Toaster
    rich-colors
    close-button
    :dir="htmlDirection"
    :position="vueSonnerToastPosition"
    :visible-toasts="5"
  />
</template>

<script setup>
import { computed, onBeforeMount } from "vue";
import { Toaster } from "vue-sonner";
import i18n from "./plugins/i18n";
import localeHelper from "@/helpers/locale.helpers";

const htmlDirection = computed(() =>
  i18n.global.locale === "en" ? "ltr" : "rtl"
);
const vueSonnerToastPosition = computed(() =>
  localeHelper.getLocale() === "en" ? "bottom-left" : "bottom-right"
);
onBeforeMount(() => {
  localeHelper.initializeLocale();
});
</script>

<style scoped></style>
