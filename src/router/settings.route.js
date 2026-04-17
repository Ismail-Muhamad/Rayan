export default {
  path: "/settings",
  name: "settings",
  redirect: { name: "types_management" },
  meta: {
    roles: ["admin"],
  },
  children: [
    {
      path: "types-management",
      name: "types_management",
      component: () => import("@/components/settings/TypesManagementView.vue"),
    },
  ],
};