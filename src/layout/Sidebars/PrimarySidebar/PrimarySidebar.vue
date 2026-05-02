<template>
  <aside v-if="shouldRenderSidebar" :class="[
    'primary',
    {
      'primary--expanded': sidebarExpanded,
      'primary--mobile': isMobile,
      'primary--mobile-open': mobileOpen,
    },
  ]" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
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
      <PrimarySidebarItem v-for="item in primaryMenu" :key="item.id || item.key || item.routeName" :route="item"
        :is-active="isActiveRoute(item.path)" :expanded="sidebarExpanded" @navigate="handleNavigate" />
    </div>

    <div class="primary__footer">
      <a v-if="isFarmOwner" class="primary__promo" href="https://tilvix-website.vercel.app/" target="_blank"
        rel="noopener noreferrer">
        <div class="primary__promo-overlay"></div>
        <div class="primary__promo-shine"></div>

        <div class="primary__promo-main">
          <div v-show="sidebarExpanded" class="primary__promo-content">
            <h3 class="primary__promo-title">Tilvix</h3>
            <p class="primary__promo-text">
              تم التطوير بواسطة شركة <strong>Tilvix</strong>
            </p>
          </div>

          <div class="primary__promo-logo-wrap">
            <img :src="promoLogoImage" alt="Tilvix Logo" class="primary__promo-logo" />
          </div>
        </div>
      </a>

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
import promoLogoImage from "@/assets/tilvix-logo.png";
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
      promoLogoImage,
      isExpandedDesktop: true,
    };
  },
  computed: {
    shouldRenderSidebar() {
      if (this.hidePrimarySidebar) return false;
      if (this.isMobile) return this.mobileOpen;
      return true;
    },

    isFarmOwner() {
      const authStore = useAuthStore();
      return authStore.userData?.role === "farm_owner";
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
        return (
          this.currentPath === "/users" ||
          this.currentPath.startsWith("/users/list") ||
          this.currentPath.startsWith("/users/show")
        );
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
      drop-shadow(0 18px 36px rgba(0, 0, 0, 0.28)) drop-shadow(0 8px 18px rgba(0, 0, 0, 0.22));
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
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.18);
  }

  &__promo {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 12px 14px;
    border-radius: 24px;
    text-decoration: none;
    overflow: hidden;
    background:
      radial-gradient(circle at top right, rgba(255, 222, 138, 0.12), transparent 28%),
      radial-gradient(circle at bottom left, rgba(255, 203, 84, 0.08), transparent 26%),
      linear-gradient(135deg, #0b0b0d 0%, #111216 42%, #15161b 100%);
    border: 1px solid rgba(248, 212, 115, 0.28);
    box-shadow:
      0 18px 36px rgba(0, 0, 0, 0.28),
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      inset 0 0 0 1px rgba(248, 212, 115, 0.04);
    isolation: isolate;
    transition:
      transform 240ms ease,
      box-shadow 240ms ease,
      border-color 240ms ease,
      filter 240ms ease;

    &:hover {
      transform: translateY(-3px);
      border-color: rgba(248, 212, 115, 0.5);
      box-shadow:
        0 26px 48px rgba(0, 0, 0, 0.34),
        0 0 30px rgba(248, 212, 115, 0.14),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
      filter: saturate(1.05);
    }

    &::before {
      content: "";
      position: absolute;
      inset-inline: 0;
      top: 0;
      height: 3px;
      background: linear-gradient(90deg, #6f5313 0%, #f8d473 48%, #8f6b17 100%);
      z-index: 1;
    }
  }

  &__promo-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(115deg, transparent 0%, rgba(255, 255, 255, 0.02) 32%, transparent 56%),
      radial-gradient(circle at 85% 20%, rgba(248, 212, 115, 0.12), transparent 24%);
    pointer-events: none;
    z-index: 0;
  }

  &__promo-shine {
    position: absolute;
    top: 0;
    inset-inline-start: -65%;
    width: 48%;
    height: 100%;
    background: linear-gradient(120deg,
        transparent 0%,
        rgba(255, 255, 255, 0.03) 20%,
        rgba(255, 238, 181, 0.18) 48%,
        rgba(255, 255, 255, 0.03) 76%,
        transparent 100%);
    transform: skewX(-24deg);
    pointer-events: none;
    z-index: 1;
    animation: tilvixShine 5.8s ease-in-out infinite;
  }

  &__promo-main {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr 64px;
    align-items: center;
    gap: 14px;
  }

  &__promo-content {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__promo-title {
    margin: 0;
    color: #fff5d7;
    font-size: 24px;
    font-weight: 900;
    line-height: 1.02;
    letter-spacing: -0.02em;
    text-shadow: 0 2px 12px rgba(248, 212, 115, 0.08);
  }

  &__promo-text {
    margin: 0;
    color: #f5e2ae;
    font-size: 12px;
    line-height: 1.6;
    font-weight: 700;

    strong {
      color: #ffffff;
      font-weight: 900;
    }
  }

  &__promo-logo-wrap {
    position: relative;
    width: 64px;
    height: 64px;
    min-width: 64px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      linear-gradient(180deg, rgba(255, 250, 235, 0.98), rgba(248, 212, 115, 0.94));
    border: 1px solid rgba(255, 239, 189, 0.48);
    box-shadow:
      0 12px 24px rgba(0, 0, 0, 0.24),
      inset 0 1px 0 rgba(255, 255, 255, 0.72);
    z-index: 2;
  }

  &__promo-logo-wrap::after {
    content: "";
    position: absolute;
    inset: 6px;
    border-radius: 12px;
    border: 1px solid rgba(15, 15, 15, 0.08);
    pointer-events: none;
  }

  &__promo-logo {
    width: 38px;
    height: 38px;
    object-fit: contain;
    display: block;
    filter: drop-shadow(0 2px 4px rgba(69, 49, 0, 0.16));
  }

  &__logout {
    width: 100%;
    min-height: 50px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border: 0;
    border-radius: 16px;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.12);
    transition:
      background-color 220ms ease,
      transform 220ms ease,
      box-shadow 220ms ease;

    &:hover {
      background: rgba(255, 255, 255, 0.18);
      transform: translateY(-1px);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    }
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
    drop-shadow(0 18px 36px rgba(0, 0, 0, 0.28)) drop-shadow(0 8px 18px rgba(0, 0, 0, 0.22));
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

@keyframes tilvixShine {
  0% {
    transform: translateX(0) skewX(-24deg);
    opacity: 0;
  }

  12% {
    opacity: 1;
  }

  38% {
    transform: translateX(420%) skewX(-24deg);
    opacity: 0;
  }

  100% {
    transform: translateX(420%) skewX(-24deg);
    opacity: 0;
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
      drop-shadow(0 20px 38px rgba(0, 0, 0, 0.28)) drop-shadow(0 10px 22px rgba(0, 0, 0, 0.22));
  }

  .primary__brand {
    font-size: 16px;
  }

  .primary__brand-sub {
    font-size: 13px;
  }

  .primary__promo {
    padding: 12px 13px;
  }

  .primary__promo-main {
    grid-template-columns: 1fr 60px;
    gap: 12px;
  }

  .primary__promo-title {
    font-size: 22px;
  }

  .primary__promo-logo-wrap {
    width: 60px;
    height: 60px;
    min-width: 60px;
  }

  .primary__promo-logo {
    width: 36px;
    height: 36px;
  }
}
</style>