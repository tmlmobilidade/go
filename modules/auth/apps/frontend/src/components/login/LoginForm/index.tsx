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

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	//
	// B. Handle actions

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const response = await login({ email: username, password });
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
							onChange={e => setUsername(e.target.value)}
							placeholder="Email"
							value={username}
						/>
						<PasswordInput
							disabled={loading}
							onChange={e => setPassword(e.target.value)}
							placeholder="Password"
							value={password}
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
								disabled={password.length < 8 || username.length === 0}
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
