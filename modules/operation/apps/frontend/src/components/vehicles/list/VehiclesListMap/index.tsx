'use client';

import { useVehiclesPositionsData } from '@/components/vehicles/shared/use-vehicles-positions-data';
import { MapOverlayVehicles, MapView } from '@tmlmobilidade/ui';

/* * */

export function VehiclesListMap() {
	//

	//
	// A. Setup variables

	const { geoJson } = useVehiclesPositionsData();

	//
	// B. Render components

	return (
		<MapView id="PositionsMap" layers={{ scale: false }} toolbar={false}>
			<MapOverlayVehicles showCounter="always" vehiclesData={geoJson} />
		</MapView>
	);
}
