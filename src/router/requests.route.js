export default {
  path: "/requests",
  name: "requests",
  component: () => import("@/views/RequestsView.vue"),
  redirect: { name: "requests_index" },
  meta: {
    roles: ["admin"],
  },
  children: [
    {
      path: "",
      name: "requests_index",
      component: () => import("@/components/requests/RequestsList.vue"),
    },
  ],
};
