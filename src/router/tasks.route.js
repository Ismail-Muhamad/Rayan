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
  {
    path: "/tasks/calendar",
    name: "admin_tasks_calendar",
    component: () => import("@/components/tasks/AdminTasksCalendar.vue"),
    meta: {
      roles: ["admin", "admin_assistant"],
    },
  },
  {
    path: "/tasks/calendar/day/:date",
    name: "admin_task_calendar_day",
    component: () => import("@/components/tasks/AdminTaskCalendarDay.vue"),
    meta: {
      roles: ["admin", "admin_assistant"],
    },
  },
];