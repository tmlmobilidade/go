/* * */

import '@tmlmobilidade/ui/styles';

/* * */

import { DataProviders } from '@/providers/data-providers';
import { AppProvider, AppWrapper } from '@tmlmobilidade/ui';
import { NuqsAdapter } from 'nuqs/adapters/next';
import { PropsWithChildren } from 'react';

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<AppProvider>
					<NuqsAdapter>
						<DataProviders>
							<AppWrapper>
								{children}
							</AppWrapper>
						</DataProviders>
					</NuqsAdapter>
				</AppProvider>
			</body>
		</html>
	);
}
