'use client';

/* * */

import { toFiniteLngLat } from '@/components/stops/detail/StopDetailCoordinates/StopDetailCoordinatesModal/coordinates-query';
import { coordinatesToSearchQuery, getEditRadiusCircleFeatureCollection, getEditRadiusOutsideMaskFeatureCollection, getStopCoordinateEditRadiusWarningMessage, isLatLngOutsideEditRadius, STOP_COORDINATE_EDIT_RADIUS_METERS, STOP_COORDINATE_EDIT_RADIUS_WARNING_TOAST_ID, STOP_COORDINATE_EDIT_RADIUS_WARNING_TOAST_TITLE } from '@/components/stops/detail/StopDetailCoordinates/StopDetailCoordinatesModal/coordinates-query';
import { useStopDetailContext } from '@/contexts/StopDetailCoordinates.modal';
import { getBaseGeoJsonFeatureCollection, METERS_PER_DEGREE } from '@tmlmobilidade/geo';
import { MapOverlayMultipleStops, type MapOverlayMultipleStopsDataProps, MapOverlayPolygon, MapView, useMapContext, useMapViewContext, useToast } from '@tmlmobilidade/ui';
import { type MapLayerMouseEvent } from '@vis.gl/react-maplibre';
import { type Point } from 'geojson';
import { useEffect, useMemo } from 'react';

/* * */

/** Framing margin beyond {@link STOP_COORDINATE_EDIT_RADIUS_METERS} so the blue ring fits comfortably. */
const EDIT_RADIUS_MAP_FIT_EXTENT_FACTOR = 1.35;

/** Fits the map tightly on the ~50 m editable disk (must render inside {@link MapView}). */
function StopDetailCoordinatesMapTightFit({ centerLat, centerLng, stopId }: { centerLat: null | number, centerLng: null | number, stopId: string | undefined }) {
	//

	//
	// A. Setup variables

	const mapViewContext = useMapViewContext();

	//
	// B. Transform data

	/** Fits the map tightly on the ~50 m editable disk (must render inside {@link MapView}). */
	useEffect(() => {
		if (!stopId || centerLat == null || centerLng == null) return;
		if (!Number.isFinite(centerLat) || !Number.isFinite(centerLng)) return;
		if (mapViewContext.flags.loading) return;

		const extentMeters = STOP_COORDINATE_EDIT_RADIUS_METERS * EDIT_RADIUS_MAP_FIT_EXTENT_FACTOR;
		const cosLat = Math.cos((centerLat * Math.PI) / 180);
		if (!Number.isFinite(cosLat) || Math.abs(cosLat) < 1e-6) return;

		const timer = window.setTimeout(() => {
			const map = mapViewContext.ref.map.current;
			if (!map) return;
			mapViewContext.actions.toggleAutoZoom(false);
			const dLat = extentMeters / METERS_PER_DEGREE;
			const dLng = extentMeters / (METERS_PER_DEGREE * cosLat);
			map.fitBounds(
				[
					[centerLng - dLng, centerLat - dLat],
					[centerLng + dLng, centerLat + dLat],
				],
				{
					bearing: 0,
					duration: 450,
					maxZoom: 22,
					padding: 10,
					pitch: 0,
				},
			);
		}, 100);

		return () => window.clearTimeout(timer);
		// Framing only depends on saved stop anchor + map ready; avoid re-fitting on unrelated context updates.
		// eslint-disable-next-line react-hooks/exhaustive-deps -- mapViewContext.actions/ref used inside timeout; listing them re-runs every frame
	}, [centerLat, centerLng, stopId, mapViewContext.flags.loading]);

	return null;
}

/* * */

