/* * */

import pjson from '#/package.json';
import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { DatesContextProvider } from '@/contexts/demand/Dates.context';
import { NetworkContextProvider } from '@/contexts/demand/Network.context';
import { HomeContextProvider } from '@/contexts/home/Home.context';
import { LocaleContextProvider } from '@/contexts/Locale.context';
import { ThemeProviders } from '@/providers/theme-providers';
import { AppProvider, AppWrapper, BaseProvider } from '@tmlmobilidade/ui';
import { Metadata } from 'next';
import { type PropsWithChildren } from 'react';

/* * */

export const metadata: Metadata = {
	description: 'Performance Explorer',
	title: 'GO | Performance',
};

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<BaseProvider version={pjson.version}>
			<AppProvider>
				<AppWrapper>
					<ThemeProviders>
						<LocaleContextProvider>
							<NetworkContextProvider>
								<AgenciesContextProvider>
									<DatesContextProvider>
										<HomeContextProvider>
											{children}
										</HomeContextProvider>
									</DatesContextProvider>
								</AgenciesContextProvider>
							</NetworkContextProvider>
						</LocaleContextProvider>
					</ThemeProviders>
				</AppWrapper>
			</AppProvider>
		</BaseProvider>
	);
}
