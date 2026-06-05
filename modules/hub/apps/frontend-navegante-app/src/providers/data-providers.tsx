'use client';

import { AlertsContextProvider } from '@/components/alerts/Alerts.context';
import { LinesContextProvider } from '@/components/lines/Lines.context';
import { StopsContextProvider } from '@/components/stops/Stops.context';
import { VehiclesContextProvider } from '@/components/vehicles/Vehicles.context';
import { type PropsWithChildren } from 'react';

/* * */

export function DataProviders({ children }: PropsWithChildren) {
	return (
		<AlertsContextProvider>
			<StopsContextProvider>
				<LinesContextProvider>
					<VehiclesContextProvider>
						{children}
					</VehiclesContextProvider>
				</LinesContextProvider>
			</StopsContextProvider>
		</AlertsContextProvider>
	);
}
