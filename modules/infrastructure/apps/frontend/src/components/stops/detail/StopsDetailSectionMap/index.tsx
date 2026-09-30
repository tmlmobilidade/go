'use client';

/* * */

import { useStopsDetailFormContext } from '@/components/stops/detail/StopsDetailForm.context';
import { useStopsDetailStopId } from '@/components/stops/detail/use-stops-detail-stop-id';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { Collapsible, MapOverlayMultipleStops, type MapOverlayMultipleStopsDataProps, MapView, useStandardFormWatch } from '@tmlmobilidade/ui';
import { type Point } from 'geojson';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function StopsDetailSectionMap() {
	//

	//
	// A. Setup variables

	const { form } = useStopsDetailFormContext();
	const { stopId } = useStopsDetailStopId();
	const { t } = useTranslation();

	const latitudeValue = useStandardFormWatch({ control: form.control, name: 'latitude' });
	const longitudeValue = useStandardFormWatch({ control: form.control, name: 'longitude' });

	//
	// B. Transform data

	const stopMapData = useMemo(() => {
		// Generate a base GeoJSON feature collection
		const baseGeoJson = getBaseGeoJsonFeatureCollection<Point, MapOverlayMultipleStopsDataProps>();
		// Add every stop to the base GeoJSON feature collection
		baseGeoJson.features = [{
			geometry: {
				coordinates: [longitudeValue, latitudeValue],
				type: 'Point',
			},
			properties: {
				id: stopId,
				name: form.getValues('name'),
			},
			type: 'Feature',
		}];
		// Return the base GeoJSON feature collection
		return baseGeoJson;
	}, [longitudeValue, latitudeValue, stopId]);

	//
	// D. Render components

	return (
		<Collapsible
			description={t('default:stops.detail.SectionMap.description')}
			title={t('default:stops.detail.SectionMap.title')}
			defaultOpen
		>
			<div className={styles.mapWrapper}>
				<MapView id="StopDetailMap" toolbar={false}>
					<MapOverlayMultipleStops
						data={stopMapData}
						id="stop-map"
						visible
					/>
				</MapView>
			</div>
		</Collapsible>
	);
}
