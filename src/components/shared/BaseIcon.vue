<template>
  <Icon
    :icon="name"
    :width="width"
    :height="height"
    :color="color"
    :horizontal-flip="horizontalFlip"
    :vertical-flip="verticalFlip"
    :flip="flip"
    :rotate="rotate"
    v-bind="$attrs"
  />
</template>

<script setup>
import { Icon } from "@iconify/vue";
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  inline: {
    type: Boolean,
    default: false,
  },
  width: {
    type: [String, Number],
    default: 24,
  },
  height: {
    type: [String, Number],
    default: 24,
  },
  horizontalFlip: {
    type: Boolean,
    default: false,
  },
  verticalFlip: {
    type: Boolean,
    default: false,
  },
  flip: {
    type: String,
    default: "",
  },
  rotate: {
    type: [String, Number],
    default: 0,
  },
  color: {
    type: String,
    default: "currentColor",
  },
});
</script>
<style scoped>
svg {
  line-height: 0;
}
</style>
