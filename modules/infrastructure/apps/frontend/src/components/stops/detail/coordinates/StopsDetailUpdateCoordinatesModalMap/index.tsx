'use client';

import { useStopsDetailData } from '@/components/stops/detail/use-stops-detail-data';
import { LatitudeSchema, LongitudeSchema } from '@tmlmobilidade/go-types-geo';
import { MapOverlayPins, type MapOverlayPinsPointDataProps, MapOverlayPolygon, MapView, useStandardFormWatch } from '@tmlmobilidade/ui';
import * as turf from '@turf/turf';
import { type FeatureCollection, type Point } from 'geojson';
import { type ComponentProps, useMemo } from 'react';

import { useStopsDetailUpdateCoordinatesFormContext } from '../StopsDetailUpdateCoordinatesForm.context';

/* * */

type MapViewClickEvent = Parameters<NonNullable<ComponentProps<typeof MapView>['onClick']>>[0];

/* * */

export function StopsDetailUpdateCoordinatesModalMap() {
	//

	//
	// A. Setup variables

	const { data } = useStopsDetailData();

	const { form } = useStopsDetailUpdateCoordinatesFormContext();

	const latitudeValue = useStandardFormWatch({ control: form.control, name: 'latitude' });
	const longitudeValue = useStandardFormWatch({ control: form.control, name: 'longitude' });

	//
	// B. Transform data

	const mapViewportMask = useMemo(() => {
		const validatedLatitude = LatitudeSchema.safeParse(data?.latitude);
		const validatedLongitude = LongitudeSchema.safeParse(data?.longitude);
		if (!validatedLatitude.success || !validatedLongitude.success) return null;
		// Create a circle around the point
		const circle = turf.circle([validatedLongitude.data, validatedLatitude.data], 1000, {
			steps: 64,
			units: 'meters',
		});
		// World-sized polygon
		const world = turf.polygon([[
			[-180, -90],
			[180, -90],
			[180, 90],
			[-180, 90],
			[-180, -90],
		]]);
		// Subtract circle from viewport
		const difference = turf.difference(turf.featureCollection([world, circle]));
		if (!difference) return null;
		return turf.featureCollection([{
			geometry: difference.geometry,
			id: 'mask',
			properties: { id: 'mask' },
			type: 'Feature',
		}]);
	}, [data?.latitude, data?.longitude]);

	const pinsData = useMemo<FeatureCollection<Point, MapOverlayPinsPointDataProps>>(() => {
		const validatedLatitude = LatitudeSchema.safeParse(latitudeValue);
		const validatedLongitude = LongitudeSchema.safeParse(longitudeValue);
		if (!validatedLatitude.success || !validatedLongitude.success) return turf.featureCollection([]);
		return turf.featureCollection([{
			geometry: {
				coordinates: [validatedLongitude.data, validatedLatitude.data],
				type: 'Point',
			},
			id: 'stop',
			properties: { id: 'stop' },
			type: 'Feature',
		}]);
	}, [latitudeValue, longitudeValue]);

	//
	// C. Handle actions

	const handleMapClick = (event: MapViewClickEvent) => {
		const validatedLatitude = LatitudeSchema.safeParse(event.lngLat.lat);
		const validatedLongitude = LongitudeSchema.safeParse(event.lngLat.lng);
		if (!validatedLatitude.success || !validatedLongitude.success) return;
		form.setValue('latitude', validatedLatitude.data, { shouldDirty: true, shouldValidate: true });
		form.setValue('longitude', validatedLongitude.data, { shouldDirty: true, shouldValidate: true });
	};

	//
	// D. Render components

	return (
		<MapView cursor="crosshair" height={400} id="editStopCoordinatesMap" onClick={handleMapClick} showSearchPin={false} toolbar={false}>
			<MapOverlayPins id="selected-coordinates" pinsData={pinsData} focusOnChange visible />
			{mapViewportMask && <MapOverlayPolygon data={mapViewportMask} id="mask" registerForAutoZoom={false} />}
		</MapView>
	);
}
