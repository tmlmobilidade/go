'use client';

/* * */

import { MapOverlayVehicles, MapView } from '@/components/map';
import { useVehiclePositionContext } from '@/contexts/VehiclePosition.context';

import styles from './styles.module.css';

import { VehiclesMapHeader } from '../VehiclesMapHeader';

/* * */

export function VehiclesMap() {
	//

	//
	// A. Setup variables

	const vehiclePositionContext = useVehiclePositionContext();

	//
	// B. Render

	return (
		<div className={styles.mapSectionContainer}>
			<VehiclesMapHeader />
			<div className={styles.mapWrapper}>
				<MapView id="vehicles-map">
					<MapOverlayVehicles showCounter="always" vehiclesData={vehiclePositionContext.data.vehiclePositionGeoJson} />
				</MapView>
			</div>
		</div>
	);
}
