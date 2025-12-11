/* * */

import { DataProviders } from '@/providers/DataProviders';
import { AppProvider, AppWrapper } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	return (
		<AppProvider>
			<AppWrapper>
				<DataProviders>
					{children}
				</DataProviders>
			</AppWrapper>
		</AppProvider>
	);
}
