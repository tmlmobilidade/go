/* * */

import pjson from '#/package.json';
import { i18nResourceKeysEs, i18nResourceKeysPt } from '@/i18n/resources';
import { BaseProvider } from '@tmlmobilidade/ui';
import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { type PropsWithChildren } from 'react';

import '@/styles/reset.css';
import '@/styles/color.css';
import '@/styles/font.css';

/* * */

const inter = Inter({
	display: 'swap',
	subsets: ['latin'],
	variable: '--font-inter',
	weight: ['400', '600', '900'],
});

/* * */

export const metadata: Metadata = {
	description: 'Real-time public transit dashboard',
	metadataBase: process.env.VERCEL_URL ? new URL(`https://${process.env.VERCEL_URL}`) : new URL(`http://0.0.0.0:${process.env.PORT || 3000}`),
	title: 'GO Videowall',
};

/* * */

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider
			htmlClassName={inter.variable}
			i18n={{ es: i18nResourceKeysEs, pt: i18nResourceKeysPt }}
			version={pjson.version}
		>
			<NuqsAdapter>
				{children}
			</NuqsAdapter>
		</BaseProvider>
	);
}
