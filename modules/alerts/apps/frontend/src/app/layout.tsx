/* * */

import pjson from '#/package.json';
import { i18nResourceKeysPt } from '@/i18n/resources';
import { ensureLoggerStartup } from '@/lib/logger-startup';
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

export default async function RootLayout({ children }: PropsWithChildren) {
	ensureLoggerStartup();

	return (
		<BaseProvider i18n={{ pt: i18nResourceKeysPt }} version={pjson.version}>
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
