'use client';

import { useStopsListData } from '@/components/stops/list/StopsList/use-stops-list-data';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams, MapOverlayMultipleStops, type MapOverlayMultipleStopsDataProps, MapView, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function StopsListMap() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const stopsListData = useStopsListData();

	//
	// B. Handle actions

	const handleStopClick = (value: MapOverlayMultipleStopsDataProps) => {
		router.push(keepUrlParams(PAGE_ROUTES.infrastructure.STOPS_GET(String(value.id))));
	};

	//
	// D. Render components

	return (
		<Pane>
			<MapView id="stops-list">
				<MapOverlayMultipleStops
					data={stopsListData.data.features}
					id="stops-list"
					onClick={handleStopClick}
					visible
				/>
			</MapView>
		</Pane>
	);

	//
}
