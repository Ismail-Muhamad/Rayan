import MonthlyInspectionsServices from "@/services/monthlyInspections.services";
import createStore from "@/helpers/storeFactory.helper";
export const useMonthlyInspectionsStore = createStore("monthlyInspections", MonthlyInspectionsServices);
