'use client';

import { AgenciesContextProvider, LocationsContextProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export function DataProviders({ children }: PropsWithChildren) {
	return (
		<AgenciesContextProvider>
			<LocationsContextProvider>
				{children}
			</LocationsContextProvider>
		</AgenciesContextProvider>
	);
}
