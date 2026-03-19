/* * */

import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import nodemailer from 'nodemailer';

/* * */

export class EmailProvider {
	//

	private static _instance: EmailProvider;
	private _smtpTransporter: nodemailer.Transporter;

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
	 * Connect to the SMTP server and return the transporter instance.
	 */
	async connect(): Promise<nodemailer.Transporter> {
		try {
			// Check for required environment variables
			if (!process.env.TML_PROVIDER_EMAIL_SERVER_HOST) throw new Error('Missing required environment variable: TML_PROVIDER_EMAIL_SERVER_HOST');
			if (!process.env.TML_PROVIDER_EMAIL_SERVER_PORT) throw new Error('Missing required environment variable: TML_PROVIDER_EMAIL_SERVER_PORT');
			if (!process.env.TML_PROVIDER_EMAIL_AUTH_CLIENT_ID) throw new Error('Missing required environment variable: TML_PROVIDER_EMAIL_AUTH_CLIENT_ID');
			if (!process.env.TML_PROVIDER_EMAIL_AUTH_CLIENT_SECRET) throw new Error('Missing required environment variable: TML_PROVIDER_EMAIL_AUTH_CLIENT_SECRET');
			if (!process.env.TML_PROVIDER_EMAIL_AUTH_ACCESS_URL) throw new Error('Missing required environment variable: TML_PROVIDER_EMAIL_AUTH_ACCESS_URL');
			if (!process.env.TML_PROVIDER_EMAIL_AUTH_REFRESH_TOKEN) throw new Error('Missing required environment variable: TML_PROVIDER_EMAIL_AUTH_REFRESH_TOKEN');
			if (!process.env.TML_PROVIDER_EMAIL_AUTH_USER) throw new Error('Missing required environment variable: TML_PROVIDER_EMAIL_AUTH_USER');
			if (!process.env.TML_PROVIDER_EMAIL_FROM) throw new Error('Missing required environment variable: TML_PROVIDER_EMAIL_FROM');
			// Connect to the SMTP server
			this._smtpTransporter = nodemailer.createTransport({
				auth: {
					accessUrl: process.env.TML_PROVIDER_EMAIL_AUTH_ACCESS_URL,
					clientId: process.env.TML_PROVIDER_EMAIL_AUTH_CLIENT_ID,
					clientSecret: process.env.TML_PROVIDER_EMAIL_AUTH_CLIENT_SECRET,
					refreshToken: process.env.TML_PROVIDER_EMAIL_AUTH_REFRESH_TOKEN,
					type: 'OAuth2',
					user: process.env.TML_PROVIDER_EMAIL_AUTH_USER,
				},
				from: process.env.TML_PROVIDER_EMAIL_FROM,
				host: process.env.TML_PROVIDER_EMAIL_SERVER_HOST,
				port: Number(process.env.TML_PROVIDER_EMAIL_SERVER_PORT),
			});
			return this._smtpTransporter;
		} catch (error) {
			throw new Error('Error connecting to SMTP server', { cause: error });
		}
	}

	/**
	 * Send an email.
	 * @param emailOptions - The email options.
	 * @returns A promise that resolves when the email is sent.
	 */
	async send(sendMailOptions: nodemailer.SendMailOptions) {
		try {
			await this._smtpTransporter.sendMail({
				...this._smtpTransporter.options,
				...sendMailOptions,
			});
		} catch (error) {
			throw new Error('Error sending email', { cause: error });
		}
	}

	//
}

export const emailProvider = asyncSingletonProxy(EmailProvider);
