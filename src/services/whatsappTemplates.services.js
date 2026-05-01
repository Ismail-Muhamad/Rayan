import APIClient from "@/api/apiClient.api";

class WhatsAppTemplatesServices extends APIClient {
  constructor() {
    super("whatsapp/templates");
  }

  sendNextMonthReportReady(data) {
    return this.create(data, {}, "next-month-report-ready");
  }
}

export default new WhatsAppTemplatesServices();