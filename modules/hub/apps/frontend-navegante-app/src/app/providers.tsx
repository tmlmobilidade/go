'use client';

import { AlertsContextProvider } from '@/components/alerts/Alerts.context';
import { LinesContextProvider } from '@/components/lines/Lines.context';
import { UserLocationContextProvider } from '@/components/map/UserLocation.context';
import { StopsContextProvider } from '@/components/stops/Stops.context';
import { VehiclesContextProvider } from '@/components/vehicles/Vehicles.context';
import { AnalyticsContextProvider } from '@/contexts/Analytics.context';
import { TripUpdatesContextProvider } from '@/contexts/TripUpdates.context';
import { MapProvider } from '@vis.gl/react-maplibre';
import { type PropsWithChildren } from 'react';

/* * */

export function Providers({ children }: PropsWithChildren) {
	return (
		<UserLocationContextProvider>
			<MapProvider>
				<AnalyticsContextProvider>
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
				</AnalyticsContextProvider>
			</MapProvider>
		</UserLocationContextProvider>
	);
}
