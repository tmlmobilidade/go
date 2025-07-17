/* * */

import { Background4 } from '@/components/login/Background4';
import { ResetPasswordForm } from '@/components/reset-password/ResetPasswordForm';
import SendResetEmailForm from '@/components/reset-password/SendResetEmailForm';

import styles from './styles.module.css';

/* * */

interface Props {
	searchParams: Promise<{ token: string | undefined }>
}

/* * */

export default async function Page({ searchParams }: Props) {
	//

	const { token } = await searchParams;

	//
	// C. Render components

	return (
		<div className={styles.root}>
			<Background4 />
			{token ? <ResetPasswordForm token={token} /> : <SendResetEmailForm />}
		</div>
	);

	//
}
