'use client';

import { AnalyticsContextProvider } from '@/contexts/Analytics.context';
import { UserLocationContextProvider } from '@/contexts/UserLocation.context';
import { MapProvider } from '@vis.gl/react-maplibre';
import { type PropsWithChildren } from 'react';
import { OverlayProvider } from 'react-aria';

/* * */

export function Providers({ children }: PropsWithChildren) {
	return (
		<OverlayProvider>
			<UserLocationContextProvider>
				<MapProvider>
					<AnalyticsContextProvider>
						{children}
					</AnalyticsContextProvider>
				</MapProvider>
			</UserLocationContextProvider>
		</OverlayProvider>
	);
}
