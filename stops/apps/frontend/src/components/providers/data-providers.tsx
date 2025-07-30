'use client';

/* * */

import { LocationsContextProvider } from '@/contexts/Locations.context';
import { StopListContextProvider } from '@/contexts/StopList.context';

/* * */

export function DataProviders({ children }: { children: React.ReactNode }) {
	return (
		<LocationsContextProvider>
			<StopListContextProvider>
				{children}
			</StopListContextProvider>
		</LocationsContextProvider>
	);
}
