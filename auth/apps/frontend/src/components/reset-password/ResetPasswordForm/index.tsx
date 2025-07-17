'use client';

/* * */

import { PasswordConfirmationForm } from '@/components/common/PasswordConfirmationForm';
import { useChangePassword } from '@/components/reset-password/ResetPasswordForm/use-change-password';
import { Routes } from '@/lib/routes';
import { HttpStatus } from '@tmlmobilidade/lib';
import { useToast } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

interface Props {

	/**
	 * The token to reset the password.
	 */
	token: string

}

export function ResetPasswordForm({ token }: Props) {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { changePassword, loading } = useChangePassword();

	//
	// B. Handle actions

	const handleSubmit = async (password: string) => {
		const response = await changePassword(password, token);
		if (response.status !== HttpStatus.OK) {
			useToast.error({
				message: response.error ?? 'Ocorreu um erro ao tentar alterar a password',
				title: 'Erro ao tentar alterar password',
			});
			return;
		}

		useToast.success({
			message: 'Password foi alterada com sucesso',
			title: 'Sucesso',
		});

		router.replace(Routes.LOGIN);
	};

	//
	// C. Render components

	return (
		<PasswordConfirmationForm
			description="Introduza a sua nova password"
			loading={loading}
			onSubmit={handleSubmit}
			title="Alterar password"
		/>
	);

	//
}
