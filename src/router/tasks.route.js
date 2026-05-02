export default {
  path: "/tasks",
  name: "tasks",
  component: () => import("@/components/tasks/AdminTasksPage.vue"),
  meta: {
    roles: ["admin"],
  },
};