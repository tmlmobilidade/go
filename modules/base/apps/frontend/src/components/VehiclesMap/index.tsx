'use client';

/* * */

import { MapOverlayVehicles, MapView } from '@/components/map';
import { useVehiclePositionContext } from '@/contexts/VehiclePosition.context';
import { Section, Surface } from '@tmlmobilidade/ui';

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
		<Surface>
			<Section>
				<VehiclesMapHeader />
			</Section>
			<Section>
				<div className={styles.mapWrapper}>
					<MapView id="vehicles-map">
						<MapOverlayVehicles showCounter="always" vehiclesData={vehiclePositionContext.data.vehiclePositionGeoJson} />
					</MapView>
				</div>
			</Section>
		</Surface>
	);
}
