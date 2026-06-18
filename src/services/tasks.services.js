import APIClient from "@/api/apiClient.api";
class TasksServices extends APIClient {
  constructor() {
    super("tasks");
  }
}

export default new TasksServices();
