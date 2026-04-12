export default {
  path: "/dashboard",
  name: "dashboard",
  component: () => import("@/views/DashboardView.vue"),
  redirect: { name: "dashboard_index" },
  meta: {
    roles: ["admin"],
  },
  children: [
    {
      path: "",
      name: "dashboard_index",
      component: () => import("@/components/dashboard/Dashboard.vue"),
    },
  ],
};
