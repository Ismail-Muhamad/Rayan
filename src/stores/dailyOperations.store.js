import { defineStore } from "pinia";
import dailyOperationsService from "@/services/dailyOperations.services";
import { toast } from "vue-sonner";

export const useDailyOperationsStore = defineStore("dailyOperations", {
  state: () => ({
    loading: false,
    error: null,
  }),
  actions: {
    async fetchOperation(params) {
      this.loading = true;
      try {
        const response = await dailyOperationsService.getOperation(params);
        return response.data;
      } catch (error) {
        console.error("Error fetching daily operation:", error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    async saveOperation(data) {
      this.loading = true;
      try {
        const response = await dailyOperationsService.saveOperation(data);
        toast.success("تم حفظ العمليات بنجاح");
        return response.data;
      } catch (error) {
        console.error("Error saving daily operation:", error);
        toast.error("حدث خطأ أثناء حفظ العمليات");
        return null;
      } finally {
        this.loading = false;
      }
    },
  },
});
