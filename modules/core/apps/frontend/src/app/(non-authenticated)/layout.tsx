/* * */

import { AuthenticatedRedirect } from '@/components/auth/AuthenticatedRedirect';
import { NonAuthenticatedWrapper } from '@/components/background/NonAuthenticatedWrapper';
import { cookies } from 'next/headers';
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
		return <AuthenticatedRedirect />;
	}

	//
	// C. Render components

	return (
		<NonAuthenticatedWrapper>
			{children}
		</NonAuthenticatedWrapper>
	);
}
