'use client';

/* * */

import { AuthenticationForm } from '@/components/common/AuthenticationForm';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Session } from '@tmlmobilidade/types';
import { PasswordInput, TextInput, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useQueryState } from 'nuqs';
import { useState } from 'react';

/* * */

export function LoginForm() {
	//

	//
	// A. Setup variables

	const [isLoading, setIsLoading] = useState(false);

	const [redirectToValue] = useQueryState('redirect', { clearOnDefault: true, defaultValue: '/' });

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
			useToast.error({ message: response.error ?? 'An error occurred', title: 'Login failed' });
			return;
		}
		// Handle successful login
		useToast.success({ message: undefined, title: 'Login successful' });
		// Redirect to the specified page or home
		window.location.href = redirectToValue;
	};

	//
	// C. Render components

	return (
		<AuthenticationForm
			description="Procuramos simplificar a gestão dos transportes públicos com ferramentas digitais estáveis e intuitivas."
			footerLabel="Recuperar password"
			footerUrl={PAGE_ROUTES.auth.RESET_PASSWORD_LIST}
			loading={isLoading}
			onSubmit={handleSubmit}
			submitDisabled={passwordValue.length < 8 || emailValue.length === 0}
			submitLabel="Login"
			title="Login no GO+"
		>
			<TextInput
				key="email"
				disabled={isLoading}
				onChange={e => setEmailValue(e.target.value)}
				placeholder="Email"
				value={emailValue}
			/>
			<PasswordInput
				key="password"
				disabled={isLoading}
				onChange={e => setPasswordValue(e.target.value)}
				placeholder="Password"
				value={passwordValue}
			/>
		</AuthenticationForm>
	);

	//
}
