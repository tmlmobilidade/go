/* * */

import { HomeContextProvider } from '@/contexts/Home.context';
import { LinesContextProvider } from '@/contexts/Lines.context';
import { LocaleContextProvider } from '@/contexts/Locale.context';
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
		<BaseProvider>
			<NuqsAdapter>
				<AppProvider>
					<AppWrapper>
						<ThemeProviders>
							<LocaleContextProvider>
								<LinesContextProvider>
									<HomeContextProvider>
										{children}
									</HomeContextProvider>
								</LinesContextProvider>
							</LocaleContextProvider>
						</ThemeProviders>
					</AppWrapper>
				</AppProvider>
			</NuqsAdapter>
		</BaseProvider>
	);
}
