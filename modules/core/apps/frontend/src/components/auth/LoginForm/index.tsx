'use client';

import { AuthenticationForm } from '@/components/auth/AuthenticationForm';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Session } from '@tmlmobilidade/go-types-core';
import { LoginEvent, LoginOpenedEvent, useAnalyticsContext } from '@tmlmobilidade/go-ui-analytics';
import { fetchApiData, PasswordInput, TextInput, useHandleAction, useQueryState, useToast } from '@tmlmobilidade/ui';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function LoginForm() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions: { identify, startReplay, stopReplay, track }, flags: { ready } } = useAnalyticsContext();
	const replayRequested = useSearchParams().get('replay') === 'login';
	const [isCompletingLogin, setIsCompletingLogin] = useState(false);

	const [redirectToValue] = useQueryState('redirect', { clearOnDefault: true, defaultValue: PAGE_ROUTES.core.HOME_LIST });

	const [emailValue, setEmailValue] = useQueryState('email', { clearOnDefault: true, defaultValue: '' });
	const [passwordValue, setPasswordValue] = useState('');

	//
	// B. Handle actions

	const { action: handleLogin, isLoading: isLoggingIn } = useHandleAction({
		fetchFn: async () => await fetchApiData<Session>({ body: { email: emailValue, password: passwordValue }, method: 'POST', url: API_ROUTES.core.AUTH_LOGIN }),
		onError: (error) => {
			useToast.error({
				message: error.message ?? t('unauthenticated:LoginForm.error.description'),
				title: t('unauthenticated:LoginForm.error.title'),
			});
		},
		onSuccess: async (response) => {
			setIsCompletingLogin(true);
			useToast.success({
				message: t('unauthenticated:LoginForm.success.description'),
				title: t('unauthenticated:LoginForm.success.title'),
			});
			let timeout: ReturnType<typeof setTimeout> | undefined;
			try {
				identify({ _id: response.data.user_id, email: emailValue });
				await Promise.race([
					track(LoginEvent.shape.title.value),
					new Promise<void>((resolve) => { timeout = setTimeout(resolve, 1500); }),
				]);
			} finally {
				clearTimeout(timeout);
				stopReplay();
				window.location.href = redirectToValue;
			}
		},
	});

	// Capture only the login flow requested by the landing page's navigation link.
	useEffect(() => {
		if (!replayRequested || !ready) return;
		let active = true;
		void startReplay().then((started) => {
			if (active && started) void track(LoginOpenedEvent.shape.title.value);
		});
		return () => {
			active = false;
			stopReplay();
		};
	}, [ready, replayRequested, startReplay, stopReplay, track]);

	//
	// C. Render components

	return (
		<AuthenticationForm
			description={t('unauthenticated:LoginForm.description')}
			footerLabel={t('unauthenticated:LoginForm.footer.label')}
			footerUrl={PAGE_ROUTES.core.RESET_PASSWORD_LIST}
			loading={isLoggingIn || isCompletingLogin}
			onSubmit={handleLogin}
			submitDisabled={passwordValue.length < 8 || emailValue.length === 0 || isLoggingIn || isCompletingLogin}
			submitLabel={t('unauthenticated:LoginForm.submit.label')}
			title={t('unauthenticated:LoginForm.title')}
		>
			<TextInput
				key="email"
				disabled={isLoggingIn || isCompletingLogin}
				onChange={e => setEmailValue(e.target.value)}
				placeholder={t('unauthenticated:LoginForm.fields.email.placeholder')}
				value={emailValue}
			/>
			<PasswordInput
				key="password"
				disabled={isLoggingIn || isCompletingLogin}
				onChange={e => setPasswordValue(e.target.value)}
				placeholder={t('unauthenticated:LoginForm.fields.password.placeholder')}
				value={passwordValue}
			/>
		</AuthenticationForm>
	);

	//
}
