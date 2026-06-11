/* * */

import pjson from '#/package.json';
import { i18nResourceKeysPt } from '@/i18n/resources';
import { DataProviders } from '@/providers/data-providers';
import { AppProvider, AppWrapper, BaseProvider } from '@tmlmobilidade/ui';
import { type Metadata } from 'next';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Monitorização de circulações em tempo real.',
	title: 'GO | Monitorização',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider i18n={{ pt: i18nResourceKeysPt }} module="controller" version={pjson.version}>
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
