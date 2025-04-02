/* * */

import { RidesCatalogContextProvider } from '@/contexts/RidesCatalog.context';
import { NavigationProgress } from '@mantine/nprogress';
import { AppWrapper } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	return (
		<AppWrapper>
			<RidesCatalogContextProvider>
				<NavigationProgress size={5} zIndex={100} />
				{children}
			</RidesCatalogContextProvider>
		</AppWrapper>
	);
}
