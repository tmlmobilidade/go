'use client';

import { getBaseGeoJsonFeatureCollection, transformVehicleDataIntoGeoJsonFeature } from '@tmlmobilidade/geo';
import { Collapsible, MapOverlayVehicles, MapView } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useVehiclesDetailData } from '../use-vehicles-detail-data';
import { useVehiclesDetailPositionData } from '../use-vehicles-detail-position-data';

/* * */

export function VehiclesDetailMap() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data: vehicleData } = useVehiclesDetailData();
	const { data: positionData } = useVehiclesDetailPositionData();

	const vehiclePositionGeoJson = useMemo(() => {
		const collection = getBaseGeoJsonFeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>();
		if (positionData) {
			collection.features.push(transformVehicleDataIntoGeoJsonFeature(positionData, vehicleData));
		}
		return collection;
	}, [positionData, vehicleData]);

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:vehicles.detail.VehiclesDetailMap.description')}
			title={t('default:vehicles.detail.VehiclesDetailMap.title')}
			defaultOpen
		>
			<div className={styles.mapWrapper}>
				<MapView id="VehiclesDetailMap" toolbar={false}>
					<MapOverlayVehicles vehiclesData={vehiclePositionGeoJson} />
				</MapView>
			</div>
		</Collapsible>
	);
}
