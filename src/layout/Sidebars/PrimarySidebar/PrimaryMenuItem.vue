<template>
  <div
    :ref="item.key"
    :class="[
      'sidebar__item',
      {
        'sidebar__item--active': isActive,
      },
    ]"
    :data-tooltip="item.label"
    @click.stop="handleToggleShowPopup(item)"
  >
    <div class="sidebar__action">
      <!--<div class="sidebar__icon">
        <VsxIcon
          :icon-name="item.icon"
          :size="24"
          color="#4479f5"
          :type="iconType"
        />
      </div>-->
    </div>
    <div
      v-click-away.stop="handleClosePopup"
      :class="[
        'sidebar__user',
        {
          'sidebar__user--active': isActive,
        },
      ]"
      @click.stop
    >
      <div class="sidebar__wrapper">
        <div class="sidebar__info">
          <h3 class="sidebar__title"></h3>
          <p class="sidebar__email"></p>
        </div>
        <ErabyButton
          text="Logout"
          type="danger"
          icon-name="Logout"
          :hover="false"
          :icon-size="20"
          icon-color="#ff6369"
          full-width
          @click="handleLogout"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/Authentication/authentication";
import { mapActions } from "pinia";

export default {
  name: "PrimaryMenuItem",
  props: {
    item: {
      type: Object,
      required: true,
    },
    // isActive: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  data() {
    return {
      isActive: false,
    };
  },
  computed: {
    // ...mapState(useProfileStore, ["profileData"]),
    iconType() {
      return this.isActive ? "bold" : "outline";
    },
  },
  methods: {
    ...mapActions(useAuthStore, ["logout"]),
    handleToggleShowPopup(item) {
      this.isActive = !this.isActive;
    },
    handleClosePopup() {
      this.isActive = false;
    },
    async handleLogout() {
      await this.logout();
      this.$router.push({ name: "login" });
    },
  },
};
</script>

<style lang="scss" scoped>
.sidebar {
  &__item {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    position: relative;
    transition: background-color 300ms ease-in-out;
    &--active {
      border-inline-start: 2px solid #4479f5;
      background-color: rgba(255, 255, 255, 0.0784313725);
    }
    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 100%;
      z-index: 99999999;
      transform: translate(-50%, -8px);
      border-width: 8px;
      border-style: solid;
      border-color: transparent #545454 transparent transparent;
      opacity: 0;
      visibility: hidden;
      transition:
        opacity 300ms ease-in-out,
        visibility 300ms ease-in-out;
    }
    &::before {
      content: attr(data-tooltip);
      position: absolute;
      z-index: 99999999;
      top: 50%;
      left: calc(100% + 8px);
      /* transform: translate(-50%, calc(-100% - 10px)); */
      transform: translateY(-50%);
      font-size: 1.2rem;
      white-space: nowrap;
      text-align: center;
      color: #fff;
      background-color: #545454;
      padding: 8px 16px;
      border-radius: 4px;
      opacity: 0;
      visibility: hidden;
      transition:
        opacity 300ms ease-in-out,
        visibility 300ms ease-in-out;
    }
    &:hover::before,
    &:hover::after {
      opacity: 1;
      visibility: visible;
    }
    &:hover {
      background-color: rgba(255, 255, 255, 0.0784313725);
    }
  }

  &__action {
    display: block;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    /* position: relative; */
  }
  &__user {
    width: 268px;
    height: 364px;
    background-color: #2e2e2e;
    border-radius: 8px;
    position: absolute;
    z-index: 9999999;
    left: calc(100% + 16px);
    bottom: 0;
    transform: scale(0);
    transform-origin: bottom left;
    transition: transform 300ms ease-in-out;
    &--active {
      transform: scale(1);
    }
  }
  &__wrapper {
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    justify-content: flex-end;
    height: 100%;
  }
}
</style>
