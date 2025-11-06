/* * */

// import { Background1 } from '@/components/Background1';
// import { Background2 } from '@/components/Background2';
// import { Background3 } from '@/components/Background3';
import { Background4 } from '@/components/login/Background4';
import { VerificationForm } from '@/components/login/VerificationForm';
import { Routes } from '@/lib/routes';
import { cookies as nextCookies } from 'next/headers';
import { redirect } from 'next/navigation';

import styles from './styles.module.css';

/* * */

interface Props {
	searchParams: Promise<{ token: string | undefined }>
}

/* * */

export default async function Page({ searchParams }: Props) {
	//

	//
	// A. Setup variables

	const cookies = await nextCookies();
	const session = cookies.get('session_token');
	const { token } = await searchParams;

	//
	// B. Handle actions

	if (session) {
		// Redirect to the main page
		// if the user is already logged in.
		redirect('/auth/home');
	}

	if (!token) {
		// Redirect to the login page
		redirect(Routes.LOGIN);
	}

	//
	// C. Render components

	return (
		<div className={styles.root}>
			<Background4 />
			<VerificationForm
				token={token}
			/>
		</div>
	);

	//
}
