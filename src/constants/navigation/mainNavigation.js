export const mainNavigation = [
  {
    icon: "Element",
    key: "dashboard",
    label: "MENU.DASHBOARD.TEXT",
    path: "/dashboard",
    routeName: "dashboard",
    isItemsGrouped: false,
    items: [],
    // Direct properties affect router behavior
    hideHeader: false,
    childRoutes: [
      {
        path: "analytics",
        name: "dashboard_analytics",
        component: "DashboardAnalytics",
        // Direct property for layout control
        hideHeader: true,
        // Meta for application-specific data
        meta: {
          requiresAuth: true,
          roles: ["analyst", "admin"],
          layout: "fullwidth",
          breadcrumb: "Analytics Dashboard",
          pageTitle: "Analytics | Dashboard",
          cacheRoute: true,
          transitions: {
            enter: "fade",
            leave: "slide",
          },
        },
      },
      {
        path: "details/:id",
        name: "dashboard_details",
        component: "DashboardDetails",
        meta: {
          requiresAuth: true,
          breadcrumb: "Dashboard Details",
          permissions: {
            read: true,
            write: false,
          },
        },
      },
    ],
  },
  {
    icon: "DirectInbox",
    key: "conversations",
    label: "MENU.CONVERSATIONS.TEXT",
    path: "/conversations",
    routeName: "conversations",
    isItemsGrouped: false,
    items: [],
    childRoutes: [
      {
        path: "chat/:id",
        name: "conversation_chat",
        component: "ConversationChat",
        // Direct property affecting layout
        hideHeader: true,
        // Meta for features and behavior
        meta: {
          requiresAuth: true,
          layout: "chat",
          cacheRoute: true,
          transitions: {
            enter: "slide-up",
            leave: "slide-down",
          },
        },
      },
      {
        path: "settings",
        name: "conversation_settings",
        component: "ConversationSettings",
        meta: {
          requiresAuth: true,
          roles: ["admin", "moderator"],
          breadcrumb: "Chat Settings",
        },
        children: [
          {
            path: "notifications",
            name: "conversation_notifications",
            component: "ConversationNotifications",
            meta: {
              breadcrumb: "Notification Settings",
              permissions: {
                configure: true,
              },
            },
          },
        ],
      },
    ],
  },
  {
    icon: "UserSquare",
    key: "contacts",
    label: "MENU.CONTACTS.TEXT",
    path: "/contacts",
    routeName: "contacts",
    isItemsGrouped: false,
    items: [],
  },
  {
    icon: "Brodcast",
    key: "broadcast",
    label: "MENU.BROADCAST.TEXT",
    path: "/broadcast",
    routeName: "broadcast",
    isItemsGrouped: false,
    items: [],
  },
  {
    icon: "HierarchySquare2",
    label: "MENU.WORKFLOWS.TEXT",
    path: "/workflow",
    routeName: "workflow",
    isItemsGrouped: false,
    items: [],
  },
  {
    icon: "MobileProgramming",
    label: "MENU.PAGE_BUILDER.TEXT",
    path: "/page_builder",
    routeName: "page_builder",
    isItemsGrouped: false,
    items: [],
  },
  {
    icon: "CallCalling",
    label: "MENU.WEBPHONE.TEXT",
    path: "/webphone",
    routeName: "webphone",
    isItemsGrouped: false,
    items: [],
  },
];
