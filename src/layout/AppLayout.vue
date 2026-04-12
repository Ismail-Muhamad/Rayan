<template>
  <div class="wrapper">
    <div class="wrapper__sidebar">
      <PrimarySidebar />
    </div>
    <div class="wrapper__view">
      <!-- <PrimaryHeader /> -->
      <RouterView />
    </div>
  </div>
</template>

<script>
import PrimaryHeader from "./Headers/PrimaryHeader.vue";
import PrimarySidebar from "./Sidebars/PrimarySidebar/PrimarySidebar.vue";

export default {
  name: "AppLayout",
  components: { PrimarySidebar, PrimaryHeader },
};
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  height: 100vh;
  padding: 1rem;
  gap: 0.5rem;

  &__sidebar {
    display: flex;
    background-color: var(--white);
    border-radius: 0.5rem;
  }

  &__view {
    width: calc(100% - (64px + 240px + 1rem));
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--white);
    border-radius: 0.5rem;
  }

  &__component {
    padding: 1rem;
    flex-grow: 1;
    overflow-y: auto;
  }
}
</style>
