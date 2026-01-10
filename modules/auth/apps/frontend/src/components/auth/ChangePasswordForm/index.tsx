'use client';

/* * */

import { AuthenticationForm } from '@/components/common/AuthenticationForm';
import { IconCheck, IconX } from '@tabler/icons-react';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PasswordRequirementsSchema } from '@tmlmobilidade/types';
import { Session } from '@tmlmobilidade/types';
import { PasswordInput } from '@tmlmobilidade/ui';
import { useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import bcrypt from 'bcryptjs';
import { useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface PasswordValidation {
	message: string
	valid: boolean
}

/* * */

export function ChangePasswordForm() {
	//

	//
	// A. Setup variables

	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [tokenValue] = useQueryState('token');
	const [emailValue] = useQueryState('email');

	const [passwordValue, setPasswordValue] = useState('');
	const [confirmPasswordValue, setConfirmPasswordValue] = useState('');

	const { i18n, t } = useTranslation('authenticationForm');
	//
	// B. Transform data

	const validationErrors: PasswordValidation[] = useMemo(() => {
		const errors: PasswordValidation[] = [];
		const result = PasswordRequirementsSchema.safeParse({ password: passwordValue });
		if (result.error) {
			errors.push(...result.error.issues
				.map(issue => Object.values(JSON.parse(issue.message)))
				.flat() as PasswordValidation[]);
		}
		if (passwordValue !== confirmPasswordValue) {
			errors.push({
				message: 'Passwords do not match',
				valid: false,
			});
		}

		return errors;
	}, [passwordValue, confirmPasswordValue]);

	const isDisabled = useMemo(() => {
		return validationErrors.some(error => !error.valid);
	}, [validationErrors]);

	console.log(i18n.options.resources);

	//
	// B. Handle actions

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		// Prevent default form submission behavior
		event.preventDefault();
		// Update loading state
		setIsLoading(true);
		// Hash the password before sending it to the server
		const passwordHash = bcrypt.hashSync(passwordValue);
		// Send the request to change the password
		const response = await fetchData<Session>(
			API_ROUTES.auth.AUTH_CHANGE_PASSWORD,
			'POST',
			{ password_hash: passwordHash, token: tokenValue },
		);
		// Update loading state
		setIsLoading(false);
		// Handle response error
		if (!response.isOk) {
			useToast.error({ message: response.error ?? t('ChangePasswordForm.error_message.description'), title: t('authentication.ChangePasswordForm.error_message.title') });
			return;
		}
		// Show success message and redirect to login page
		useToast.success({ message: t('ChangePasswordForm.success.description'), title: t('ChangePasswordForm.success.title') });
		window.location.href = PAGE_ROUTES.auth.LOGIN_LIST;
	};

	//
	// C. Render components

	return (
		<AuthenticationForm
			description={t('ChangePasswordForm.description')}
			footerLabel={t('ChangePasswordForm.footer.label')}
			footerUrl={PAGE_ROUTES.auth.LOGIN_LIST}
			loading={isLoading}
			onSubmit={handleSubmit}
			submitDisabled={isDisabled}
			submitLabel={t('ChangePasswordForm.submit.label')}
			title={t('ChangePasswordForm.title')}
		>
			<input defaultValue={emailValue} name="email" type="email" readOnly />
			<PasswordInput
				key="password"
				disabled={isLoading}
				onChange={e => setPasswordValue(e.target.value)}
				placeholder={t('ChangePasswordForm.fields.password.placeholder')}
				value={passwordValue}
			/>
			<PasswordInput
				key="password-confirm"
				disabled={isLoading}
				onChange={e => setConfirmPasswordValue(e.target.value)}
				placeholder={t('ChangePasswordForm.fields.confirm_password.placeholder')}
				value={confirmPasswordValue}
			/>
			<div className={styles.passwordRequirements}>
				{validationErrors.map((error, index) => (
					<div key={index} className={styles.passwordRequirementValue} data-valid={error.valid}>
						{error.valid ? <IconCheck /> : <IconX />}
						{error.message}
					</div>
				))}
			</div>
		</AuthenticationForm>
	);

	//
}