export function StopDetailCoordinatesMap({ setDraftCoords }: { setDraftCoords: (latitude: number, longitude: number) => void }) {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const mapContext = useMapContext();

	//
	// B. Transform data

	// Saved stop position (API). Does not move while editing — only updates after refetch/save.
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

	// Dimmed “outside allowed range” mask; hole matches the editable disk.
	const editRadiusOutsideMaskGeojson = useMemo(() => {
		const stop = stopDetailContext.data.stop;
		if (!stop?._id) return null;
		const coords = toFiniteLngLat(stop.latitude, stop.longitude);
		if (!coords) return null;
		return getEditRadiusOutsideMaskFeatureCollection(coords.latitude, coords.longitude, STOP_COORDINATE_EDIT_RADIUS_METERS);
	}, [stopDetailContext.data.stop]);

	// Stroke-only polygon along the editable radius (fill handled by {@link editRadiusOutsideMaskGeojson}).
	const editRadiusCircleGeojson = useMemo(() => {
		const stop = stopDetailContext.data.stop;
		if (!stop?._id) return null;
		const coords = toFiniteLngLat(stop.latitude, stop.longitude);
		if (!coords) return null;
		return getEditRadiusCircleFeatureCollection(coords.latitude, coords.longitude, STOP_COORDINATE_EDIT_RADIUS_METERS);
	}, [stopDetailContext.data.stop]);

	// Saved stop anchor for tight camera fit on the edit radius.
	const savedStopAnchor = useMemo(
		() => toFiniteLngLat(stopDetailContext.data.stop?.latitude, stopDetailContext.data.stop?.longitude),
		[stopDetailContext.data.stop],
	);

	//
	// C. Handle actions

	const handleMapClick = (event: MapLayerMouseEvent) => {
		const lat = event.lngLat.lat;
		const lng = event.lngLat.lng;
		const anchor = toFiniteLngLat(stopDetailContext.data.stop?.latitude, stopDetailContext.data.stop?.longitude);
		if (anchor && isLatLngOutsideEditRadius(anchor.latitude, anchor.longitude, lat, lng, STOP_COORDINATE_EDIT_RADIUS_METERS)) {
			useToast.warning({
				autoClose: 6000,
				id: STOP_COORDINATE_EDIT_RADIUS_WARNING_TOAST_ID,
				message: getStopCoordinateEditRadiusWarningMessage(),
				title: STOP_COORDINATE_EDIT_RADIUS_WARNING_TOAST_TITLE,
			});
			return;
		}
		setDraftCoords(lat, lng);
		mapContext.actions.handleSearch(coordinatesToSearchQuery(lat, lng));
	};

	const stop = stopDetailContext.data.stop;
	const staticOverlayId = stop?._id ? `stop-detail-static-${String(stop._id)}` : 'stop-detail-static';
	const editRadiusOverlayId = stop?._id ? `stop-detail-edit-radius-${String(stop._id)}` : 'stop-detail-edit-radius';
	const editRadiusMaskOverlayId = stop?._id ? `stop-detail-edit-radius-mask-${String(stop._id)}` : 'stop-detail-edit-radius-mask';

	//
	// D. Render components

	// Wrapper: MapView uses height:100%; inside Pane flex+overflow, percentage height breaks row sizing.
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
				<StopDetailCoordinatesMapTightFit
					centerLat={savedStopAnchor?.latitude ?? null}
					centerLng={savedStopAnchor?.longitude ?? null}
					stopId={stopDetailContext.data.stop?._id ? String(stopDetailContext.data.stop._id) : undefined}
				/>
				{editRadiusOutsideMaskGeojson && (
					<MapOverlayPolygon
						color="#000000"
						data={editRadiusOutsideMaskGeojson}
						fillOpacity={0.58}
						id={editRadiusMaskOverlayId}
						lineOpacity={0}
						lineWidth={0}
						registerForAutoZoom={false}
						visible
					/>
				)}
				{editRadiusCircleGeojson && (
					<MapOverlayPolygon
						color="#1c7ed6"
						data={editRadiusCircleGeojson}
						fillOpacity={0}
						id={editRadiusOverlayId}
						lineOpacity={1}
						lineWidth={2}
						visible
					/>
				)}
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
