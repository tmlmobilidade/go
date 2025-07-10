'use client';

/* * */

import { usechangePassword } from '@/components/ResetPassword/IntroductionNewPassword/use-changepassword';
import { IconArrowRight } from '@tabler/icons-react';
import { Button, Label, PasswordInput, Section, Surface, Themer, TMLogoDark, TMLogoLight, useToast } from '@tmlmobilidade/ui';
import { useState } from 'react';

import styles from '../styles.module.css';

/* * */

export default function IntroductionNewPassword() {
	//

	//
	// A. Setup variables

	const [loading, changepassword] = usechangePassword();

	const [password, setPassword] = useState('');
	const [confirmpassword, setConfirmPassword] = useState('');

	//
	// B. Handle actions

	const handleSubmit = async () => {
		const response = await changepassword(confirmpassword);

		if (response.status !== 200) {
			useToast.error({
				message: response.error ?? 'An error occurred',
				title: 'failed to sent email',
			});
			return;
		}
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

					<form className={styles.form}>
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
