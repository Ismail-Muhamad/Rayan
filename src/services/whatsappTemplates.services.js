import APIClient from "@/api/apiClient.api";
import axiosClient from "@/api/axiosClient";

class WhatsAppTemplatesServices extends APIClient {
  constructor() {
    super("whatsapp/templates");
  }

  sendNextMonthReportReady(data) {
    return this.create(data, {}, "next-month-report-ready");
  }

  sendAccountApproved(data) {
    return axiosClient.post(`${this.url}/account-approved`, data, { hideErrorToast: true });
  }
}

export default new WhatsAppTemplatesServices();