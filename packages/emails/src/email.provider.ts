/* * */

import { AsyncSingletonProxy } from '@tmlmobilidade/go-utils';
import nodemailer from 'nodemailer';

/* * */

export class EmailProvider {
	//

	private static _instance: EmailProvider;
	private _smtp_transporter: nodemailer.Transporter;

	/**
     * Return the instance of the EmailProvider.
     */
	public static async getInstance() {
		if (!EmailProvider._instance) {
			const instance = new EmailProvider();
			await instance.connect();
			EmailProvider._instance = instance;
		}
		return EmailProvider._instance;
	}

	/**
     * Connect to MongoDB and return the database instance.
     */
	async connect(): Promise<nodemailer.Transporter> {
		try {
			// Check for required environment variables
			const requiredEnvVars = [
				'TML_PROVIDER_EMAIL_SERVER_PASSWORD',
				'TML_PROVIDER_EMAIL_SERVER_USER',
				'TML_PROVIDER_EMAIL_FROM',
				'TML_PROVIDER_EMAIL_SERVER_HOST',
				'TML_PROVIDER_EMAIL_SERVER_PORT',
			];

			const missingVars = requiredEnvVars.filter(key => !process.env[key]);
			if (missingVars.length > 0) {
				throw new Error(
					`Missing required environment variable(s): ${missingVars.join(', ')}`,
				);
			}

			// Create the SMTP transporter
			const smtpTransportOptions = {
				auth: {
					pass: process.env.TML_PROVIDER_EMAIL_SERVER_PASSWORD,
					user: process.env.TML_PROVIDER_EMAIL_SERVER_USER,
				},
				from: process.env.TML_PROVIDER_EMAIL_FROM,
				host: process.env.TML_PROVIDER_EMAIL_SERVER_HOST,
				port: Number(process.env.TML_PROVIDER_EMAIL_SERVER_PORT),
			};
			// Connect to the SMTP server
			this._smtp_transporter = nodemailer.createTransport(smtpTransportOptions);
			return this._smtp_transporter;
		}
		catch (error) {
			throw new Error('Error connecting to SMTP server', { cause: error });
		}
	}

	/**
     * Send an email.
	 *
	 * @param emailOptions - The email options.
	 * @returns A promise that resolves when the email is sent.
     */
	async send({
		html,
		subject,
		to,
		...options
	}: nodemailer.SendMailOptions) {
		try {
			await this._smtp_transporter.sendMail({
				...this._smtp_transporter.options,
				html,
				subject,
				to,
				...options,
			});
		}
		catch (error) {
			throw new Error('Error sending email', { cause: error });
		}
	}

	//
}

export const emailProvider = AsyncSingletonProxy(EmailProvider);
