<template>
  <div class="wrapper">
    <button
      v-if="isMobile"
      class="wrapper__mobile-toggle"
      type="button"
      @click="isMobileSidebarOpen = !isMobileSidebarOpen"
    >
      <BaseIcon
        :name="isMobileSidebarOpen ? 'mdi:close' : 'solar:hamburger-menu-outline'"
        :size="24"
      />
    </button>

    <div
      v-if="isMobile && isMobileSidebarOpen"
      class="wrapper__overlay"
      @click="isMobileSidebarOpen = false"
    ></div>

    <div class="wrapper__sidebar">
      <PrimarySidebar
        :is-mobile="isMobile"
        :mobile-open="isMobileSidebarOpen"
        @close-mobile="isMobileSidebarOpen = false"
      />
    </div>

    <div class="wrapper__view">
      <RouterView />
    </div>
  </div>
</template>

<script>
import PrimarySidebar from "./Sidebars/PrimarySidebar/PrimarySidebar.vue";

export default {
  name: "AppLayout",
  components: { PrimarySidebar },
  data() {
    return {
      isMobile: false,
      isMobileSidebarOpen: false,
    };
  },
  mounted() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    handleResize() {
      this.isMobile = window.innerWidth <= 992;

      if (!this.isMobile) {
        this.isMobileSidebarOpen = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  height: 100vh;
  padding: 1rem;
  gap: 0.5rem;
  position: relative;
  background: #f6f8f7;
  overflow: hidden;
  box-sizing: border-box;

  &__sidebar {
    display: flex;
    background-color: var(--white);
    border-radius: 0.75rem;
    flex-shrink: 0;
    height: 100%;
  }

  &__view {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background-color: var(--white);
    border-radius: 0.75rem;
    overflow: hidden;
    height: 100%;
  }

  &__mobile-toggle {
    position: fixed;
    top: 16px;
    inset-inline-end: 16px;
    z-index: 1400;
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 16px;
    background: #ffffff;
    color: #175c34;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.16);
    cursor: pointer;
  }

  &__overlay {
    position: fixed;
    inset: 0;
    z-index: 1100;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(3px);
  }
}

@media screen and (max-width: 992px) {
  .wrapper {
    padding: 0;
    gap: 0;
    height: 100vh;

    &__sidebar {
      background: transparent;
      border-radius: 0;
      height: auto;
    }

    &__view {
      border-radius: 0;
      min-height: 100vh;
      height: 100vh;
    }
  }
}
</style>