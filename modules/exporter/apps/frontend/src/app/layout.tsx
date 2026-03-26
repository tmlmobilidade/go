/* * */

import { getAppConfig } from '@tmlmobilidade/consts';
import { AppProvider, BaseProvider } from '@tmlmobilidade/ui';
import { Metadata } from 'next';
import { cookies as nextCookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import pjson from 'package.json';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Gestor de localizações.',
	title: 'GO | Locais',
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
		<BaseProvider version={pjson.version}>
			<AppProvider>
				{children}
			</AppProvider>
		</BaseProvider>
	);

	//
}
