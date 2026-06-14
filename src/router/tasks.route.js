export default [
  {
    path: "/tasks",
    name: "tasks",
    component: () => import("@/components/tasks/AdminTasksPage.vue"),
    meta: {
      roles: ["admin", "admin_assistant"],
    },
  },
  {
    path: "/tasks/:farmId/:palmTypeId",
    name: "task_details",
    component: () => import("@/components/tasks/AdminTaskDetails.vue"),
    meta: {
      roles: ["admin", "admin_assistant"],
    },
  },
];