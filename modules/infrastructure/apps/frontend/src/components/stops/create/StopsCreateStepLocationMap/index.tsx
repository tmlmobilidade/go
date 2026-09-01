'use client';

import { useStopsListData } from '@/components/stops/list/use-stops-list-data';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { LatitudeSchema, LongitudeSchema } from '@tmlmobilidade/go-types-geo';
import { MapOverlayMultipleStops, MapOverlayMultipleStopsDataProps, MapOverlayPins, type MapOverlayPinsPointDataProps, MapView, useStandardFormWatch } from '@tmlmobilidade/ui';
import { type Point } from 'geojson';
import { useMemo } from 'react';

import { useStopsCreateFormContext } from '../StopsCreateForm.context';

/* * */

export function StopsCreateStepLocationMap() {
	//

	//
	// A. Setup variables

	const { form } = useStopsCreateFormContext();

	const { data: allStopsData } = useStopsListData();

	const latitudeValue = useStandardFormWatch({ control: form.control, name: 'latitude' });
	const longitudeValue = useStandardFormWatch({ control: form.control, name: 'longitude' });

	//
	// B. Transform data

	const allStopsMapData = useMemo(() => {
		// Generate a base GeoJSON feature collection
		const baseGeoJson = getBaseGeoJsonFeatureCollection<Point, MapOverlayMultipleStopsDataProps>();
		// Add the selected coordinates to the base GeoJSON feature collection
		baseGeoJson.features = allStopsData?.map(item => ({
			geometry: {
				coordinates: [item.longitude, item.latitude],
				type: 'Point',
			},
			properties: {
				id: item._id,
				name: item.name,
			},
			type: 'Feature',
		}));
		// Return the base GeoJSON feature collection
		// with the selected coordinates
		return baseGeoJson;
	}, [allStopsData]);

	const selectedCoordinatesMapData = useMemo(() => {
		// Generate a base GeoJSON feature collection
		const baseGeoJson = getBaseGeoJsonFeatureCollection<Point, MapOverlayPinsPointDataProps>();
		// Validate latitude and longitude
		const validatedLatitude = LatitudeSchema.safeParse(latitudeValue);
		const validatedLongitude = LongitudeSchema.safeParse(longitudeValue);
		if (!validatedLatitude.success || !validatedLongitude.success) return baseGeoJson;
		// Add the selected coordinates to the base GeoJSON feature collection
		baseGeoJson.features = [{
			geometry: {
				coordinates: [validatedLongitude.data, validatedLatitude.data],
				type: 'Point',
			},
			properties: {
				id: 'selected-coordinates',
			},
			type: 'Feature',
		}];
		// Return the base GeoJSON feature collection
		// with the selected coordinates
		return baseGeoJson;
	}, [latitudeValue, longitudeValue]);

	//
	// C. Handle actions

	const handleMapClick = (event) => {
		form.setValue('latitude', event.lngLat.lat);
		form.setValue('longitude', event.lngLat.lng);
	};

	//
	// D. Render components

	return (
		<MapView cursor="crosshair" height={400} id="create-stop-map" onClick={handleMapClick}>
			<MapOverlayMultipleStops
				data={allStopsMapData}
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
