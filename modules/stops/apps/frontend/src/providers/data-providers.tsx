'use client';

import { StopCreateContextProvider } from '@/components/stops/create/StopCreate.context';
import { LocationsContextProvider } from '@/contexts/Locations.context';
import { AgenciesContextProvider, AppProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export function DataProviders({ children }: PropsWithChildren) {
	return (
		<AppProvider>
			<AgenciesContextProvider>
				<LocationsContextProvider>
					<StopCreateContextProvider>
						{children}
					</StopCreateContextProvider>
				</LocationsContextProvider>
			</AgenciesContextProvider>
		</AppProvider>
	);
}
