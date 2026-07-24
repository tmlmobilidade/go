/* * */

import pjson from '#/package.json';
import { MapOptionsContextProvider } from '@/components/map/MapOptions.context';
import { getModuleConfig } from '@tmlmobilidade/consts';
import { BaseProvider, LayoutContextProvider } from '@tmlmobilidade/ui';
import { Metadata } from 'next';
import { cookies as nextCookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
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
		const authUrl = getModuleConfig('auth', 'frontend_url');
		const appUrl = getModuleConfig('plans', 'frontend_url');
		redirect(`${authUrl}/login?redirect=${encodeURI(appUrl)}`, RedirectType.replace);
	}

	//
	// B. Render components

	return (
		<BaseProvider app={process.env.APP ?? 'frontend'} module={process.env.MODULE ?? 'locations'} version={pjson.version}>
			<LayoutContextProvider>
				<MapOptionsContextProvider>
					{children}
				</MapOptionsContextProvider>
			</LayoutContextProvider>
		</BaseProvider>
	);

	//
}
