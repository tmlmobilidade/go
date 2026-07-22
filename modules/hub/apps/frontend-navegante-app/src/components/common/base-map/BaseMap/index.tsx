'use client';

import { BaseMapLayers } from '@/components/common/base-map/BaseMapLayers';
import { useBaseMapCameraSync } from '@/components/common/base-map/useBaseMapCameraSync';
import { useBaseMapDerivedData } from '@/components/common/base-map/useBaseMapDerivedData';
import { useBaseMapFocusedEntities } from '@/components/common/base-map/useBaseMapFocusedEntities';
import { baseMapInteractiveLayerIds, useBaseMapInteractions } from '@/components/common/base-map/useBaseMapInteractions';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { useMapContext } from '@/components/map/Map.context';
import { MapView } from '@/components/map/MapView';
import { useUserLocation } from '@/components/map/use-user-location';

/* * */

export function BaseMap() {
	//

	//
	// A. Setup variables

	const { data: { excludedBaseMapOperatorIds } } = useMapContext();
	const { setUserLocationTrackingMode, userLocation } = useUserLocation();
	const { activeBottomSheet } = useBottomSheet();

	const focusedEntities = useBaseMapFocusedEntities({ activeBottomSheet });

	const derivedData = useBaseMapDerivedData({
		activeBottomSheet,
		excludedOperatorIds: excludedBaseMapOperatorIds,
		focusedAlertId: focusedEntities.focusedAlertId,
		focusedVehicleId: focusedEntities.focusedVehicleId,
	});

	useBaseMapCameraSync({
		focusedLineShape: focusedEntities.focusedLineShape,
		focusedStop: focusedEntities.focusedStop,
		placeDestination: derivedData.placeDestination,
		routePlannerMapFitFeatures: derivedData.routePlannerMapFitFeatures,
	});

	const { handleGetDirections, mapViewInteractionProps, selectedMapLocation } = useBaseMapInteractions({
		setUserLocationTrackingMode,
	});

	//
	// B. Render components

	return (
		<MapView
			{...mapViewInteractionProps}
			id="base-map"
			interactiveLayerIds={baseMapInteractiveLayerIds}
		>
			<BaseMapLayers
				derivedData={derivedData}
				focusedEntities={focusedEntities}
				onGetDirections={handleGetDirections}
				selectedMapLocation={selectedMapLocation}
				userLocation={userLocation}
			/>
		</MapView>
	);
}
