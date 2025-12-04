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
			useToast.error({ message: response.error ?? 'Ocorreu um erro ao tentar alterar a password', title: 'Erro ao tentar alterar password' });
			return;
		}
		// Show success message and redirect to login page
		useToast.success({ message: 'Password foi alterada com sucesso', title: 'Sucesso' });
		window.location.href = PAGE_ROUTES.auth.LOGIN_LIST;
	};

	//
	// C. Render components

	return (
		<AuthenticationForm
			description="Introduza a sua nova password"
			footerLabel="Voltar ao login"
			footerUrl={PAGE_ROUTES.auth.LOGIN_LIST}
			loading={isLoading}
			onSubmit={handleSubmit}
			submitDisabled={isDisabled}
			submitLabel="Confirmar"
			title="Alterar password"
		>
			<input defaultValue={emailValue} name="email" type="email" readOnly />
			<PasswordInput
				disabled={isLoading}
				onChange={e => setPasswordValue(e.target.value)}
				placeholder="Password"
				value={passwordValue}
			/>
			<PasswordInput
				disabled={isLoading}
				onChange={e => setConfirmPasswordValue(e.target.value)}
				placeholder="Confirm password"
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
