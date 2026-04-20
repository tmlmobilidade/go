'use client';

/* * */

import { LinesContextProvider } from '@/features/alerts-public/contexts/Lines.context';
import { StopsContextProvider } from '@/features/alerts-public/contexts/Stops.context';
import { AgenciesContextProvider, LocationsContextProvider } from '@tmlmobilidade/ui';

/* * */

export function AlertsPublicDataProviders({ children }: { children: React.ReactNode }) {
	return (
		<AgenciesContextProvider>
			<LocationsContextProvider>
				<StopsContextProvider>
					<LinesContextProvider>
						{children}
					</LinesContextProvider>
				</StopsContextProvider>
			</LocationsContextProvider>
		</AgenciesContextProvider>
	);
}
