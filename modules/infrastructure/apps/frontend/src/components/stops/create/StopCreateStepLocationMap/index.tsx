'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { useStopsListData } from '@/components/stops/list/StopsList/use-stops-list-data';
import { getBaseGeoJsonFeatureCollection, isValidLatitude, isValidLongitude } from '@tmlmobilidade/geo';
import { MapOverlayMultipleStops, MapOverlayPins, type MapOverlayPinsPointDataProps, MapView } from '@tmlmobilidade/ui';
import { type Point } from 'geojson';
import { useMemo } from 'react';

/* * */

export function StopCreateStepLocationMap() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();
	const stopsListData = useStopsListData();
	const [latitude, longitude] = stopCreateContext.form.instance.getValues(['latitude', 'longitude']);

	//
	// B. Transform data

	const selectedCoordinatesMapData = useMemo(() => {
		const baseGeoJson = getBaseGeoJsonFeatureCollection<Point, MapOverlayPinsPointDataProps>();
		const validatedLatitude = isValidLatitude(latitude ?? NaN);
		const validatedLongitude = isValidLongitude(longitude ?? NaN);
		if (!validatedLatitude || !validatedLongitude) return baseGeoJson;

		baseGeoJson.features = [{
			geometry: {
				coordinates: [validatedLongitude, validatedLatitude],
				type: 'Point',
			},
			properties: {
				id: 'selected-coordinates',
			},
			type: 'Feature',
		}];

		return baseGeoJson;
	}, [latitude, longitude]);

	//
	// C. Handle actions

	const handleMapClick = (event) => {
		stopCreateContext.form.instance.setValue('latitude', event.lngLat.lat);
		stopCreateContext.form.instance.setValue('longitude', event.lngLat.lng);
	};

	//
	// D. Render components

	return (
		<MapView cursor="crosshair" height={400} id="create-stop-map" onClick={handleMapClick}>
			<MapOverlayMultipleStops
				data={stopsListData.data.features}
				id="stops-list"
				visible
			/>
			<MapOverlayPins
				id="selected-coordinates"
				pinsData={selectedCoordinatesMapData}
				focusOnChange
			/>
		</MapView>
	);

	//
}
