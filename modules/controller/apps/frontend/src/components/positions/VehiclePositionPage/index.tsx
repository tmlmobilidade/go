/* * */

import { useVehiclePositionContext } from '@/contexts/VehiclePosition.context';
import { MapOverlayVehicles, MapView } from '@tmlmobilidade/ui';

/* * */

export function VehiclesPositionsPage() {
	const vehiclePositionContext = useVehiclePositionContext();

	return (
		<MapView id="PositionsMap">
			<MapOverlayVehicles showCounter="always" vehiclesData={vehiclePositionContext.data.vehiclePositionGeoJson} />
		</MapView>
	);
}
