'use client';

import { AuthenticationForm } from '@/components/auth/AuthenticationForm';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Session } from '@tmlmobilidade/go-types-core';
import { fetchApiData, PasswordInput, TextInput, useHandleUpdate, useQueryState, useToast } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function LoginForm() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [redirectToValue] = useQueryState('redirect', { clearOnDefault: true, defaultValue: PAGE_ROUTES.core.HOME_LIST });

	const [emailValue, setEmailValue] = useQueryState('email', { clearOnDefault: true, defaultValue: '' });
	const [passwordValue, setPasswordValue] = useState('');

	//
	// B. Handle actions

	const { action: handleLogin, isLoading: isLoggingIn } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Session>({ body: { email: emailValue, password: passwordValue }, method: 'POST', url: API_ROUTES.core.AUTH_LOGIN }),
		onError: (error) => {
			useToast.error({
				message: error.message ?? t('unauthenticated:LoginForm.error.description'),
				title: t('unauthenticated:LoginForm.error.title'),
			});
		},
		onSuccess: () => {
			useToast.success({
				message: t('unauthenticated:LoginForm.success.description'),
				title: t('unauthenticated:LoginForm.success.title'),
			});
			window.location.href = redirectToValue;
		},
	});

	//
	// C. Render components

	return (
		<AuthenticationForm
			description={t('unauthenticated:LoginForm.description')}
			footerLabel={t('unauthenticated:LoginForm.footer.label')}
			footerUrl={PAGE_ROUTES.core.RESET_PASSWORD_LIST}
			loading={isLoggingIn}
			onSubmit={handleLogin}
			submitDisabled={passwordValue.length < 8 || emailValue.length === 0 || isLoggingIn}
			submitLabel={t('unauthenticated:LoginForm.submit.label')}
			title={t('unauthenticated:LoginForm.title')}
		>
			<TextInput
				key="email"
				disabled={isLoggingIn}
				onChange={e => setEmailValue(e.target.value)}
				placeholder={t('unauthenticated:LoginForm.fields.email.placeholder')}
				value={emailValue}
			/>
			<PasswordInput
				key="password"
				disabled={isLoggingIn}
				onChange={e => setPasswordValue(e.target.value)}
				placeholder={t('unauthenticated:LoginForm.fields.password.placeholder')}
				value={passwordValue}
			/>
		</AuthenticationForm>
	);

	//
}
