'use client';

import { LocationsContextProvider } from '@tmlmobilidade/ui';

/* * */

export function DataProviders({ children }: { children: React.ReactNode }) {
	return (
		<LocationsContextProvider>
			{children}
		</LocationsContextProvider>
	);
}
