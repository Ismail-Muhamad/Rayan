export default {
  path: "/farms",
  name: "farms",
  component: () => import("@/components/farms/FarmsIndex.vue"),
  redirect: { name: "farms_list" },
  meta: {
    roles: ["farm_owner"],
  },
  children: [
    {
      path: "list",
      name: "farms_list",
      component: () => import("@/components/farms/FarmsList.vue"),
    },
    {
      path: "create",
      name: "create_farm",
      component: () => import("@/components/farms/FarmsCreate.vue"),
    },
    {
      path: "edit/:id",
      name: "edit_farm",
      component: () => import("@/components/farms/FarmsEdit.vue"),
    },
    {
      path: "show/:id",
      name: "show_farm",
      component: () => import("@/components/farms/FarmsShow.vue"),
    },
  {
  path: "show/:id/report/:reportId/week/:weekId",
  name: "show_farm_week",
  component: () => import("@/components/farms/FarmWeekShow.vue"),
},
  ],
};