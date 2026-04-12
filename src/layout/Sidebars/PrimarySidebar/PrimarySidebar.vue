<template>
  <div v-if="!hidePrimarySidebar" class="primary">
    <div class="primary__logo">
      <BaseIcon name="hugeicons:store-management-01" color="var(--blue-500)" />
    </div>
    <div class="primary__items">
      <PrimarySidebarItem
        v-for="item in primaryMenu"
        :key="item.id"
        :route="item"
        :is-active="isActiveRoute(item.path)"
      />
    </div>
    <div class="primary__footer">
      <BaseButton
        variant="ghost"
        color="red"
        size="icon-sm"
        v-tooltip="$t('auth.logout')"
        @click="handleLogout"
      >
        <BaseIcon name="solar:logout-2-outline" />
      </BaseButton>
    </div>
    <!-- :isActive="isActiveRoute(item.path)" -->
  </div>
</template>

<script>
import sideMenuConfig from "@/constants/sidebar";
// import PrimaryMenuItem from "./PrimaryMenuItem.vue";
import PrimarySidebarItem from "./PrimarySidebarItem.vue";
import i18n from "@/plugins/i18n";
import { useAuthStore } from "@/stores/auth.store";
import router from "@/router";

export default {
  name: "PrimarySidebar",
  // components: { PrimarySidebarItem, PrimaryMenuItem },
  components: { PrimarySidebarItem },
  data() {
    return {
      // primaryMenu: sideMenuConfig,
      // subMenuItems: sideMenuConfig.subMenuItems,
    };
  },
  computed: {
    primaryMenu() {
      const authStore = useAuthStore();
      const userRole = authStore.userData?.role;

      return sideMenuConfig
        .filter((item) => {
          // If the item has roles, verify the user role is included
          if (item.roles && item.roles.length > 0) {
            return userRole && item.roles.includes(userRole);
          }
          // If no roles specified, assume access is open
          return true;
        })
        .map((item) => ({
          ...item,
          label: i18n.global.t(item.label),
          items: item.items?.map((subItem) => ({
            ...subItem,
            label: i18n.global.t(subItem.label),
            children: subItem.children?.map((child) => ({
              ...child,
              label: i18n.global.t(child.label),
              title: i18n.global.t(child.title),
              description: i18n.global.t(child.description),
            })),
          })),
        }));
    },
    currentPath() {
      return this.$route.fullPath;
    },
    hidePrimarySidebar() {
      // Default is NOT to hide the sidebar
      return this.$route.meta?.sidebar?.primary?.hide ?? false;
    },
  },
  methods: {
    isActiveRoute(path) {
      return this.currentPath.startsWith(path);
    },
    async handleLogout() {
      const authStore = useAuthStore();
      await authStore.logout();
      router.push({ name: "login" });
    },
  },
};
</script>

<style lang="scss" scoped>
.primary {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  // background-color: #282828;
  // border-inline-end: 1px solid #343434;
  // height: 100vh;
  height: calc(100vh - 2rem);
  //width: 64px;
  width: 48px;
  padding-block: 16px;
  border-radius: 0.5rem;

  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    // height: 64px;
    // width: 64px;
    margin-block-end: 48px;
  }

  &__footer {
    margin-block-start: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-block-end: 8px;
  }

  &__items {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  &__menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-block-start: auto;
  }
}
</style>
