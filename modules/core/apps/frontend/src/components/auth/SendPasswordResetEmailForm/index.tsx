'use client';

import { AuthenticationForm } from '@/components/auth/AuthenticationForm';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { AuthSendPasswordResetEmailRequest } from '@tmlmobilidade/go-core-pckg-types';
import { type Session } from '@tmlmobilidade/go-types-core';
import { fetchApiData, Label, Section, Surface, TextInput, useHandleAction, useQueryState, useToast } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function SendPasswordResetEmailForm() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [emailValue, setEmailValue] = useQueryState('email', { clearOnDefault: true, defaultValue: '' });

	const [isFormSubmitted, setIsFormSubmitted] = useState(false);

	//
	// B. Handle actions

	const { action: handleSendResetPasswordEmail, isLoading: isSendingResetPasswordEmail } = useHandleAction({
		fetchFn: async () => await fetchApiData<Session, AuthSendPasswordResetEmailRequest>({
			body: { email: emailValue },
			method: 'POST',
			url: API_ROUTES.core.AUTH_SEND_PASSWORD_RESET_EMAIL,
		}),
		onError: ({ message }) => {
			useToast.error({
				message: message ?? t('unauthenticated:SendPasswordResetEmailForm.error.description'),
				title: t('unauthenticated:SendPasswordResetEmailForm.error.title'),
			});
		},
		onSuccess: async () => {
			// Show the success message
			setIsFormSubmitted(true);
		},
	});

	//
	// C. Render components

	if (isFormSubmitted) {
		return (
			<Surface style={{ maxWidth: 550 }}>
				<Section gap="sm">
					<Label size="lg">{t('unauthenticated:SendPasswordResetEmailForm.success.title')}</Label>
					<Label>{t('unauthenticated:SendPasswordResetEmailForm.success.description')}</Label>
				</Section>
			</Surface>
		);
	}

	return (
		<AuthenticationForm
			description={t('unauthenticated:SendPasswordResetEmailForm.description')}
			footerLabel={t('unauthenticated:SendPasswordResetEmailForm.footer.label')}
			footerUrl={PAGE_ROUTES.core.LOGIN_LIST}
			loading={isSendingResetPasswordEmail}
			onSubmit={handleSendResetPasswordEmail}
			submitDisabled={emailValue.length === 0}
			submitLabel={t('unauthenticated:SendPasswordResetEmailForm.submit.label')}
			title={t('unauthenticated:SendPasswordResetEmailForm.title')}
		>
			<TextInput
				key="email"
				disabled={isSendingResetPasswordEmail}
				onChange={e => setEmailValue(e.target.value)}
				placeholder={t('unauthenticated:SendPasswordResetEmailForm.fields.email.placeholder')}
				value={emailValue}
			/>
		</AuthenticationForm>
	);
}
