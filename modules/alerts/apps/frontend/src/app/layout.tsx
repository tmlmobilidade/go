/* * */

import pjson from '#/package.json';
import { i18nResourceKeysEs, i18nResourceKeysPt } from '@/i18n/resources';
import { DataProviders } from '@/providers/data-providers';
import { AppProvider, AppWrapper, BaseProvider } from '@tmlmobilidade/ui';
import { type Metadata } from 'next';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Gestor de avisos e alertas ao público.',
	title: 'GO | Alertas',
};

/* * */

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider app={process.env.APP ?? 'frontend'} i18n={{ es: i18nResourceKeysEs, pt: i18nResourceKeysPt }} module={process.env.MODULE ?? 'alerts'} version={pjson.version}>
			<AppProvider>
				<DataProviders>
					<AppWrapper>
						{children}
					</AppWrapper>
				</DataProviders>
			</AppProvider>
		</BaseProvider>
	);
}
