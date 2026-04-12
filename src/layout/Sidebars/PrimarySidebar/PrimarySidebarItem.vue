<template>
  <div
    :class="[
      'sidebar__item',
      {
        'sidebar__item--active': isActive,
      },
    ]"
    :data-tooltip="route.label"
  >
    <RouterLink
      class="sidebar__link"
      :to="{ name: route.routeName }"
      @click="handleClick"
    >
      <div class="sidebar__icon">
        <BaseIcon :name="route.icon" :size="20" color="#4479f5" />
      </div>
    </RouterLink>
  </div>
</template>

<script>
export default {
  name: "MainSidebarItem",
  props: {
    route: {
      type: Object,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    iconType() {
      return this.isActive ? "bold" : "outline";
    },
  },
  methods: {
    handleClick() {
      // this.$emit("click");
      this.$router.push({ name: this.route.routeName });
    },
  },
};
</script>

<style lang="scss" scoped>
.sidebar {
  &__item {
    // width: 48px;
    // height: 48px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    position: relative;
    cursor: pointer;
    transition: background-color 300ms ease-in-out;

    &:hover,
    &--active {
      background-color: var(--blue-100);
    }

    &::after {
      content: "";
      position: absolute;
      inset-inline-start: calc(100% - 8px);
      z-index: 99999999;
      border-width: 8px;
      border-style: solid;
      border-color: transparent;
      border-inline-end-color: var(--blue-500);
      opacity: 0;
      visibility: hidden;
      transition: opacity 300ms ease-in-out, visibility 300ms ease-in-out;
    }

    &::before {
      content: attr(data-tooltip);
      position: absolute;
      z-index: 99999999;
      top: 50%;
      inset-inline-start: calc(100% + 8px);
      transform: translateY(-50%);
      font-size: 1.2rem;
      white-space: nowrap;
      text-align: center;
      color: var(--white);
      background-color: var(--blue-500);
      padding: 8px 16px;
      border-radius: 4px;
      opacity: 0;
      visibility: hidden;
      transition: opacity 300ms ease-in-out, visibility 300ms ease-in-out;
    }

    &:hover::before,
    &:hover::after {
      opacity: 1;
      visibility: visible;
    }
  }

  &__link {
    display: block;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__icon {
    line-height: 0;
  }
}
</style>
