/* * */

import '@tmlmobilidade/ui/styles';

/* * */

import { DataProviders } from '@/components/providers/data-providers';
import { getAppConfig } from '@tmlmobilidade/lib';
import { AppProvider, AppWrapper } from '@tmlmobilidade/ui';
import { cookies as nextCookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import { type PropsWithChildren } from 'react';

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const cookies = await nextCookies();
	const sessionToken = cookies.get('session_token')?.value;

	//
	// B. Handle actions

	if (!sessionToken) {
		const authUrl = getAppConfig('auth', 'frontend_url');
		const appUrl = getAppConfig('alerts', 'frontend_url');
		redirect(`${authUrl}/login?redirect=${encodeURI(appUrl)}`, RedirectType.replace);
	}

	//
	// C. Render components

	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<AppProvider>
					<DataProviders>
						<AppWrapper>
							{children}
						</AppWrapper>
					</DataProviders>
				</AppProvider>
			</body>
		</html>
	);

	//
}
