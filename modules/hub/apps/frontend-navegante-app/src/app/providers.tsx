'use client';

import { AlertsContextProvider } from '@/components/alerts/Alerts.context';
import { AnalyticsContextProvider } from '@/components/common/Analytics.context';
import { EtaContextProvider } from '@/components/eta/Eta.context';
import { LinesContextProvider } from '@/components/lines/Lines.context';
import { StopsContextProvider } from '@/components/stops/Stops.context';
import { VehiclesContextProvider } from '@/components/vehicles/Vehicles.context';
import { MapProvider } from '@vis.gl/react-maplibre';
import { type PropsWithChildren } from 'react';

/* * */

export function Providers({ children }: PropsWithChildren) {
	return (
		<MapProvider>
			<AnalyticsContextProvider>
				<AlertsContextProvider>
					<StopsContextProvider>
						<LinesContextProvider>
							<VehiclesContextProvider>
								<EtaContextProvider>
									{children}
								</EtaContextProvider>
							</VehiclesContextProvider>
						</LinesContextProvider>
					</StopsContextProvider>
				</AlertsContextProvider>
			</AnalyticsContextProvider>
		</MapProvider>
	);
}
