export default {
  path: "/users",
  name: "users",
  component: () => import("@/components/users/UsersIndex.vue"),
  redirect: { name: "users_list" },
  meta: {
    roles: ["admin", "admin_assistant"],
  },
  children: [
    {
      path: "list",
      name: "users_list",
      component: () => import("@/components/users/UsersList.vue"),
    },
    {
      path: "assistants",
      name: "admin_assistants",
      component: () => import("@/components/users/AdminAssistantsPage.vue"),
    },
    {
      path: "consumptions",
      name: "users_consumptions",
      component: () => import("@/components/users/ConsumptionsPage.vue"),
    },
    {
      path: "show/:id",
      name: "users_show",
      component: () => import("@/components/users/UsersShow.vue"),
    },
  ],
};