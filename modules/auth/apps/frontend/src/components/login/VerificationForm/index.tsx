'use client';

/* * */

import { PasswordConfirmationForm } from '@/components/common/PasswordConfirmationForm';
import { Routes } from '@/lib/routes';
import { useToast } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import { useVerify } from './use-verify';

/* * */

interface Props {
	/**
	 * The token to verify.
	 */
	token: string
}

export function VerificationForm({ token }: Props) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { loading, verify } = useVerify();

	//
	// B. Handle actions

	const handleSubmit = async (password: string) => {
		const response = await verify(token, password);
		if (!response.isOk) {
			useToast.error({ message: response.error ?? 'An error occurred', title: 'Login failed' });
			return;
		}

		useToast.success({ message: undefined, title: 'Login successful' });

		router.replace(Routes.LOGIN);
	};

	//
	// C. Render components

	return (
		<PasswordConfirmationForm
			description="Introduza a sua password para verificar a sua conta"
			loading={loading}
			onSubmit={handleSubmit}
			title="Bem-vindo ao GO+"
		/>
	);

	//
}
