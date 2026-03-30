'use client';

/* * */

import { useVehiclesDetailContext } from '@/contexts/VehiclesDetail.context';
import { getBaseGeoJsonFeatureCollection, transformVehicleDataIntoGeoJsonFeature } from '@tmlmobilidade/geo';
import { Collapsible, MapOverlayVehicles, MapView, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function VehicleDetailsMap() {
	//

	//
	// A. Setup variables

	const vehiclesDetailContext = useVehiclesDetailContext();

	const vehiclePositionGeoJson = useMemo(() => {
		const collection = getBaseGeoJsonFeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>();
		if (vehiclesDetailContext.data.position) {
			collection.features.push(transformVehicleDataIntoGeoJsonFeature(vehiclesDetailContext.data.position, vehiclesDetailContext.data.vehicle));
		}
		return collection;
	}, [vehiclesDetailContext.data.position, vehiclesDetailContext.data.vehicle]);

	//
	// B. Render components

	return (
		<Collapsible description="Última posição reportada do veículo." title="Mapa da posição atual" defaultOpen>
			<Section>
				<MapView height={360} id={`VehicleDetailsMap-${vehiclesDetailContext.data.id}`} layers={{ scale: false }} toolbar={false}>
					<MapOverlayVehicles showCounter="always" vehiclesData={vehiclePositionGeoJson} />
				</MapView>
			</Section>
		</Collapsible>
	);

	//
}
