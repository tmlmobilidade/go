/* * */

import { NonAuthenticatedWrapper } from '@/components/background/NonAuthenticatedWrapper';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const sessionCookies = await cookies();
	const sessionToken = sessionCookies.get('session_token');

	//
	// B. Handle actions

	if (sessionToken) {
		// Redirect to the main page
		// if the user is already logged in.
		redirect(PAGE_ROUTES.auth.HOME_LIST);
	}

	//
	// C. Render components

	return (
		<NonAuthenticatedWrapper>
			{children}
		</NonAuthenticatedWrapper>
	);

	//
}
