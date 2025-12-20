'use client';

/* * */

import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { LinesContextProvider } from '@/contexts/Lines.context';
import { LocationsContextProvider } from '@/contexts/Locations.context';
import { StopsContextProvider } from '@/contexts/Stops.context';

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
