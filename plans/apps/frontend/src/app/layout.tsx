/* * */

import '@tmlmobilidade/ui/styles';
import { getAppConfig } from '@tmlmobilidade/lib';
import { AppProvider, AppWrapper } from '@tmlmobilidade/ui';
import { Metadata } from 'next';
import { cookies as nextCookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Plano de Exploração',
	title: 'PLANOS | SAE | TML',
};

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const cookies = await nextCookies();
	const sessionToken = cookies.get('session_token')?.value;

	if (!sessionToken) {
		const authUrl = getAppConfig('auth', 'frontend_url');
		const appUrl = getAppConfig('plans', 'frontend_url');
		redirect(`${authUrl}/login?redirect=${encodeURI(appUrl)}`, RedirectType.replace);
	}

	//
	// B. Render components

	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<AppProvider>
					<AppWrapper>
						{children}
					</AppWrapper>
				</AppProvider>
			</body>
		</html>
	);

	//
}
