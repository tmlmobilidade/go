'use client';

import { AlertsDetail } from '@/components/alerts/detail/AlertsDetail';
import { AlertsList } from '@/components/alerts/list/AlertsList';
import { ComingSoon } from '@/components/ComingSoon';
import { ActionBar } from '@/components/common/action-bar/ActionBar';
import { BaseMap } from '@/components/common/base-map/BaseMap';
import { BaseMapOverlaysControl } from '@/components/common/base-map/BaseMapOverlaysControl';
import { VehiclesCounter } from '@/components/common/display/VehiclesCounter';
import { HelpDetail } from '@/components/help/HelpDetail';
import { LinesDetail } from '@/components/lines/detail/LinesDetail';
import { SearchDetail } from '@/components/search/SearchDetail';
import { StopsDetail } from '@/components/stops/detail/StopsDetail';
import { VehiclesDetail } from '@/components/vehicles/detail/VehiclesDetail';
import { useVehiclesContext } from '@/components/vehicles/Vehicles.context';
import { useColorScheme } from '@mantine/hooks';
import { useEffect } from 'react';

/* * */

export default function Page() {
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
			<ComingSoon />
			<BaseMap />
			<BaseMapOverlaysControl />
			<ActionBar />
			<VehiclesDetail />
			<LinesDetail />
			<StopsDetail />
			<HelpDetail />
			<AlertsList />
			<AlertsDetail />
			<SearchDetail />
			<VehiclesCounter count={vehiclesContext.data.fc?.features?.length} />
		</>
	);
}
