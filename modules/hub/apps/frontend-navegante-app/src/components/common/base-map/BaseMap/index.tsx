'use client';

import { BaseMapLayers } from '@/components/common/base-map/BaseMapLayers';
import { MapView } from '@/components/map/MapView';
import { useMapContext } from '@/contexts/Map.context';
import { useUserLocation } from '@/contexts/UserLocation.context';
import { useBaseMapCameraSync } from '@/hooks/base-map/useBaseMapCameraSync';
import { useBaseMapDerivedData } from '@/hooks/base-map/useBaseMapDerivedData';
import { useBaseMapFocusedEntities } from '@/hooks/base-map/useBaseMapFocusedEntities';
import { baseMapInteractiveLayerIds, useBaseMapInteractions } from '@/hooks/base-map/useBaseMapInteractions';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { useMapBottomSheet } from '@/hooks/bottom-sheet/useMapBottomSheet';

/* * */

export function BaseMap() {
	//

	//
	// A. Setup variables

	const { data: { excludedBaseMapOperatorIds } } = useMapContext();
	const userLocationContext = useUserLocation();
	const { activeBottomSheet } = useBottomSheet();
	const mapBottomSheet = useMapBottomSheet();

	const focusedEntities = useBaseMapFocusedEntities({ activeBottomSheet });

	const derivedData = useBaseMapDerivedData({
		activeBottomSheet,
		excludedOperatorIds: excludedBaseMapOperatorIds,
		focusedAlertId: focusedEntities.focusedAlertId,
		focusedVehicleId: focusedEntities.focusedVehicleId,
	});

	useBaseMapCameraSync({
		focusedAlert: derivedData.focusedAlert,
		focusedLineShape: focusedEntities.focusedLineShape,
		focusedStop: focusedEntities.focusedStop,
		focusedVehicle: derivedData.focusedVehicle,
		placeDestination: derivedData.placeDestination,
		routePlannerMapFitFeatures: derivedData.routePlannerMapFitFeatures,
	}, mapBottomSheet);

	const { handleGetDirections, mapViewInteractionProps, selectedMapLocation } = useBaseMapInteractions({
		collapseForMapInteraction: mapBottomSheet.collapseForMapInteraction,
		setUserLocationTrackingMode: userLocationContext.actions.setTrackingMode,
	});

	//
	// E. Render components

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
				userLocation={userLocationContext.data.location}
			/>
		</MapView>
	);
}
