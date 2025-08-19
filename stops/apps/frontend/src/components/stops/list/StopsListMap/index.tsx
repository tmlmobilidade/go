'use client';

/* * */

import { useStopsListContext } from '@/contexts/StopsList.context';
import { type Stop } from '@tmlmobilidade/types';
import { MapOverlayMultipleStops, MapOverlayMultipleStopsInteractiveLayerIds, MapView, Pane } from '@tmlmobilidade/ui';
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

	const handleStopClick = (value: Stop) => {
		router.push(`/stops/${value._id}`);
	};

	//
	// C. Render components

	return (
		<Pane>
			<MapView
				id="stops-list"
				interactiveLayerIds={[...MapOverlayMultipleStopsInteractiveLayerIds]}
			>
				<MapOverlayMultipleStops
					data={stopsListContext.data.filtered}
					onClick={handleStopClick}
				/>
			</MapView>
		</Pane>
	);

	//
}
