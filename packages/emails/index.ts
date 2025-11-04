/* * */

import { emailProvider } from '@/email.provider.js';
import { FailedBackupEmailProps } from '@/emails/failed-backup.js';
import { NotificationEmailProps } from '@/emails/notification-email.js';
import { PlanApprovalRequestEmailProps } from '@/emails/plan-approval-request.js';
import { ResetPasswordEmailProps } from '@/emails/reset-password.js';
import { SucessfulGtfsValidationEmailProps } from '@/emails/sucessful-gtfs-validation.js';
import { UnsuccessfulGtfsValidationEmailProps } from '@/emails/unsucessful-gtfs-validation.js';
import { WelcomeEmailProps } from '@/emails/welcome.js';
import { RenderEmailNotificationEmail, RenderFailedBackupEmail, RenderPlanApprovalRequestEmail, RenderResetPasswordEmail, RenderSucessfulGtfsValidationEmail, RenderUnsuccessfulGtfsValidationEmail, RenderWelcomeEmail } from '@/renderer.js';

/* * */

export type {
	FailedBackupEmailProps,
	NotificationEmailProps,
	PlanApprovalRequestEmailProps,
	ResetPasswordEmailProps,
	SucessfulGtfsValidationEmailProps,
	UnsuccessfulGtfsValidationEmailProps,
	WelcomeEmailProps,
};

export * from '@/renderer.js';

/* * */

export interface SendEmailProps<T> {
	props: T
	to: string | string[]
}

export async function sendFailedBackupEmail(props: SendEmailProps<FailedBackupEmailProps>) {
	const emailHtml = await RenderFailedBackupEmail(props.props);
	await emailProvider.send({
		html: emailHtml,
		subject: 'Falha na execução do backup',
		to: props.to,
	});
};

export async function sendResetPasswordEmail(props: SendEmailProps<ResetPasswordEmailProps>) {
	const emailHtml = await RenderResetPasswordEmail(props.props);
	await emailProvider.send({
		html: emailHtml,
		subject: 'Redefinição da sua palavra-passe',
		to: props.to,
	});
};

export async function sendWelcomeEmail(props: SendEmailProps<WelcomeEmailProps>) {
	const emailHtml = await RenderWelcomeEmail(props.props);
	await emailProvider.send({
		html: emailHtml,
		subject: 'Bem-vindo ao GO!',
		to: props.to,
	});
};

export async function sendGtfsValidationEmail(props: SendEmailProps<SucessfulGtfsValidationEmailProps | UnsuccessfulGtfsValidationEmailProps>) {
	if (!props.props.validation.summary) throw new Error('Validation summary is required');
	const success = props.props.validation.summary.total_errors === 0;

	const emailHtml = success ? await RenderSucessfulGtfsValidationEmail(props.props) : await RenderUnsuccessfulGtfsValidationEmail(props.props);
	await emailProvider.send({
		html: emailHtml,
		subject: success ? 'Validação GTFS realizada com sucesso' : 'Validação GTFS com erros',
		to: props.to,
	});
};

export async function sendPlanApprovalRequestEmail(props: SendEmailProps<PlanApprovalRequestEmailProps>) {
	const emailHtml = await RenderPlanApprovalRequestEmail(props.props);
	await emailProvider.send({
		html: emailHtml,
		subject: 'Pedido de aprovação de plano',
		to: props.to,
	});
};

export async function sendNotificationEmail(props: SendEmailProps<NotificationEmailProps>) {
	const emailHtml = await RenderEmailNotificationEmail(props.props);
	await emailProvider.send({
		html: emailHtml,
		subject: 'Nova Notificação',
		to: props.to,
	});
};
