'use client';

/* * */

import { LocationsContextProvider } from '@/contexts/Locations.context';
import { MapOptionsContextProvider } from '@/contexts/MapOptions.context';
import { StopCreateContextProvider } from '@/contexts/StopCreate.context';
import { StopListContextProvider } from '@/contexts/StopList.context';
import { MeContextProvider, ThemeContextProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export function DataProviders({ children }: PropsWithChildren) {
	return (
		<ThemeContextProvider>
			<MeContextProvider>
				<MapOptionsContextProvider>
					<LocationsContextProvider>
						<StopListContextProvider>
							<StopCreateContextProvider>
								{children}
							</StopCreateContextProvider>
						</StopListContextProvider>
					</LocationsContextProvider>
				</MapOptionsContextProvider>
			</MeContextProvider>
		</ThemeContextProvider>

	);
}
