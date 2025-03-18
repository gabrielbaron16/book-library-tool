import nodemailer from "nodemailer";
import { IEmailService } from "../../domain/email/IEmailService";
import logger from "../../config/logger";
import dotenv from "dotenv";

dotenv.config();

export class EmailService implements IEmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || "localhost",
            port: parseInt(process.env.EMAIL_PORT || "1025", 10),
            secure: process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === "true" : false
        });
    }

    async sendEmail(to: string, subject: string, body: string): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_FROM || "no-reply@accountable.com",
            to,
            subject,
            text: body
        };

        await this.transporter.sendMail(mailOptions);
        logger.debug(`📧 Email sent to ${to}`);
    }
}