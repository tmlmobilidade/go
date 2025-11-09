'use client';

/* * */

import { useLogin } from '@/components/login/LoginForm/use-login';
import { IconArrowRight } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, EnvironmentFlag, Label, PasswordInput, Section, Surface, TextInput, TMLogoDark, TMLogoLight, useToast, WhenMode } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import styles from './styles.module.css';

/* * */

interface LoginFormProps {

	/**
	 * The URL to redirect to after successful login.
	 * @default "/"
	 */
	redirect?: string

}

export function LoginForm({ redirect = '/' }: LoginFormProps) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { loading, login } = useLogin();

	const [emailValue, setEmailValue] = useState('');
	const [passwordValue, setPasswordValue] = useState('');

	//
	// B. Handle actions

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const response = await login({ email: emailValue, password: passwordValue });
		if (response.error) {
			useToast.error({ message: response.error ?? 'An error occurred', title: 'Login failed' });
			return;
		}
		useToast.success({ message: undefined, title: 'Login successful' });
		router.replace(redirect);
	};

	const handleReset = () => {
		router.push(PAGE_ROUTES.auth.RESET_PASSWORD_LIST);
	};

	//
	// C. Render components

	return (
		<div className={styles.root}>
			<Surface>
				<Section>

					<div className={styles.header}>
						<div className={styles.headerContent}>
							<Label size="lg">Login no GO+</Label>
							<Label>Procuramos simplificar a gestão dos transportes públicos com ferramentas digitais estáveis e intuitivas.</Label>
							<EnvironmentFlag />
						</div>
						<div className={styles.headerLogo}>
							<WhenMode dark={<TMLogoDark />} light={<TMLogoLight />} />
						</div>
					</div>

					<form className={styles.form} onSubmit={handleSubmit}>
						<TextInput
							disabled={loading}
							onChange={e => setEmailValue(e.target.value)}
							placeholder="Email"
							value={emailValue}
						/>
						<PasswordInput
							disabled={loading}
							onChange={e => setPasswordValue(e.target.value)}
							placeholder="Password"
							value={passwordValue}
						/>
						<div className={styles.formFooter}>
							<span
								className={styles.resetLink}
								onClick={handleReset}
								style={{ cursor: 'pointer' }}
							>
								<Label size="sm" caps>Recuperar password</Label>
							</span>
							<Button
								disabled={passwordValue.length < 8 || emailValue.length === 0}
								icon={<IconArrowRight />}
								label="Login"
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

	//
}
