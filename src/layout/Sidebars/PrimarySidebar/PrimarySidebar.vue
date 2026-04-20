<template>
  <aside
    v-if="shouldRenderSidebar"
    :class="[
      'primary',
      {
        'primary--expanded': sidebarExpanded,
        'primary--mobile': isMobile,
        'primary--mobile-open': mobileOpen,
      },
    ]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="primary__logo">
      <div class="primary__logo-image-wrap">
        <img :src="logoImage" alt="Rayan Logo" class="primary__logo-image" />
      </div>

      <div v-show="sidebarExpanded" class="primary__brand-wrap">
        <span class="primary__brand"></span>
        <span class="primary__brand-sub">
          شريكك الحقيقي في إدارة مزرعتك
        </span>
      </div>
    </div>

    <div class="primary__items">
      <PrimarySidebarItem
        v-for="item in primaryMenu"
        :key="item.id || item.key || item.routeName"
        :route="item"
        :is-active="isActiveRoute(item.path)"
        :expanded="sidebarExpanded"
        @navigate="handleNavigate"
      />
    </div>

    <div class="primary__footer">
      <button class="primary__logout" type="button" @click="handleLogout">
        <BaseIcon name="solar:logout-2-outline" :size="20" color="#ffffff" />
        <span v-show="sidebarExpanded" class="primary__logout-label">
          {{ $t("auth.logout") }}
        </span>
      </button>
    </div>
  </aside>
</template>

<script>
import sideMenuConfig from "@/constants/sidebar";
import PrimarySidebarItem from "./PrimarySidebarItem.vue";
import i18n from "@/plugins/i18n";
import { useAuthStore } from "@/stores/auth.store";
import router from "@/router";
import logoImage from "@/assets/لوجو مفرغ_.png";

export default {
  name: "PrimarySidebar",
  components: { PrimarySidebarItem },
  props: {
    isMobile: {
      type: Boolean,
      default: false,
    },
    mobileOpen: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close-mobile"],
  data() {
    return {
      logoImage,
      isExpandedDesktop: true,
    };
  },
  computed: {
    shouldRenderSidebar() {
      if (this.hidePrimarySidebar) return false;
      if (this.isMobile) return this.mobileOpen;
      return true;
    },
    primaryMenu() {
      const authStore = useAuthStore();
      const userRole = authStore.userData?.role;

      return sideMenuConfig
        .filter((item) => {
          if (item.roles && item.roles.length > 0) {
            return userRole && item.roles.includes(userRole);
          }
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
      return this.$route.meta?.sidebar?.primary?.hide ?? false;
    },
    sidebarExpanded() {
      return this.isMobile ? this.mobileOpen : true;
    },
  },
  methods: {
    isActiveRoute(path) {
  if (path === "/users") {
    return this.currentPath === "/users" || this.currentPath.startsWith("/users/list") || this.currentPath.startsWith("/users/show");
  }

  return this.currentPath === path || this.currentPath.startsWith(`${path}/`);
},

    handleMouseEnter() {
      if (!this.isMobile) return;
    },
    handleMouseLeave() {
      if (!this.isMobile) return;
    },
    handleNavigate() {
      if (this.isMobile) {
        this.$emit("close-mobile");
      }
    },
    async handleLogout() {
      const authStore = useAuthStore();
      await authStore.logout();

      if (this.isMobile) {
        this.$emit("close-mobile");
      }

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
  height: 100%;
  width: 78px;
  padding: 4px 12px 16px;
  border-radius: 0.75rem;
  background: linear-gradient(180deg, #2f6df6 0%, #1f56d8 100%);
  overflow: hidden;
  transition:
    width 260ms ease,
    transform 260ms ease,
    box-shadow 260ms ease;
  box-shadow: 0 12px 32px rgba(25, 72, 190, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.16);

  &--expanded {
    width: 280px;
    box-shadow: 0 20px 46px rgba(18, 56, 150, 0.34);
  }

  &__logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 220px;
    padding: 0 4px 14px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.28);
    text-align: center;
    transition: min-height 260ms ease, padding 260ms ease;
  }

  &__logo-image-wrap {
    width: 220px;
    height: 220px;
    flex-shrink: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    transition:
      width 260ms ease,
      height 260ms ease,
      transform 260ms ease,
      margin-bottom 260ms ease;
    margin-bottom: 8px;
    margin-top: -6px;
  }

  &__logo-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    transition:
      transform 260ms ease,
      filter 260ms ease;
    transform: scale(1.08);
    filter:
      drop-shadow(0 18px 36px rgba(0, 0, 0, 0.28))
      drop-shadow(0 8px 18px rgba(0, 0, 0, 0.22));
  }

  &__brand-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    width: 100%;
    animation: fadeInBrand 220ms ease;
  }

  &__brand {
    font-size: 15px;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.6;
    white-space: normal;
    text-align: center;
  }

  &__brand-sub {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.5;
    white-space: normal;
    text-align: center;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__footer {
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.22);
  }

  &__logout {
    width: 100%;
    min-height: 48px;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 12px;
    border: none;
    border-radius: 14px;
    background: transparent;
    cursor: pointer;
    transition:
      background-color 220ms ease,
      color 220ms ease;
  }

  &__logout:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  &__logout-label {
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
  }
}

.primary--expanded .primary__logo {
  min-height: 220px;
  padding: 0 10px 18px;
}

.primary--expanded .primary__logo-image-wrap {
  width: 333px;
  height: 333px;
  margin-bottom: 10px;
  margin-top: -50px;
  transform: scale(1.05);
}

.primary--expanded .primary__logo-image {
  transform: scale(1.08);
  filter:
    drop-shadow(0 18px 36px rgba(0, 0, 0, 0.28))
    drop-shadow(0 8px 18px rgba(0, 0, 0, 0.22));
}

@keyframes fadeInBrand {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media screen and (max-width: 992px) {
  .primary {
    position: fixed;
    top: 0;
    right: 0;
    left: auto;
    height: 100vh;
    width: min(320px, 86vw);
    max-width: 320px;
    padding: 80px 16px 16px;
    border-radius: 0;
    z-index: 1200;
    box-shadow: 0 20px 48px rgba(18, 56, 150, 0.36);
  }

  .primary--expanded {
    width: min(320px, 86vw);
    max-width: 320px;
  }

  .primary__logo {
    min-height: 280px;
    padding: 4px 10px 20px;
    margin-bottom: 12px;
  }

  .primary__logo-image-wrap {
    width: 240px;
    height: 240px;
    margin-bottom: 12px;
    margin-top: -4px;
  }

  .primary__logo-image {
    transform: scale(1.06);
    filter:
      drop-shadow(0 20px 38px rgba(0, 0, 0, 0.28))
      drop-shadow(0 10px 22px rgba(0, 0, 0, 0.22));
  }

  .primary__brand {
    font-size: 16px;
  }

  .primary__brand-sub {
    font-size: 13px;
  }
}
</style>