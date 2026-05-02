export default {
  path: "/reports",
  name: "reports",
  component: () => import("@/components/reports/ReportsIndex.vue"),
  redirect: { name: "reports_list" },
  meta: {
    roles: ["admin", "admin_assistant"],
  },
  children: [
    {
      path: "list",
      name: "reports_list",
      component: () => import("@/components/reports/ReportsList.vue"),
       meta: {
        roles: ["admin", "admin_assistant"],
      },
    },
    {
      path: "create",
      name: "create_report",
      component: () => import("@/components/reports/ReportsCreate.vue"),
       meta: {
        roles: ["admin", "admin_assistant"],
      },
    },
    {
      path: "edit/:id",
      name: "edit_report",
      component: () => import("@/components/reports/ReportsEdit.vue"),
       meta: {
        roles: ["admin", "admin_assistant"],
      },
    },
    {
      path: "show/:id",
      name: "show_report",
      component: () => import("@/components/reports/ReportsShow.vue"),
       meta: {
        roles: ["admin", "admin_assistant"],
      },
    },
  ],
};
