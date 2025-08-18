'use client';

/* * */

import { LocationsContextProvider } from '@/contexts/Locations.context';
import { MapOptionsContextProvider } from '@/contexts/MapOptions.context';
import { StopCreateContextProvider } from '@/contexts/StopCreate.context';
import { MeContextProvider, ThemeContextProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export function DataProviders({ children }: PropsWithChildren) {
	return (
		<ThemeContextProvider>
			<MeContextProvider>
				<MapOptionsContextProvider>
					<LocationsContextProvider>
						<StopCreateContextProvider>
							{children}
						</StopCreateContextProvider>
					</LocationsContextProvider>
				</MapOptionsContextProvider>
			</MeContextProvider>
		</ThemeContextProvider>
	);
}
