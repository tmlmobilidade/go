/* * */

import { AuthenticatedRedirect } from '@/components/auth/AuthenticatedRedirect';
import { LoginForm } from '@/components/auth/LoginForm';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { cookies } from 'next/headers';

/* * */

export default async function Page() {
	//

	//
	// A. Setup variables

	const sessionToken = (await cookies()).get('session_token')?.value;

	if (sessionToken) {
		try {
			const response = await fetch(API_ROUTES.core.ME_LIST, {
				cache: 'no-store',
				headers: { Cookie: `session_token=${encodeURIComponent(sessionToken)}` },
				signal: AbortSignal.timeout(5_000),
			});
			if (response.ok) {
				const result = await response.json();
				if (result.data && !result.error) return <AuthenticatedRedirect />;
			}
		} catch {
			// A failed session check must not prevent a fresh login.
		}
	}

	return <LoginForm />;
}
