/* * */

import { Background4 } from '@/components/login/Background4';
import IntroductionEmail from '@/components/reset-password/SendResetEmailForm';
import { cookies as nextCookies } from 'next/headers';
import { redirect } from 'next/navigation';

import styles from './styles.module.css';

/* * */

export default async function Page() {
	//

	//
	// A. Setup variables

	const cookies = await nextCookies();
	const session = cookies.get('session_token');

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
			<IntroductionEmail />
		</div>
	);

	//
}
