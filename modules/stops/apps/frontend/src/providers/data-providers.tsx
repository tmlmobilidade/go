'use client';

import { StopCreateContextProvider } from '@/components/stops/create/StopCreate.context';
import { AgenciesContextProvider, AppProvider, LocationsContextProvider } from '@tmlmobilidade/ui';
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
