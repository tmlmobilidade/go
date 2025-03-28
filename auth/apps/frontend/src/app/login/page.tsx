/* * */

// import { Background1 } from '@/components/Background1';
import { Background2 } from '@/components/Background2';
// import { Background3 } from '@/components/Background3';
import { LoginForm } from '@/components/LoginForm';
import { cookies as nextCookies } from 'next/headers';
import { redirect } from 'next/navigation';

import styles from './styles.module.css';

/* * */

export default async function Page(props: { searchParams: Promise<{ redirect: string | undefined }> }) {
	//

	//
	// A. Setup variables

	const cookies = await nextCookies();
	const session = cookies.get('session_token');
	const searchParams = await props.searchParams;

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
			<Background2 />
			{/* <Background3 /> */}
			<LoginForm
				redirect={
					searchParams.redirect
					&& new URL(searchParams.redirect).toString()
				}
			/>
		</div>
	);

	//
}
