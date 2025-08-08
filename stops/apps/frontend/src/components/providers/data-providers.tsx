'use client';

/* * */

import { LocationsContextProvider } from '@/contexts/Locations.context';
import { MapOptionsContextProvider } from '@/contexts/MapOptions.context';
import { StopCreateContextProvider } from '@/contexts/StopCreate.context';
import { StopListContextProvider } from '@/contexts/StopList.context';
import { MeContextProvider, ThemeContextProvider } from '@tmlmobilidade/ui';

/* * */

export function DataProviders({ children }: { children: React.ReactNode }) {
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
