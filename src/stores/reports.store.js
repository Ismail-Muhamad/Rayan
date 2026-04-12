import ReportsServices from "@/services/reports.services";
import createStore from "@/helpers/storeFactory.helper";
export const useReportsStore = createStore("reports", ReportsServices);
