'use client';

/* * */

import { LocationsContextProvider } from '@/contexts/Locations.context';
import { StopCreateContextProvider } from '@/components/stops/create/StopCreate.context';
import { AppProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export function DataProviders({ children }: PropsWithChildren) {
	return (
		<AppProvider>
			<LocationsContextProvider>
				<StopCreateContextProvider>
					{children}
				</StopCreateContextProvider>
			</LocationsContextProvider>
		</AppProvider>
	);
}
