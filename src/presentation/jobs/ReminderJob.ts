import cron from "node-cron";
import { container } from "tsyringe";
import {IReservationService} from "../../application/services/reservation/IReservationService";
import logger from "../../config/logger";

export class ReminderJob {
    static startJobs() {
        const reservationService = container.resolve<IReservationService>("IReservationService");

        cron.schedule("*/1 * * * *", async () => {
            logger.info("Executing job for reminder emails...");
            const results = await Promise.allSettled([
                reservationService.notifyUpcomingDueDate(),
                reservationService.notifyLateReturns()
            ]);

            results.forEach((result, index) => {
                if (result.status === "rejected") {
                    logger.error(`Error in job ${index + 1}:`, result.reason);
                }
            });
        });
    }
}