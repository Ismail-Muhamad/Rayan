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
  {
    path: "/client/inspections-recommendations",
    name: "client_inspections_recommendations",
    component: () =>
      import("@/components/inspections/ClientInspectionsRecommendations.vue"),
    meta: {
      roles: ["farm_owner"],
    },
  },
  {
    path: "/client/inspections-recommendations/farm/:farmId",
    name: "client_inspections_farm_details",
    component: () =>
      import("@/components/inspections/ClientInspectionsFarmDetails.vue"),
    meta: {
      roles: ["farm_owner"],
    },
  },
];
