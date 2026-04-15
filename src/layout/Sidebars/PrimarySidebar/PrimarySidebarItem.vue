<template>
  <div
    :class="[
      'sidebar__item',
      {
        'sidebar__item--active': isActive,
      },
    ]"
  >
    <RouterLink
      class="sidebar__link"
      :to="{ name: route.routeName }"
      @click="handleClick"
    >
      <div class="sidebar__icon">
        <BaseIcon :name="route.icon" :size="20" color="#ffffff" />
      </div>

      <span v-show="expanded" class="sidebar__label">
        {{ route.label }}
      </span>
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
    expanded: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["navigate"],
  methods: {
    handleClick() {
      this.$emit("navigate");
    },
  },
};
</script>

<style lang="scss" scoped>
.sidebar {
  &__item {
    width: 100%;
    min-height: 48px;
    border-radius: 14px;
    transition:
      background-color 220ms ease,
      box-shadow 220ms ease;

    &:hover,
    &--active {
      background: rgba(255, 255, 255, 0.14);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    }
  }

  &__link {
    width: 100%;
    min-height: 48px;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px;
    text-decoration: none;
  }

  &__icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }

  &__label {
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
    white-space: nowrap;
  }
}
</style>