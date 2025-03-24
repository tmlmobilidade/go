'use client';

/* * */

import { useLogin } from '@/components/LoginForm/use-login';
import { IconArrowRight } from '@tabler/icons-react';
import { createEmail } from '@tmlmobilidade/core-types';
import { Button, Label, PasswordInput, SimpleSurface, TextInput, TMLogoLight, useToast } from '@tmlmobilidade/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import styles from './styles.module.css';

/* * */

interface Props {

	/**
	 * The URL to be used for the login request.
	 */
	authUrl: string

	/**
	 * The URL to redirect to after successful login.
	 * @default "/"
	 */
	redirect?: string

}

export function LoginForm({ authUrl, redirect = '/' }: Props) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { loading, login } = useLogin(authUrl);

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	//
	// B. Handle actions

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const response = await login({
			email: createEmail(username),
			password,
		});

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

		console.log('redirect', redirect);

		router.replace(redirect);
	};

	//
	// C. Render components

	return (
		<div className={styles.root}>
			<SimpleSurface padding="md">

				<div className={styles.header}>
					<div className={styles.headerContent}>
						<Label size="lg">Welcome back</Label>
						<Label>Trabalhamos todos os dias para o bom funcionamento deste programa.</Label>
					</div>
					<div className={styles.headerLogo}>
						<TMLogoLight />
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
						<Link href="/reset">
							<Label size="sm" caps>Recuperar password</Label>
						</Link>
						<Button
							disabled={password.length === 0 || username.length === 0}
							icon={<IconArrowRight />}
							label="Login"
							loading={loading}
							type="submit"
							variant="primary"
						/>
					</div>
				</form>

			</SimpleSurface>
		</div>
	);

	//
}
