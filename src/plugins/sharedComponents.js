import { defineAsyncComponent } from "vue";

const components = [
  {
    name: "BaseInput",
    component: defineAsyncComponent(
      () => import("@/components/shared/BaseInput.vue"),
    ),
  },
  {
    name: "BaseSelect",
    component: defineAsyncComponent(
      () => import("@/components/shared/BaseSelect.vue"),
    ),
  },
  {
    name: "BaseDatePicker",
    component: defineAsyncComponent(
      () => import("@/components/shared/BaseDatePicker.vue"),
    ),
  },
  {
    name: "BaseIcon",
    component: defineAsyncComponent(
      () => import("@/components/shared/BaseIcon.vue"),
    ),
  },
  {
    name: "BaseButton",
    component: defineAsyncComponent(
      () => import("@/components/shared/BaseButton.vue"),
    ),
  },
  {
    name: "BaseSpinner",
    component: defineAsyncComponent(
      () => import("@/components/shared/BaseSpinner.vue"),
    ),
  },
  {
    name: "BaseTable",
    component: defineAsyncComponent(
      () => import("@/components/shared/Table/BaseTable.vue"),
    ),
  },
  {
    name: "BaseSearchInput",
    component: defineAsyncComponent(
      () => import("@/components/shared/BaseSearchInput.vue"),
    ),
  },
  {
    name: "BasePageWrapper",
    component: defineAsyncComponent(
      () => import("@/layout/BasePageWrapper.vue"),
    ),
  },
  {
    name: "BaseHeaderLayout",
    component: defineAsyncComponent(
      () => import("@/layout/BaseHeaderLayout.vue"),
    ),
  },
  {
    name: "BaseAccordion",
    component: defineAsyncComponent(
      () => import("@/components/shared/BaseAccordion.vue"),
    ),
  },
  {
    name: "BaseAccordionItem",
    component: defineAsyncComponent(
      () => import("@/components/shared/BaseAccordionItem.vue"),
    ),
  },
  {
    name: "BaseStyledSection",
    component: defineAsyncComponent(
      () => import("@/components/shared/BaseStyledSection.vue"),
    ),
  },
  {
    name: "BaseTextEditor",
    component: defineAsyncComponent(
      () => import("@/components/shared/BaseTextEditor.vue"),
    ),
  },
  {
    name: "BaseLoader",
    component: defineAsyncComponent(
      () => import("@/components/shared/BaseLoader.vue"),
    ),
  },
  {
    name: "BaseCard",
    component: defineAsyncComponent(
      () => import("@/components/shared/BaseCard.vue"),
    ),
  },
  {
    name: "BaseModal",
    component: defineAsyncComponent(
      () => import("@/components/shared/BaseModal.vue"),
    ),
  },
];

export default {
  install(app) {
    components.forEach((component) => {
      const name = `${component.name}`;
      app.component(name, component.component);
    });
  },
};
