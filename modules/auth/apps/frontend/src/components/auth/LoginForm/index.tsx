'use client';

import { AuthenticationForm } from '@/components/common/AuthenticationForm';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Session } from '@tmlmobilidade/types';
import { PasswordInput, TextInput, useQueryState, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function LoginForm() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [isLoading, setIsLoading] = useState(false);

	const [redirectToValue] = useQueryState('redirect', { clearOnDefault: true, defaultValue: PAGE_ROUTES.auth.HOME_LIST });

	const [emailValue, setEmailValue] = useQueryState('email', { clearOnDefault: true, defaultValue: '' });
	const [passwordValue, setPasswordValue] = useState('');

	//
	// B. Handle actions

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		// Prevent default form submission behavior
		event.preventDefault();
		// Update loading state
		setIsLoading(true);
		// Perform login request
		const response = await fetchData<Session>(
			API_ROUTES.auth.AUTH_LOGIN,
			'POST',
			{ email: emailValue, password: passwordValue },
		);
		// Update loading state
		setIsLoading(false);
		// Handle response error
		if (response.error) {
			useToast.error({ message: response.error ?? t('unauthenticated:LoginForm.error.description'), title: t('unauthenticated:LoginForm.error.title') });
			return;
		}
		// Handle successful login
		useToast.success({ message: t('unauthenticated:LoginForm.success.description'), title: t('unauthenticated:LoginForm.success.title') });
		// Redirect to the specified page or home
		window.location.href = redirectToValue;
	};

	//
	// C. Render components

	return (
		<AuthenticationForm
			description={t('unauthenticated:LoginForm.description')}
			footerLabel={t('unauthenticated:LoginForm.footer.label')}
			footerUrl={PAGE_ROUTES.auth.RESET_PASSWORD_LIST}
			loading={isLoading}
			onSubmit={handleSubmit}
			submitDisabled={passwordValue.length < 8 || emailValue.length === 0}
			submitLabel={t('unauthenticated:LoginForm.submit.label')}
			title={t('unauthenticated:LoginForm.title')}
		>
			<TextInput
				key="email"
				disabled={isLoading}
				onChange={e => setEmailValue(e.target.value)}
				placeholder={t('unauthenticated:LoginForm.fields.email.placeholder')}
				value={emailValue}
			/>
			<PasswordInput
				key="password"
				disabled={isLoading}
				onChange={e => setPasswordValue(e.target.value)}
				placeholder={t('unauthenticated:LoginForm.fields.password.placeholder')}
				value={passwordValue}
			/>
		</AuthenticationForm>
	);

	//
}
