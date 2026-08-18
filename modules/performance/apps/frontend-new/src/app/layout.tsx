/* * */

import pjson from '#/package.json';
import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { PerformanceFiltersContextProvider } from '@/contexts/PerformanceFilters.context';
import { i18nResourceKeysEs, i18nResourceKeysPt } from '@/i18n/resources';
import { AppProvider, AppWrapper, BaseProvider } from '@tmlmobilidade/ui';
import { type Metadata } from 'next';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Análise de desempenho da rede de transportes.',
	title: 'GO | Performance',
};

/* * */

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider i18n={{ es: i18nResourceKeysEs, pt: i18nResourceKeysPt }} version={pjson.version}>
			<AppProvider notificationsEnabled={false}>
				<AppWrapper>
					<AgenciesContextProvider>
						<PerformanceFiltersContextProvider>
							{children}
						</PerformanceFiltersContextProvider>
					</AgenciesContextProvider>
				</AppWrapper>
			</AppProvider>
		</BaseProvider>
	);
}
