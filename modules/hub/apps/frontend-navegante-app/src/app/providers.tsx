'use client';

import { AlertsContextProvider } from '@/components/alerts/Alerts.context';
import { LinesContextProvider } from '@/components/lines/Lines.context';
import { StopsContextProvider } from '@/components/stops/Stops.context';
import { TripUpdatesContextProvider } from '@/components/trip-updates/trip-updates.context';
import { VehiclesContextProvider } from '@/components/vehicles/Vehicles.context';
import { MapProvider } from '@vis.gl/react-maplibre';
import { type PropsWithChildren } from 'react';

/* * */

export function Providers({ children }: PropsWithChildren) {
	return (
		<MapProvider>
			<AlertsContextProvider>
				<StopsContextProvider>
					<LinesContextProvider>
						<VehiclesContextProvider>
							<TripUpdatesContextProvider>
								{children}
							</TripUpdatesContextProvider>
						</VehiclesContextProvider>
					</LinesContextProvider>
				</StopsContextProvider>
			</AlertsContextProvider>
		</MapProvider>
	);
}
