'use client';

/* * */
import { useVehiclePositionContext } from '@/contexts/VehiclePosition.context';
import { MapOverlayVehicles, MapView } from '@tmlmobilidade/ui';

/* * */

export default function Page() {
	const vehiclePositionContext = useVehiclePositionContext();

	return (
		<MapView id="PositionsMap" layers={{ scale: false }} toolbar={false}>
			<MapOverlayVehicles showCounter="always" vehiclesData={vehiclePositionContext.data.vehiclePositionGeoJson} />
		</MapView>
	);
}
