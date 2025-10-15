/* * */

import '@tmlmobilidade/ui/styles';

/* * */

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
						{children}
					</AppWrapper>
				</AppProvider>
			</NuqsAdapter>
		</BaseProvider>
	);
}
