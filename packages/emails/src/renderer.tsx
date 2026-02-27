/* * */

import { render } from '@react-email/components';
import React from 'react';

/* * */

import { NotificationEmail, NotificationEmailProps } from '@/emails/notification-email.js';
import { PlanApprovalRequestEmail, PlanApprovalRequestEmailProps } from '@/emails/plan-approval-request.js';
import { ResetPasswordEmail, ResetPasswordEmailProps } from '@/emails/reset-password.js';
import { SucessfulGtfsValidationEmail, SucessfulGtfsValidationEmailProps } from '@/emails/sucessful-gtfs-validation.js';
import { UnsuccessfulGtfsValidationEmail, UnsuccessfulGtfsValidationEmailProps } from '@/emails/unsucessful-gtfs-validation.js';
import { WelcomeEmail, WelcomeEmailProps } from '@/emails/welcome.js';

/* * */

export const RenderResetPasswordEmail = async (props: ResetPasswordEmailProps) => {
	return await render(<ResetPasswordEmail {...props} />);
};

export const RenderWelcomeEmail = async (props: WelcomeEmailProps) => {
	return await render(<WelcomeEmail {...props} />);
};

export const RenderSucessfulGtfsValidationEmail = async (props: SucessfulGtfsValidationEmailProps) => {
	return await render(<SucessfulGtfsValidationEmail {...props} />);
};

export const RenderUnsuccessfulGtfsValidationEmail = async (props: UnsuccessfulGtfsValidationEmailProps) => {
	return await render(<UnsuccessfulGtfsValidationEmail {...props} />);
};

export const RenderPlanApprovalRequestEmail = async (props: PlanApprovalRequestEmailProps) => {
	return await render(<PlanApprovalRequestEmail {...props} />);
};

export const RenderEmailNotificationEmail = async (props: NotificationEmailProps) => {
	return await render(<NotificationEmail {...props} />);
};
