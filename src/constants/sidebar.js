export default [
  {
    icon: "streamline-flex:dashboard-3",
    key: "dashboard",
    label: "dashboard.title",
    path: "/dashboard",
    routeName: "dashboard",
    roles: ["admin"],
  },
  {
    icon: "solar:users-group-rounded-outline",
    key: "users",
    label: "users.title",
    path: "/users",
    routeName: "users",
    roles: ["admin"],
  },
  {
    icon: "solar:clipboard-list-outline",
    key: "reports",
    label: "reports.title",
    path: "/reports",
    routeName: "reports",
    roles: ["admin"],
  },
  {
    icon: "mdi:sprout",
    key: "farms",
    label: "farms.title",
    path: "/farms",
    routeName: "farms",
    roles: ["farm_owner"],
  },
];