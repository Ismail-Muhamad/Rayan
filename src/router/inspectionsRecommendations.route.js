export default {
  path: "/inspections-recommendations",
  name: "inspections_recommendations",
  component: () =>
    import("@/components/inspections/AdminInspectionsRecommendations.vue"),
  meta: {
    roles: ["admin", "admin_assistant"],
  },
};
