import cron from "node-cron";

import { processRecurringTransactionsService } from "../services/recurring.service.js";

cron.schedule("0 0 * * *", async () => {
  try {
    await processRecurringTransactionsService();
  } catch (error) {
    console.error("Recurring transaction processing failed:", error.message);
  }
});
