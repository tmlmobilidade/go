/* * */

import '@tmlmobilidade/ui/styles';

/* * */

import { DataProviders } from '@/components/providers/data-providers';
import { AppProvider, AppWrapper } from '@tmlmobilidade/ui';
import { NuqsAdapter } from 'nuqs/adapters/next';
import { PropsWithChildren } from 'react';

/* * */

export default async function RootLayout({ children }: PropsWithChildren) {
	//

	//
	// C. Render components

	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<DataProviders>
					<NuqsAdapter>
						<AppProvider>
							<AppWrapper>
								{children}
							</AppWrapper>
						</AppProvider>
					</NuqsAdapter>
				</DataProviders>
			</body>
		</html>
	);

	//
}
