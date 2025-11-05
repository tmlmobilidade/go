'use client';

/* * */

import { LocationsContextProvider } from '@/contexts/Locations.context';
import { StopCreateContextProvider } from '@/contexts/StopCreate.context';
import { AppProvider } from '@go/ui';
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
