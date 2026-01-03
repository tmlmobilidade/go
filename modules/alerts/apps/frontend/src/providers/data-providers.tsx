'use client';

/* * */

import { LinesContextProvider } from '@/contexts/Lines.context';
import { StopsContextProvider } from '@/contexts/Stops.context';
import { AgenciesContextProvider, LocationsContextProvider } from '@tmlmobilidade/ui';

/* * */

export function DataProviders({ children }: { children: React.ReactNode }) {
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
