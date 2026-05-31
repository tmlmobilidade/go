'use client';

import { MapView } from '@/components/map/MapView';
import { MapViewStyleStops } from '@/components/map/MapViewStyleStops';
import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { Section } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/* * */

export function StopsListViewMap() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const stopsListContext = useStopsListContext();

	//
	// B. Handle actions

	useEffect(() => {
		// Exit early if there are no stops or map
		if (!stopsListContext.data.fc?.features.length) return;
		// When there are no search filters, center the map on all stops
		if (!stopsListContext.filters.search.value) {
			// centerMapView(stopsListContext.data.fc);
			return;
		}
	}, [stopsListContext.data.fc, stopsListContext.filters.search.value]);

	//
	// C. Render components

	return (
		<Section>
			<MapView id="stops-list">
				<MapViewStyleStops
					stopsData={stopsListContext.data.fc}
				/>
			</MapView>
		</Section>
	);
}
