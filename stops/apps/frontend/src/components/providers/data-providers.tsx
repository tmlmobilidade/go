'use client';

/* * */

import { LocationsContextProvider } from '@/contexts/Locations.context';
import { MapOptionsContextProvider } from '@/contexts/MapOptions.context';
import { StopListContextProvider } from '@/contexts/StopList.context';

/* * */

export function DataProviders({ children }: { children: React.ReactNode }) {
	return (
		<MapOptionsContextProvider>
			<LocationsContextProvider>
				<StopListContextProvider>
					{children}
				</StopListContextProvider>
			</LocationsContextProvider>
		</MapOptionsContextProvider>
	);
}
