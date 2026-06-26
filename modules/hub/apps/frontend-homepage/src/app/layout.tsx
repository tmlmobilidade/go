/* * */

import pjson from '#/package.json';
import { VehiclePositionContextProvider } from '@/contexts/VehiclePosition.context';
import { i18nResourceKeysPt } from '@/i18n/resources';

import '@/styles/homepage.css';
import '@/styles/reset.css';
import { BaseProvider, MapContextProvider, MeContextProvider } from '@tmlmobilidade/ui';
import { Metadata } from 'next';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'GO é a plataforma da TML para gerir operações de transporte público em tempo real.',
	title: 'GO | Plataforma de transporte público',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider i18n={{ pt: i18nResourceKeysPt }} version={pjson.version}>
			<MeContextProvider>
				<MapContextProvider>
					<VehiclePositionContextProvider>
						{children}
					</VehiclePositionContextProvider>
				</MapContextProvider>
			</MeContextProvider>
		</BaseProvider>
	);
}
