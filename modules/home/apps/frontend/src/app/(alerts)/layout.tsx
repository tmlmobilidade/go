/* * */

import { AlertsListContextProvider } from '@/contexts/AlertsList.context';
// import { LinesContextProvider } from '@/contexts/Lines.context';
// import { StopsContextProvider } from '@/contexts/Stops.context';
import type { PropsWithChildren } from 'react';

import { Header } from '@/components/common/layout/Header';
import { AgenciesContextProvider } from '@tmlmobilidade/ui';
import { Suspense } from 'react';
/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		// <LinesContextProvider>
		// <StopsContextProvider>
		<AgenciesContextProvider>
			<Suspense fallback={null}>
				<AlertsListContextProvider>
					<Header />
					{children}
				</AlertsListContextProvider>
			</Suspense>
		</AgenciesContextProvider>
		// </StopsContextProvider>
		// </LinesContextProvider>
	);
}
