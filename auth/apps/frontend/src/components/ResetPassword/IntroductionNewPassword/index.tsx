'use client';

/* * */

import { useChangePassword } from '@/components/ResetPassword/IntroductionNewPassword/use-changepassword';
import { IconArrowRight } from '@tabler/icons-react';
import { Button, Label, PasswordInput, Section, Surface, Themer, TMLogoDark, TMLogoLight, useToast } from '@tmlmobilidade/ui';
import bcrypt from 'bcryptjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import styles from '../styles.module.css';

/* * */

interface Props {

	/**
	 * The URL to redirect to after successful login.
	 * @default "/"
	 */
	redirect?: string

}

export default function IntroductionNewPassword({ redirect = '/' }: Props) {
	//

	//
	// A. Setup variables

	const { changePassword, loading } = useChangePassword();

	const [password, setPassword] = useState<string>('');
	const [confirmpassword, setConfirmPassword] = useState<string>('');

	const router = useRouter();

	//
	// B. Handle actions

	const handleSubmit = async () => {
		const password_hash = bcrypt.hashSync(confirmpassword);
		const token = new URLSearchParams(window.location.search).get('token');

		if (!token) {
			useToast.error({
				message: 'Falta o token',
				title: 'Token em falta',
			});
			return;
		}

		const response = await changePassword(password_hash, token);

		if (response.status !== 200) {
			useToast.error({
				message: response.error ?? 'An error occurred',
				title: 'failed to sent email',
			});
			return;
		}

		router.replace(redirect);
	};

	//
	// C. Render components

	return (
		<div className={styles.root}>
			<Surface>
				<Section>

					<div className={styles.header}>
						<div className={styles.headerContent}>
							<Label size="lg">Change Password</Label>
							<Label>Altere a sua palavra-passe</Label>
						</div>
						<div className={styles.headerLogo}>
							<Themer dark={<TMLogoDark />} light={<TMLogoLight />} />
						</div>
					</div>

					<form className={styles.form} onSubmit={handleSubmit}>
						<PasswordInput
							onChange={e => setPassword(e.target.value)}
							placeholder="Password"
							value={password}
						/>
						<PasswordInput
							autoComplete="new-password"
							disabled={password.length < 8}
							onChange={e => setConfirmPassword(e.target.value)}
							placeholder="Confirm Password"
							value={confirmpassword}
						/>
						<Button
							disabled={password !== confirmpassword}
							icon={<IconArrowRight />}
							label="change"
							loading={loading}
							onClick={handleSubmit}
							type="submit"
							variant="primary"
						/>

					</form>

				</Section>
			</Surface>
		</div>
	);

	//
}
