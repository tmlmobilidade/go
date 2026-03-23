import { Dates } from '@tmlmobilidade/dates';
import { renderSystemErrorTemplate } from '@tmlmobilidade/emails';
import nodemailer, { Transporter } from 'nodemailer';

export interface MailOptions {
	from: string
	html?: string
	subject: string
	text?: string
	to: string | string[]
}

export interface SmtpConfig {
	auth: {
		pass: string
		user: string
	}
	host: string
	port: number
}

export interface EmailConfig {
	mail_options: Omit<MailOptions, 'html' | 'text'>
	send_failure: boolean
	send_success: boolean
	smtp: SmtpConfig
}

export class MailerService {
	private transporter: Transporter;

	constructor(private config: EmailConfig) {
		this.transporter = nodemailer.createTransport(this.config.smtp);
	}

	public async sendFailureMail(error: string): Promise<void> {
		const emailHtml = await renderSystemErrorTemplate({
			errorMessage: error,
			serviceName: this.config.mail_options.subject,
			timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
		});

		const mailOptions = {
			...this.config.mail_options,
			html: emailHtml,
			subject: `${this.config.mail_options.subject}: Falha na execução do backup`,
		};

		await this.sendMail(mailOptions);
	}

	public async sendSuccessMail(): Promise<void> {
		const mailOptions = {
			...this.config.mail_options,
			subject: `${this.config.mail_options.subject}: Backup successful`,
			text: 'Backup was successful',
		};

		await this.sendMail(mailOptions);
	}

	private async sendMail(mailOptions: MailOptions): Promise<void> {
		try {
			const info = await this.transporter.sendMail(mailOptions);
			console.log(`Email sent: ${info.messageId}`);
		} catch (error) {
			console.error('Error sending email:', error);
		}
	}
}
