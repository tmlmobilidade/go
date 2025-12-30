/* * */

import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { DatesContextProvider } from '@/contexts/Dates.context';
import { HomeContextProvider } from '@/contexts/Home.context';
import { NetworkContextProvider } from '@/contexts/Network.context';
import { ThemeProviders } from '@/providers/theme-providers';
import ptTranslations from '@/translations/pt.json';
import { AppProvider, AppWrapper, BaseProvider } from '@tmlmobilidade/ui';
import { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Performance Explorer',
	title: 'GO | Performance',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider>
			<NuqsAdapter>
				<AppProvider i18n={[{ namespace: 'performance', pt: ptTranslations }]}>
					<AppWrapper>
						<ThemeProviders>
							<NetworkContextProvider>
								<AgenciesContextProvider>
									<DatesContextProvider>
										<HomeContextProvider>
											{children}
										</HomeContextProvider>
									</DatesContextProvider>
								</AgenciesContextProvider>
							</NetworkContextProvider>
						</ThemeProviders>
					</AppWrapper>
				</AppProvider>
			</NuqsAdapter>
		</BaseProvider>
	);
}
