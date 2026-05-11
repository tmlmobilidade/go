'use client';

import type { UpdateStopDto } from '@tmlmobilidade/types';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { coordinatesToSearchQuery } from '@/components/stops/detail/StopDetailCoordinatesModal/coordinates-query';
import { type UseFormReturnType } from '@mantine/form';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { MapOverlayMultipleStops, type MapOverlayMultipleStopsDataProps, MapView, useMapContext } from '@tmlmobilidade/ui';
import { type MapLayerMouseEvent } from '@vis.gl/react-maplibre';
import { type Point } from 'geojson';
import { useCallback, useEffect, useMemo } from 'react';

/* * */

function toFiniteLngLat(latitude: unknown, longitude: unknown): null | { latitude: number, longitude: number } {
	const latitudeN = typeof latitude === 'number' ? latitude : Number(latitude);
	const longitudeN = typeof longitude === 'number' ? longitude : Number(longitude);
	if (!Number.isFinite(latitudeN) || !Number.isFinite(longitudeN)) return null;
	return { latitude: latitudeN, longitude: longitudeN };
}

/** Updates map search-pin context (`showSearchPin`). Same logic as typed coordinates in StopDetailCoordinatesSelect. */
function syncSearchPinFromForm(form: UseFormReturnType<UpdateStopDto>, handleSearch: (value: string) => void) {
	handleSearch(coordinatesToSearchQuery(form.getValues().latitude, form.getValues().longitude));
}

/* * */

export function StopDetailCoordinatesMap() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const mapContext = useMapContext();
	const { form } = stopDetailContext.data;

	const bumpSearchPin = useCallback(() => {
		syncSearchPinFromForm(form, mapContext.actions.handleSearch);
	}, [form, mapContext.actions.handleSearch]);

	//
	// B. Transform data

	/** Saved paragem position (API). Does not move while editing — only updates after refetch/save. */
	const staticStopGeojsonFC = useMemo(() => {
		const baseGeoJson = getBaseGeoJsonFeatureCollection<Point, MapOverlayMultipleStopsDataProps>();
		const stop = stopDetailContext.data.stop;
		if (!stop?._id) return baseGeoJson;
		const coords = toFiniteLngLat(stop.latitude, stop.longitude);
		if (!coords) return baseGeoJson;
		baseGeoJson.features = [{
			geometry: {
				coordinates: [coords.longitude, coords.latitude],
				type: 'Point',
			},
			properties: {
				id: String(stop._id),
				name: stop.name,
			},
			type: 'Feature',
		}];
		return baseGeoJson;
	}, [stopDetailContext.data.stop]);

	/** Pin after field edits is debounced in StopDetailCoordinatesSelect; keep immediate sync on mount / stop change. */

	useEffect(() => {
		bumpSearchPin();
	}, [bumpSearchPin, stopDetailContext.data.stop?._id]);

	//
	// C. Handle actions

	const handleMapClick = (event: MapLayerMouseEvent) => {
		const lat = event.lngLat.lat;
		const lng = event.lngLat.lng;
		form.setFieldValue('latitude', lat);
		form.setFieldValue('longitude', lng);
		mapContext.actions.handleSearch(coordinatesToSearchQuery(lat, lng));
	};

	const stop = stopDetailContext.data.stop;
	const staticOverlayId = stop?._id ? `stop-detail-static-${String(stop._id)}` : 'stop-detail-static';

	//
	// D. Render components
	/* Wrapper: MapView uses height:100%; inside Pane flex+overflow, percentage height breaks row sizing. */
	return (
		<div style={{ flexShrink: 0, width: '100%' }}>
			<MapView
				cursor="crosshair"
				height={400}
				id="stop-detail-coordinates-map"
				onClick={handleMapClick}
				toolbar={false}
				showSearchPin
			>
				<MapOverlayMultipleStops
					data={staticStopGeojsonFC}
					id={staticOverlayId}
					visible
				/>
			</MapView>
		</div>
	);

	//
}
