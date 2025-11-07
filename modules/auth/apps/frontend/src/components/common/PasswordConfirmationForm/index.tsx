/* * */

import { IconArrowRight, IconCheck, IconX } from '@tabler/icons-react';
import { PasswordRequirementsSchema } from '@tmlmobilidade/types';
import { Button, Label, PasswordInput, Section, Surface, TMLogoLight } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';

import styles from './styles.module.css';

/* * */

interface PasswordValidation {
	message: string
	valid: boolean
}

interface PasswordConfirmationFormProps {
	description: string
	loading: boolean
	onSubmit: (password: string) => Promise<void>
	title: string
}

export function PasswordConfirmationForm({ description, loading, onSubmit, title }: PasswordConfirmationFormProps) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	//
	// B. Transform data

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

	const isDisabled = useMemo(() => {
		return errors.some(error => !error.valid);
	}, [errors]);

	//
	// C. Handle actions

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		await onSubmit(password);
	};

	//
	// D. Render components

	return (
		<div className={styles.root}>
			<Surface>
				<Section>

					<div className={styles.header}>
						<div className={styles.headerContent}>
							<Label size="lg">{title}</Label>
							<Label>{description}</Label>
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
							<span
								className={styles.resetLink}
								onClick={() => router.push(PAGE_ROUTES.auth.LOGIN_LIST)}
								style={{ cursor: 'pointer' }}
							>
								<Label size="sm" caps>Voltar ao login</Label>
							</span>
							<Button
								disabled={isDisabled}
								icon={<IconArrowRight />}
								label="Confirmar"
								loading={loading}
								type="submit"
								variant="primary"
							/>
						</div>
					</form>

				</Section>
			</Surface>
		</div>
	);
}
