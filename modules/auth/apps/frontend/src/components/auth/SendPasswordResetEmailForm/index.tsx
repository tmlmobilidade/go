'use client';

/* * */

import { AuthenticationForm } from '@/components/common/AuthenticationForm';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Session } from '@tmlmobilidade/types';
import { TextInput, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useQueryState } from 'nuqs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function SendPasswordResetEmailForm() {
	//

	//
	// A. Setup variables

	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [emailValue, setEmailValue] = useQueryState('email', { clearOnDefault: true, defaultValue: '' });

	const { t } = useTranslation('global', { keyPrefix: 'SendPasswordResetEmailForm' });

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
			useToast.error({ message: response.error ?? t('errorMessageDescription'), title: t('errorMessageTitle') });
			return;
		}
		// Show success message and redirect to login page
		useToast.success({ message: t('successMessageDescription'), title: t('successMessageTitle') });
		window.location.href = PAGE_ROUTES.auth.LOGIN_LIST;
	};

	//
	// B. Render components

	return (
		<AuthenticationForm
			description={t('description')}
			footerLabel={t('footerLabel')}
			footerUrl={PAGE_ROUTES.auth.LOGIN_LIST}
			loading={isLoading}
			onSubmit={handleSubmit}
			submitDisabled={emailValue.length === 0}
			submitLabel={t('submitLabel')}
			title={t('title')}
		>
			<TextInput
				key="email"
				disabled={isLoading}
				onChange={e => setEmailValue(e.target.value)}
				placeholder={t('emailPlaceholder')}
				value={emailValue}
			/>
		</AuthenticationForm>
	);

	//
}
