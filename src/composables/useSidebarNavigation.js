import { computed } from "vue";
import { useRoute } from "vue-router";
import sidebarConfig from "@/constants/sidebar.js";

export function useSidebarNavigation() {
  const route = useRoute();

  const findNavItem = (items, routeName) => {
    for (const item of items) {
      // Check if this is the item we're looking for
      if (item.routeName === routeName) {
        return item;
      }

      // Check in children if they exist
      if (item.children) {
        const found = findNavItem(item.children, routeName);
        if (found) return found;
      }

      // For grouped items, check in each group's children
      if (item.items) {
        for (const group of item.items) {
          if (group.children) {
            const found = findNavItem(group.children, routeName);
            if (found) return found;
          }
        }
      }
    }
    return null;
  };

  const getBaseRouteName = (routeName) =>
    // For routes like "conversations_messages", get "conversations"
    routeName.split("_")[0];
  const currentNavItem = computed(() => {
    if (!route.name) return null;

    // First try to find the exact route
    const exactMatch = findNavItem(sidebarConfig, route.name);
    if (exactMatch) return exactMatch;

    // For simple routes like conversations, try to find the base route
    const baseRouteName = getBaseRouteName(route.name);
    const baseMatch = findNavItem(sidebarConfig, baseRouteName);
    if (baseMatch) return baseMatch;

    // If still no match, try to find parent (for deeply nested settings routes)
    const parentRouteName = route.name.split("_").slice(0, -1).join("_");
    return parentRouteName ? findNavItem(sidebarConfig, parentRouteName) : null;
  });

  // Header-specific nav item that prioritizes parent routes for nested navigation
  const headerNavItem = computed(() => {
    if (!route.name) return null;

    // First try to find the exact route
    const exactMatch = findNavItem(sidebarConfig, route.name);
    if (exactMatch) return exactMatch;
    // Try to find parent (for nested routes like settings_teams_list -> settings_teams)
    if (route.matched.length > 1) {
      // Get the second to last item (the immediate parent)
      const parentRoute = route.matched[route.matched.length - 2];
      const parentRouteName = parentRoute.name; // This will be the name you defined in your router config
      const parentMatch = parentRouteName
        ? findNavItem(sidebarConfig, parentRouteName)
        : null;
      if (parentMatch) return parentMatch;
    }

    // For simple routes like conversations, try to find the base route
    const baseRouteName = getBaseRouteName(route.name);
    const baseMatch = findNavItem(sidebarConfig, baseRouteName);
    if (baseMatch) return baseMatch;

    return null;
  });

  // const currentParentMenuItem = computed(() => {
  //   if (!route.name) return null;
  //   const parentRouteName = route.name.split("_").slice(0, -1).join("_");
  //   return parentRouteName ? findNavItem(sidebarConfig, parentRouteName) : null;
  // });

  const currentParentRoute = computed(() => {
    if (!route.name) return null;
    const parentRouteName = route.name.split("_").slice(0, -1).join("_");
    return parentRouteName ? findNavItem(sidebarConfig, parentRouteName) : null;
  });

  const activePrimaryNavItem = computed(() => {
    if (!route.name) return null;

    // Always find by prefix (module name) to get the top-level parent
    // e.g. settings_teams_list -> settings
    // e.g. settings_profile -> settings
    const moduleName = route.name.split("_")[0];
    // We want the top-level item, so we search directly in the config array
    // instead of using recursive findNavItem
    const moduleMatch = sidebarConfig.find(
      (item) => item.routeName === moduleName || item.key === moduleName
    );

    return moduleMatch || null;
  });

  const headerContent = computed(() => {
    const item = currentNavItem.value;
    if (!item) return null;

    return {
      title: item.title || item.label,
      description: item.description,
      icon: item.icon,
    };
  });

  return {
    currentNavItem,
    headerNavItem,
    activePrimaryNavItem,
    headerContent,
  };
}
