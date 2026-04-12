import FarmsServices from "@/services/farms.services";
import createStore from "@/helpers/storeFactory.helper";
export const useFarmsStore = createStore("farms", FarmsServices);
