<template>
  <div class="sidebar">
    <PrimarySidebar />
  </div>
</template>

<script>
import PrimarySidebar from "./PrimarySidebar/PrimarySidebar.vue";
export default {
  name: "SidebarIndex",
  components: { PrimarySidebar },
};
</script>

<style lang="scss" scoped>
.sidebar {
  display: flex;
}
</style>
