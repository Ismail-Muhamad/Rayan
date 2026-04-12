import UsersServices from "@/services/users.services";
import createStore from "@/helpers/storeFactory.helper";
export const useUsersStore = createStore("users", UsersServices);
