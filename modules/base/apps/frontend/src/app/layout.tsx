/* * */

import pjson from '#/package.json';
import { ThemeContextProvider } from '@/contexts/Theme.context';
import { VehiclePositionContextProvider } from '@/contexts/VehiclePosition.context';
import { i18nResourceKeysPt } from '@/i18n/resources';
import { BaseProvider } from '@tmlmobilidade/ui';
import { Metadata } from 'next';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Base',
	title: 'GO | Base',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider i18n={{ pt: i18nResourceKeysPt }} version={pjson.version}>
			<ThemeContextProvider>
				<VehiclePositionContextProvider>
					{children}
				</VehiclePositionContextProvider>
			</ThemeContextProvider>
		</BaseProvider>
	);
}
