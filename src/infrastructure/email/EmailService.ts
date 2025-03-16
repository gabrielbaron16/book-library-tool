import nodemailer from "nodemailer";
import { IEmailService } from "../../domain/email/IEmailService";
import logger from "../../config/logger";

export class EmailService implements IEmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: "localhost",
            port: 1025,
            secure: false
        });
    }

    async sendEmail(to: string, subject: string, body: string): Promise<void> {
        const mailOptions = {
            from: "no-reply@accountable.com",
            to,
            subject,
            text: body
        };

        await this.transporter.sendMail(mailOptions);
        logger.debug(`📧 Email sent to ${to}`);
    }
}
