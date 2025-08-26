'use client';

/* * */

import { LocationsContextProvider } from '@/contexts/Locations.context';
import { StopCreateContextProvider } from '@/contexts/StopCreate.context';
import { MapContextProvider, MeContextProvider, ThemeContextProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export function DataProviders({ children }: PropsWithChildren) {
	return (
		<ThemeContextProvider>
			<MeContextProvider>
				<MapContextProvider>
					<LocationsContextProvider>
						<StopCreateContextProvider>
							{children}
						</StopCreateContextProvider>
					</LocationsContextProvider>
				</MapContextProvider>
			</MeContextProvider>
		</ThemeContextProvider>
	);
}
