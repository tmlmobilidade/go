'use client';

import { useVehiclePositionContext } from '@/contexts/VehiclePosition.context';
import { MapOverlayVehicles, MapView } from '@tmlmobilidade/ui';

/* * */

export function VehiclesListMap() {
	//

	//
	// A. Setup variables

	const vehiclePositionContext = useVehiclePositionContext();

	//
	// B. Render components

	return (
		<MapView id="PositionsMap" layers={{ scale: false }} toolbar={false}>
			<MapOverlayVehicles showCounter="always" vehiclesData={vehiclePositionContext.data.vehiclePositionGeoJson} />
		</MapView>
	);
}
