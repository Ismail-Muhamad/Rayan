export default {
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("@/components/auth/AuthLogin.vue"),
      meta: {
        requiresUnAuth: true,
      },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/components/auth/AuthRegister.vue"),
      meta: { requiresUnAuth: true },
    },
  ],
};
