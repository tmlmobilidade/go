'use client';

import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { Collapsible, Grid, MapOverlayMultipleStops, MapOverlayMultipleStopsDataProps, MapView, Section, Surface, useStandardFormWatch } from '@tmlmobilidade/ui';
import { Point } from 'geojson';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { StopsDetailUpdateCoordinates } from '../coordinates/StopsDetailUpdateCoordinates';
import { StopsDetailLocation } from '../location/StopsDetailLocation';
import { StopsDetailUpdateName } from '../name/StopsDetailUpdateName';
import { useStopsDetailFormContext } from '../StopsDetailForm.context';
import { useStopsDetailStopId } from '../use-stops-detail-stop-id';

/* * */

export function StopsDetailSectionGeneral() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { form } = useStopsDetailFormContext();
	const { stopId } = useStopsDetailStopId();

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
	}, [longitudeValue, latitudeValue, stopId, form]);

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:stops.detail.SectionGeneral.description')}
			title={t('default:stops.detail.SectionGeneral.title')}
			defaultOpen
		>

			<Section>
				<Grid columns="ab" gap="md" placeItems="start">
					<Surface height="full">

						<MapView id="stop-detail-map" toolbar={false}>
							<MapOverlayMultipleStops
								data={stopMapData}
								id="stop-map"
								visible
							/>
						</MapView>
					</Surface>
					<Section gap="md" padding="none">
						<StopsDetailUpdateCoordinates />
						<StopsDetailLocation />
						<StopsDetailUpdateName />
					</Section>
				</Grid>
			</Section>

		</Collapsible>
	);
}
