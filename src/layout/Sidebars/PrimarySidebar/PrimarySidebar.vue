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
        <span class="primary__brand">
        
        </span>
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
import logoImage from "@/assets/22.png";

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
      isExpandedDesktop: false,
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
      return this.isMobile ? this.mobileOpen : this.isExpandedDesktop;
    },
  },
  methods: {
    isActiveRoute(path) {
      return this.currentPath.startsWith(path);
    },
    handleMouseEnter() {
      if (!this.isMobile) {
        this.isExpandedDesktop = true;
      }
    },
    handleMouseLeave() {
      if (!this.isMobile) {
        this.isExpandedDesktop = false;
      }
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
  padding: 16px 12px;
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
    justify-content: center;
    min-height: 96px;
    padding: 10px 4px 18px;
    margin-bottom: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.28);
    text-align: center;
    transition: min-height 260ms ease, padding 260ms ease;
  }

  &__logo-image-wrap {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      width 260ms ease,
      height 260ms ease,
      transform 260ms ease,
      margin-bottom 260ms ease;
    margin-bottom: 0;
  }

  &__logo-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    transition:
      transform 260ms ease,
      filter 260ms ease;
    filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.18));
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
  min-height: 300px;
  padding: 24px 10px 26px;
}

.primary--expanded .primary__logo-image-wrap {
  width: 220px;
  height: 220px;
  margin-bottom: 18px;
  transform: scale(1.08);
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
    min-height: 320px;
    padding: 24px 10px 28px;
    margin-bottom: 16px;
  }

  .primary__logo-image-wrap {
    width: 230px;
    height: 230px;
    margin-bottom: 18px;
  }

  .primary__logo-image {
    transform: scale(1.05);
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