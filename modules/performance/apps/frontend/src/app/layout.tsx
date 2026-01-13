/* * */

import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { DatesContextProvider } from '@/contexts/Dates.context';
import { HomeContextProvider } from '@/contexts/Home.context';
import { NetworkContextProvider } from '@/contexts/Network.context';
import { i18nNamespaces } from '@/i18n/resources';
import { ThemeProviders } from '@/providers/theme-providers';
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
		<BaseProvider i18n={i18nNamespaces}>
			<NuqsAdapter>
				<AppProvider>
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
