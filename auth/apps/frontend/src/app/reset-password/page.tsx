/* * */

import { Background4 } from '@/components/login/Background4';
import { ResetPasswordForm } from '@/components/reset-password/ResetPasswordForm';
import { cookies as nextCookies } from 'next/headers';
import { redirect } from 'next/navigation';

import styles from './styles.module.css';

/* * */

interface Props {
	searchParams: Promise<{ redirectTo: string | undefined }>
}

/* * */

export default async function Page({ searchParams }: Props) {
	//

	//
	// A. Setup variables

	const cookies = await nextCookies();
	const session = cookies.get('session_token');
	const { redirectTo } = await searchParams;

	//
	// B. Handle actions

	if (session) {
		// Redirect to the main page
		// if the user is already logged in.
		redirect('/');
	}

	//
	// C. Render components

	return (
		<div className={styles.root}>
			<Background4 />
			<ResetPasswordForm redirect={redirectTo && new URL(redirectTo).toString()} />
		</div>
	);

	//
}
