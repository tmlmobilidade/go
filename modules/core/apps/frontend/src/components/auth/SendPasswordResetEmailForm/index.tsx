'use client';

import { AuthenticationForm } from '@/components/auth/AuthenticationForm';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Session } from '@tmlmobilidade/go-types-core';
import { fetchApiData, TextInput, useHandleAction, useQueryState, useToast } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SendPasswordResetEmailForm() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [emailValue, setEmailValue] = useQueryState('email', { clearOnDefault: true, defaultValue: '' });

	//
	// B. Handle actions

	const { action: handleSendResetPasswordEmail, isLoading: isSendingResetPasswordEmail } = useHandleAction({
		fetchFn: async () => await fetchApiData<Session>({ body: { email: emailValue }, method: 'POST', url: API_ROUTES.core.AUTH_SEND_PASSWORD_RESET_EMAIL }),
		onError: ({ message }) => {
			useToast.error({
				message: message ?? t('unauthenticated:SendPasswordResetEmailForm.error.description'),
				title: t('unauthenticated:SendPasswordResetEmailForm.error.title'),
			});
		},
		onSuccess: async () => {
			// Show success message and redirect to login page
			useToast.success({ message: t('unauthenticated:SendPasswordResetEmailForm.success.description'), title: t('unauthenticated:SendPasswordResetEmailForm.success.title') });
			// Wait for a few seconds before redirecting to login page
			await new Promise(resolve => setTimeout(resolve, 3_000));
			window.location.href = PAGE_ROUTES.core.LOGIN_LIST;
		},
	});

	//
	// C. Render components

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
