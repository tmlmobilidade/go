'use client';

import { initSentry } from '@/lib/sentry';
import { AgenciesContextProvider, LocationsContextProvider } from '@tmlmobilidade/ui';

/* * */

export function DataProviders({ children }: { children: React.ReactNode }) {
	initSentry();
	return (
		<AgenciesContextProvider>
			<LocationsContextProvider>
				{children}
			</LocationsContextProvider>
		</AgenciesContextProvider>
	);
}
