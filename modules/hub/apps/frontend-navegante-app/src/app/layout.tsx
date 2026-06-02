/* * */

import pjson from '#/package.json';
import { MapContextProvider } from '@/components/map/Map.context';
import { i18nResourceKeysPt } from '@/i18n/resources';
import { DataProviders } from '@/providers/data-providers';
import { BaseProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

import '@/styles/reset.css';
import '@/styles/navegante/font.css';
import '@/styles/navegante/color.css';

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider i18n={{ pt: i18nResourceKeysPt }} version={pjson.version}>
			<DataProviders>
				<MapContextProvider>
					{children}
				</MapContextProvider>
			</DataProviders>
		</BaseProvider>
	);
}
