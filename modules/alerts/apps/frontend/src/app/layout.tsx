/* * */

import { i18nResourceKeysPt } from '@/i18n/resources';
import { DataProviders } from '@/providers/data-providers';
import { BaseProvider } from '@tmlmobilidade/ui';
import { type Metadata } from 'next';
import pjson from 'package.json';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Gestor de avisos e alertas ao público.',
	title: 'GO | Alertas',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider i18n={{ pt: i18nResourceKeysPt }} version={pjson.version}>
			<DataProviders>
				{children}
			</DataProviders>
		</BaseProvider>
	);
}
