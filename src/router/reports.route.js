export default {
  path: "/reports",
  name: "reports",
  component: () => import("@/components/reports/ReportsIndex.vue"),
  redirect: { name: "reports_list" },
  meta: {
    roles: ["admin"],
  },
  children: [
    {
      path: "list",
      name: "reports_list",
      component: () => import("@/components/reports/ReportsList.vue"),
    },
    {
      path: "create",
      name: "create_report",
      component: () => import("@/components/reports/ReportsCreate.vue"),
    },
    {
      path: "edit/:id",
      name: "edit_report",
      component: () => import("@/components/reports/ReportsEdit.vue"),
    },
    {
      path: "show/:id",
      name: "show_report",
      component: () => import("@/components/reports/ReportsShow.vue"),
    },
  ],
};
