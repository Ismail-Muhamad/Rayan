import { createRouter, createWebHistory } from "vue-router";
import dashboardRoutes from "./dashboard.route";
import tasksRoutes from "./tasks.route";
import usersRoutes from "./users.route";
import reportsRoutes from "./reports.route";
import farmsRoutes from "./farms.route";
import authRoutes from "./auth.route";
import { authGuard } from "@/helpers/router.helper";
import settingsRoutes from "./settings.route";
import requestsRoutes from "./requests.route";
import inspectionsRecommendationsRoutes from "./inspectionsRecommendations.route";

const routes = [
  {
    path: "/",
    name: "root",
    component: () => import("@/layout/AppLayout.vue"),
    redirect: { name: "dashboard" },
    children: [
      dashboardRoutes,
      ...tasksRoutes,
      usersRoutes,
      reportsRoutes,
      farmsRoutes,
      settingsRoutes,
      requestsRoutes,
      ...inspectionsRecommendationsRoutes,
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not_found",
    component: () => import("@/views/NotFoundView.vue"),
  },
  ...authRoutes.routes,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;

router.beforeEach(authGuard);