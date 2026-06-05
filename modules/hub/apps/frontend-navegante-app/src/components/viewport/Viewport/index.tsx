'use client';

import { AlertsList } from '@/components/alerts/list/AlertsList';
import { HelpDetail } from '@/components/help/HelpDetail';
import { LinesDetail } from '@/components/lines/detail/LinesDetail';
import { SearchDetail } from '@/components/search/SearchDetail';
import { StopsDetail } from '@/components/stops/detail/StopsDetail';
import { VehiclesCounter } from '@/components/vehicles/common/VehiclesCounter';
import { VehiclesDetail } from '@/components/vehicles/detail/VehiclesDetail';
import { useVehiclesContext } from '@/components/vehicles/Vehicles.context';
import { FloatingBar } from '@/components/viewport/FloatingBar';
import { ViewportMap } from '@/components/viewport/ViewportMap';
import { ViewportMapOverlaysControl } from '@/components/viewport/ViewportMapOverlaysControl';
import { useColorScheme } from '@mantine/hooks';
import { useEffect } from 'react';

/* * */

export function Viewport() {
	//

	//
	// A. Setup variables

	const colorScheme = useColorScheme();

	const vehiclesContext = useVehiclesContext();

	//
	// B. Handle actions

	useEffect(() => {
		if (typeof document === 'undefined') return;
		document.documentElement.setAttribute('data-mode', colorScheme);
		document.documentElement.setAttribute('data-mantine-color-scheme', colorScheme);
	}, [colorScheme]);

	//
	// C. Render components

	return (
		<>
			<ViewportMap />
			<ViewportMapOverlaysControl />
			<FloatingBar />
			<VehiclesDetail />
			<LinesDetail />
			<StopsDetail />
			<HelpDetail />
			<AlertsList />
			<SearchDetail />
			<VehiclesCounter count={vehiclesContext.data.fc?.features?.length} />
		</>
	);
}
