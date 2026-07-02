export default [
  {
    path: "/inspections-recommendations",
    name: "inspections_recommendations",
    component: () =>
      import("@/components/inspections/AdminInspectionsRecommendations.vue"),
    meta: {
      roles: ["admin", "admin_assistant"],
    },
  },
  {
    path: "/inspections-recommendations/farm/:farmId",
    name: "inspections_farm_details",
    component: () =>
      import("@/components/inspections/AdminInspectionsFarmDetails.vue"),
    meta: {
      roles: ["admin", "admin_assistant"],
    },
  },
];
