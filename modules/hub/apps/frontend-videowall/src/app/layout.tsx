/* * */

import pjson from '#/package.json';
import { AppReload } from '@/components/AppReload';
import { i18nResourceKeysPt } from '@/i18n/resources';
import { BaseProvider } from '@tmlmobilidade/ui';
import { type Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { type PropsWithChildren } from 'react';

import '@/styles/reset.css';
import '@/styles/videowall/color.css';

/* * */

export const metadata: Metadata = {
	description: 'Real-time public transit dashboard',
	metadataBase: process.env.VERCEL_URL ? new URL(`https://${process.env.VERCEL_URL}`) : new URL(`http://0.0.0.0:${process.env.PORT || 3000}`),
	title: 'GO Videowall',
};

/* * */

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider i18n={{ pt: i18nResourceKeysPt }} version={pjson.version}>
			<NuqsAdapter>
				<AppReload />
				{children}
			</NuqsAdapter>
		</BaseProvider>
	);
}
