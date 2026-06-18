import TasksServices from "@/services/tasks.services";
import createStore from "@/helpers/storeFactory.helper";
export const useTasksStore = createStore("tasks", TasksServices);
