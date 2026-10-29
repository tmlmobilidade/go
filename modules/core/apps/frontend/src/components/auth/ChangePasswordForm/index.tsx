'use client';

import { AuthenticationForm } from '@/components/auth/AuthenticationForm';
import { IconCheck, IconX } from '@tabler/icons-react';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PasswordRequirementsSchema, type Session } from '@tmlmobilidade/go-types-core';
import { fetchApiData, PasswordInput, useHandleAction, useQueryState } from '@tmlmobilidade/ui';
import { useToast } from '@tmlmobilidade/ui';
import bcrypt from 'bcryptjs';
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

	const { t } = useTranslation();

	const [tokenValue] = useQueryState('token');
	const [emailValue] = useQueryState('email');

	const [passwordValue, setPasswordValue] = useState('');
	const [confirmPasswordValue, setConfirmPasswordValue] = useState('');

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

	//
	// C. Handle actions

	const { action: handleChangePassword, isLoading: isChangingPassword } = useHandleAction({
		fetchFn: async () => await fetchApiData<Session>({ body: { password_hash: bcrypt.hashSync(passwordValue), token: tokenValue }, method: 'POST', url: API_ROUTES.core.AUTH_CHANGE_PASSWORD }),
		onError: ({ message }) => {
			useToast.error({
				message: message ?? t('unauthenticated:ChangePasswordForm.error_message.description'),
				title: t('unauthenticated:ChangePasswordForm.error_message.title'),
			});
		},
		onSuccess: async () => {
			// Show success message and redirect to login page
			useToast.success({ message: t('unauthenticated:ChangePasswordForm.success.description'), title: t('unauthenticated:ChangePasswordForm.success.title') });
			// Wait for a few seconds before redirecting to login page
			await new Promise(resolve => setTimeout(resolve, 3_000));
			window.location.href = PAGE_ROUTES.core.LOGIN_LIST;
		},
	});

	//
	// D. Render components

	return (
		<AuthenticationForm
			description={t('unauthenticated:ChangePasswordForm.description')}
			footerLabel={t('unauthenticated:ChangePasswordForm.footer.label')}
			footerUrl={PAGE_ROUTES.core.LOGIN_LIST}
			loading={isChangingPassword}
			onSubmit={handleChangePassword}
			submitDisabled={isDisabled}
			submitLabel={t('unauthenticated:ChangePasswordForm.submit.label')}
			title={t('unauthenticated:ChangePasswordForm.title')}
		>
			<input defaultValue={emailValue} name="email" type="email" readOnly />
			<PasswordInput
				key="password"
				disabled={isChangingPassword}
				onChange={e => setPasswordValue(e.target.value)}
				placeholder={t('unauthenticated:ChangePasswordForm.fields.password.placeholder')}
				value={passwordValue}
			/>
			<PasswordInput
				key="password-confirm"
				disabled={isChangingPassword}
				onChange={e => setConfirmPasswordValue(e.target.value)}
				placeholder={t('unauthenticated:ChangePasswordForm.fields.confirm_password.placeholder')}
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
}
