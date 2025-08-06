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
		<MapOptionsContextProvider>
			<LocationsContextProvider>
				<StopListContextProvider>
					<ThemeContextProvider>
						<MeContextProvider>
							<StopCreateContextProvider>
								{children}
							</StopCreateContextProvider>
						</MeContextProvider>
					</ThemeContextProvider>
				</StopListContextProvider>
			</LocationsContextProvider>
		</MapOptionsContextProvider>

	);
}
