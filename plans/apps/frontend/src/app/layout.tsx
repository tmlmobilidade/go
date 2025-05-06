/* * */

import '@tmlmobilidade/ui/styles';
import { Routes } from '@/lib/routes';
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
		redirect(`${Routes.AUTH_URL}/login?redirect=${encodeURI(Routes.URL)}`, RedirectType.replace);
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
