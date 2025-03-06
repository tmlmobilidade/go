'use client';

/* * */

import { LinesContextProvider } from '@/contexts/Lines.context';
import { LocationsContextProvider } from '@/contexts/Locations.context';
import { MeContextProvider } from '@/contexts/Me.context';
import { StopsContextProvider } from '@/contexts/Stops.context';

/* * */

export function DataProviders({ children }: { children: React.ReactNode }) {
	return (
		<MeContextProvider>
			<LocationsContextProvider>
				<StopsContextProvider>
					<LinesContextProvider>
						{children}
					</LinesContextProvider>
				</StopsContextProvider>
			</LocationsContextProvider>
		</MeContextProvider>
	);
}
