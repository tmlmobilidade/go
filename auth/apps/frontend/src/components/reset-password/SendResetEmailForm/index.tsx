'use client';

/* * */

import { useVerifyEmail } from '@/components/reset-password/SendResetEmailForm/use-verify-email';
import { IconArrowRight } from '@tabler/icons-react';
import { Button, Label, Section, Surface, TextInput, Themer, TMLogoDark, TMLogoLight, useToast } from '@tmlmobilidade/ui';
import { useState } from 'react';

import styles from '../styles.module.css';

/* * */

export default function IntroductionEmail() {
	//

	//
	// A. Setup variables

	const { loading, verifyEmail } = useVerifyEmail();

	const [resetEmail, setResetEmail] = useState<string>('');

	//

	//
	// B. handle declare

	const handleSubmit = async () => {
		const response = await verifyEmail(resetEmail);

		if (response.status !== 200) {
			useToast.error({
				message: response.error ?? 'An error occurred',
				title: 'failed to sent email',
			});
			return;
		}
	};

	//

	//
	//  B. Render components

	return (

		<div className={styles.root}>
			<Surface>
				<Section>
					<div className={styles.header}>
						<div className={styles.headerContent}>
							<Label size="lg">Recuperar password</Label>
							<Label>Introduza seu email para recuperar a sua palavra-passe : </Label>
						</div>
						<div className={styles.headerLogo}>
							<Themer dark={<TMLogoDark />} light={<TMLogoLight />} />
						</div>
						<form className={styles.form}>
							<TextInput
								onChange={e => setResetEmail(e.target.value)}
								placeholder="Email de recuperação"
								value={resetEmail}
							/>
							<div className={styles.formFooter}>
								<Button
									disabled={resetEmail.length === 0}
									icon={<IconArrowRight />}
									label="Send email"
									loading={loading}
									onClick={handleSubmit}
									type="submit"
									variant="primary"
								/>
							</div>
						</form>
					</div>
				</Section>
			</Surface>
		</div>
	);
}
