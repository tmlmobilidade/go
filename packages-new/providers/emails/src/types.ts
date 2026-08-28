/* * */

import { type Transport } from 'nodemailer';

export interface SendEmailProps<T> {
	attachments?: Transport['mailer']['options']['attachments']
	data: T
	to: string | string[]
}
