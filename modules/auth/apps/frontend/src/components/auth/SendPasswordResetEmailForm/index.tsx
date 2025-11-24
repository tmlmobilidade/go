'use client';

/* * */

import { AuthenticationForm } from '@/components/common/AuthenticationForm';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Session } from '@tmlmobilidade/types';
import { TextInput, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { useState } from 'react';

/* * */

export function SendPasswordResetEmailForm() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [emailValue, setEmailValue] = useQueryState('email', { clearOnDefault: true, defaultValue: '' });

	//
	// B. Handle actions

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		// Prevent default form submission behavior
		event.preventDefault();
		// Update loading state
		setIsLoading(true);
		// Perform password reset email request
		const response = await fetchData<Session>(
			API_ROUTES.auth.AUTH_SEND_PASSWORD_RESET_EMAIL,
			'POST',
			{ email: emailValue },
		);
		// Update loading state
		setIsLoading(false);
		// Handle response error
		if (!response.isOk) {
			useToast.error({ message: response.error ?? 'An error occurred', title: 'failed to sent email' });
			return;
		}
		// Show success message and redirect to login page
		useToast.success({ message: 'Email de recuperação enviado com sucesso', title: 'Sucesso' });
		router.push(PAGE_ROUTES.auth.LOGIN_LIST);
	};

	//
	// B. Render components

	return (
		<AuthenticationForm
			description="Introduza seu email para recuperar a sua palavra-passe"
			footerLabel="Voltar ao login"
			footerUrl={PAGE_ROUTES.auth.LOGIN_LIST}
			loading={isLoading}
			onSubmit={handleSubmit}
			submitDisabled={emailValue.length === 0}
			submitLabel="Enviar email"
			title="Recuperar password"
		>
			<TextInput
				disabled={isLoading}
				onChange={e => setEmailValue(e.target.value)}
				placeholder="Email de recuperação"
				value={emailValue}
			/>
		</AuthenticationForm>
	);

	//
}
