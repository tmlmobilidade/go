/* * */

// import { Background1 } from '@/components/Background1';
// import { Background2 } from '@/components/Background2';
// import { Background3 } from '@/components/Background3';
import { Background4 } from '@/components/Background4';
import { LoginForm } from '@/components/LoginForm';
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
			{/* <Background1 /> */}
			{/* <Background2 /> */}
			{/* <Background3 /> */}
			<Background4 />
			<LoginForm redirect={redirectTo && new URL(redirectTo).toString()} />
		</div>
	);

	//
}
