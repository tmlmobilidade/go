'use client';

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams, MapOverlayMultipleStops, type MapOverlayMultipleStopsDataProps, MapView, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function StopsListMap() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const stopsListContext = useStopsListContext();

	//
	// B. Handle actions

	const handleStopClick = (value: MapOverlayMultipleStopsDataProps) => {
		router.push(keepUrlParams(PAGE_ROUTES.stops.STOPS_DETAIL(String(value.id))));
	};

	//
	// D. Render components

	return (
		<Pane>
			<MapView id="stops-list">
				<MapOverlayMultipleStops
					data={stopsListContext.data.features}
					id="stops-list"
					onClick={handleStopClick}
					visible
				/>
			</MapView>
		</Pane>
	);

	//
}
