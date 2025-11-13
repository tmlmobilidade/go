'use client';

/* * */

import { useVerifyEmail } from '@/components/reset-password/SendResetEmailForm/use-verify-email';
import { IconArrowRight } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, Label, Section, Surface, TextInput, TMLogoDark, TMLogoLight, useToast, WhenMode } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import styles from '../styles.module.css';

/* * */

export default function IntroductionEmail() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { loading, verifyEmail } = useVerifyEmail();
	const [resetEmail, setResetEmail] = useState<string>('');

	//

	//
	// B. handle declare

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const response = await verifyEmail(resetEmail);

		if (!response.isOk) {
			useToast.error({ message: response.error ?? 'An error occurred', title: 'failed to sent email' });
			return;
		}

		useToast.success({ message: 'Email de recuperação enviado com sucesso', title: 'Sucesso' });

		router.push(PAGE_ROUTES.auth.LOGIN_LIST);
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
							<Label>Introduza seu email para recuperar a sua palavra-passe</Label>
						</div>
						<div className={styles.headerLogo}>
							<WhenMode dark={<TMLogoDark />} light={<TMLogoLight />} />
						</div>
					</div>
					<form className={styles.form} onSubmit={handleSubmit}>
						<TextInput
							disabled={loading}
							onChange={e => setResetEmail(e.target.value)}
							placeholder="Email de recuperação"
							value={resetEmail}
						/>
						<div className={styles.formFooter}>
							<span
								className={styles.resetLink}
								onClick={() => router.push(PAGE_ROUTES.auth.LOGIN_LIST)}
								style={{ cursor: 'pointer' }}
							>
								<Label size="sm" caps>Voltar ao login</Label>
							</span>
							<Button
								disabled={resetEmail.length === 0}
								icon={<IconArrowRight />}
								label="Enviar email"
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
