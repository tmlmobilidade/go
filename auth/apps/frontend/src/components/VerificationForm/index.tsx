'use client';

/* * */

import { IconArrowRight, IconCheck, IconX } from '@tabler/icons-react';
import { PasswordRequirementsSchema } from '@tmlmobilidade/types';
import {
	Button,
	Label,
	PasswordInput,
	SimpleSurface,
	TMLogoLight,
	useToast,
} from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import styles from './styles.module.css';
import { useVerify } from './use-verify';

/* * */

interface Props {
	/**
	 * The URL to redirect to after successful login.
	 * @default "/"
	 */
	redirect?: string
}

interface PasswordValidation {
	message: string
	valid: boolean
}

export function VerificationForm({ redirect = '/' }: Props) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { loading, verify } = useVerify();

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const errors: PasswordValidation[] = useMemo(() => {
		const errors: PasswordValidation[] = [];
		const result = PasswordRequirementsSchema.safeParse({ password });
		if (result.error) {
			errors.push(...result.error.issues
				.map(issue => Object.values(JSON.parse(issue.message)))
				.flat() as PasswordValidation[]);
		}

		if (password !== confirmPassword) {
			errors.push({
				message: 'Passwords do not match',
				valid: false,
			});
		}

		return errors;
	}, [password, confirmPassword]);

	//
	// B. Handle actions

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const token = new URLSearchParams(window.location.search).get('token');

		if (!token) {
			router.replace('/');
			return;
		}

		const response = await verify(token, password, confirmPassword);
		if (response.status !== 200) {
			useToast.error({
				message: response.error ?? 'An error occurred',
				title: 'Login failed',
			});
			return;
		}

		useToast.success({
			message: undefined,
			title: 'Login successful',
		});

		router.replace(redirect);
	};

	//
	// C. Render components

	return (
		<div className={styles.root}>
			<SimpleSurface padding="md">
				<div className={styles.header}>
					<div className={styles.headerContent}>
						<Label size="lg">Welcome to TML</Label>
						<Label>Vamos começar a trabalhar juntos!</Label>
					</div>
					<div className={styles.headerLogo}>
						<TMLogoLight />
					</div>
				</div>

				<form className={styles.form} onSubmit={handleSubmit}>
					<PasswordInput
						disabled={loading}
						onChange={e => setPassword(e.target.value)}
						placeholder="Password"
						value={password}
					/>
					<PasswordInput
						disabled={loading}
						onChange={e => setConfirmPassword(e.target.value)}
						placeholder="Confirm password"
						value={confirmPassword}
					/>
					<div className={styles.passwordRequirements}>
						{errors.map((error, index) => (
							<div key={index} className={styles.passwordRequirementValue} data-valid={error.valid}>
								{error.valid ? <IconCheck /> : <IconX />}
								{error.message}
							</div>
						))}
					</div>
					<div className={styles.formFooter}>
						<Button
							icon={<IconArrowRight />}
							label="Submit"
							loading={loading}
							type="submit"
							variant="primary"
							disabled={
								password.length === 0
								|| confirmPassword.length === 0
								|| password !== confirmPassword
							}
						/>
					</div>
				</form>
			</SimpleSurface>
		</div>
	);

	//
}
