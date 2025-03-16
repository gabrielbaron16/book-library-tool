import cron from "node-cron";
import { container } from "tsyringe";
import {IReservationService} from "../../application/services/reservation/IReservationService";
import logger from "../../config/logger";

export class ReminderJob {
    static startJobs() {
        const reservationService = container.resolve<IReservationService>("IReservationService");

        cron.schedule("*/2 * * * *", async () => {
            logger.info("Executing job for reminder emails...");
            await reservationService.notifyUpcomingDueDate();
        });
    }
}