import RequestsServices from "@/services/requests.services";
import createStore from "@/helpers/storeFactory.helper";
export const useRequestsStore = createStore("requests", RequestsServices);
