'use client';

import { AgenciesContextProvider, LocationsContextProvider } from '@tmlmobilidade/ui';

/* * */

export function DataProviders({ children }: { children: React.ReactNode }) {
	return (
		<AgenciesContextProvider>
			<LocationsContextProvider>
				{children}
			</LocationsContextProvider>
		</AgenciesContextProvider>
	);
}
