/* * */

import { emailProvider } from '@/email.provider.js';
import { NotificationEmailProps } from '@/emails/notification-email.js';
import { PlanApprovalRequestEmailProps } from '@/emails/plan-approval-request.js';
import { ResetPasswordEmailProps } from '@/emails/reset-password.js';
import { SucessfulGtfsValidationEmailProps } from '@/emails/sucessful-gtfs-validation.js';
import { UnsuccessfulGtfsValidationEmailProps } from '@/emails/unsucessful-gtfs-validation.js';
import { WelcomeEmailProps } from '@/emails/welcome.js';
import { RenderEmailNotificationEmail, RenderPlanApprovalRequestEmail, RenderResetPasswordEmail, RenderSucessfulGtfsValidationEmail, RenderUnsuccessfulGtfsValidationEmail, RenderWelcomeEmail } from '@/renderer.js';
import { type FailedBackupProps, failedBackupSubject, renderFailedBackupTemplate } from '@/templates/failed-backup.js';

/* * */

export type {
	FailedBackupProps,
	NotificationEmailProps,
	PlanApprovalRequestEmailProps,
	ResetPasswordEmailProps,
	SucessfulGtfsValidationEmailProps,
	UnsuccessfulGtfsValidationEmailProps,
	WelcomeEmailProps,
};

/* * */

export interface SendEmailProps<T> {
	data: T
	to: string | string[]
}

export async function sendResetPasswordEmail({ data, to }: SendEmailProps<ResetPasswordEmailProps>) {
	const emailHtml = await RenderResetPasswordEmail(data);
	await emailProvider.send({
		html: emailHtml,
		subject: 'Redefinição da sua palavra-passe',
		to: to,
	});
};

export async function sendWelcomeEmail({ data, to }: SendEmailProps<WelcomeEmailProps>) {
	const emailHtml = await RenderWelcomeEmail(data);
	await emailProvider.send({
		html: emailHtml,
		subject: 'Bem-vindo ao GO!',
		to: to,
	});
};

export async function sendGtfsValidationEmail({ data, to }: SendEmailProps<SucessfulGtfsValidationEmailProps | UnsuccessfulGtfsValidationEmailProps>) {
	if (!data.validation.summary) throw new Error('Validation summary is required');
	const success = data.validation.summary.total_errors === 0;

	const emailHtml = success ? await RenderSucessfulGtfsValidationEmail(data) : await RenderUnsuccessfulGtfsValidationEmail(data);
	await emailProvider.send({
		html: emailHtml,
		subject: success ? 'Validação GTFS realizada com sucesso' : 'Validação GTFS com erros',
		to: to,
	});
};

export async function sendPlanApprovalRequestEmail({ data, to }: SendEmailProps<PlanApprovalRequestEmailProps>) {
	const emailHtml = await RenderPlanApprovalRequestEmail(data);
	await emailProvider.send({
		html: emailHtml,
		subject: 'Pedido de aprovação de plano',
		to: to,
	});
};

export async function sendNotificationEmail({ data, to }: SendEmailProps<NotificationEmailProps>) {
	const emailHtml = await RenderEmailNotificationEmail(data);
	await emailProvider.send({
		html: emailHtml,
		subject: 'Nova Notificação',
		to: to,
	});
};
