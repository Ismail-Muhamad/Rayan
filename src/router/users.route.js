export default {
  path: "/users",
  name: "users",
  component: () => import("@/components/users/UsersIndex.vue"),
  redirect: { name: "users_list" },
  meta: {
    roles: ["admin"],
  },
  children: [
    {
      path: "list",
      name: "users_list",
      component: () => import("@/components/users/UsersList.vue"),
    },
    {
      path: "show/:id",
      name: "users_show",
      component: () => import("@/components/users/UsersShow.vue"),
    },
    {
      path: "consumptions",
      name: "users_consumptions",
      component: () => import("@/components/users/ConsumptionsPage.vue"),
    },
  ],
};