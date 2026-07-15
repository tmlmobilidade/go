'use client';

import { AlertsDetail } from '@/components/alerts/detail/AlertsDetail';
import { AlertsList } from '@/components/alerts/list/AlertsList';
import { ActionBar } from '@/components/common/action-bar/ActionBar';
import { BaseMap } from '@/components/common/base-map/BaseMap';
import { BaseMapOverlaysControl } from '@/components/common/base-map/BaseMapOverlaysControl';
import { RoutePlannerVehiclesCounter } from '@/components/common/display/RoutePlannerVehiclesCounter';
import { HelpDetail } from '@/components/help/HelpDetail';
import { LinesDetail } from '@/components/lines/detail/LinesDetail';
import { RoutePlanner } from '@/components/routes/RoutePlanner';
import { RoutePlannerContextProvider } from '@/components/routes/RoutePlanner.context';
import { RoutePlannerTopSearch } from '@/components/routes/RoutePlannerTopSearch';
import { SearchDetail } from '@/components/search/SearchDetail';
import { StopsDetail } from '@/components/stops/detail/StopsDetail';
import { VehiclesDetail } from '@/components/vehicles/detail/VehiclesDetail';
import { useColorScheme } from '@mantine/hooks';
import { useEffect } from 'react';

/* * */

export default function Page() {
	//

	//
	// A. Setup variables

	const colorScheme = useColorScheme();

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
		<RoutePlannerContextProvider>
			<BaseMap />
			<RoutePlannerTopSearch />
			<BaseMapOverlaysControl />
			<ActionBar />
			<VehiclesDetail />
			<LinesDetail />
			<StopsDetail />
			<HelpDetail />
			<AlertsList />
			<AlertsDetail />
			<SearchDetail />
			<RoutePlanner />
			<RoutePlannerVehiclesCounter />
		</RoutePlannerContextProvider>
	);
}
