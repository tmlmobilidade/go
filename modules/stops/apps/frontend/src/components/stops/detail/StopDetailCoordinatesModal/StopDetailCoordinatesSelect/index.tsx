'use client';

/* * */

import { COORDINATES_PIN_DEBOUNCE_MS, coordinatesToSearchQuery, getStopCoordinateEditRadiusWarningMessage, isLatLngOutsideEditRadius, STOP_COORDINATE_EDIT_RADIUS_METERS, STOP_COORDINATE_EDIT_RADIUS_WARNING_TOAST_ID, STOP_COORDINATE_EDIT_RADIUS_WARNING_TOAST_TITLE } from '@/components/stops/detail/StopDetailCoordinatesModal/coordinates-query';
import { useStopDetailContext } from '@/contexts/StopDetailCoordinates.modal';
import { Button, CoordinatesInput, Divider, Grid, Section, useMapContext, useToast } from '@tmlmobilidade/ui';
import { useEffect, useRef } from 'react';

/* * */

interface StopDetailCoordinatesSelectProps {
	draft: [number, number]
	onConfirmDraft: () => void
	setDraftCoords: (latitude: number, longitude: number) => void
}

export function StopDetailCoordinatesSelect({ draft, onConfirmDraft, setDraftCoords }: StopDetailCoordinatesSelectProps) {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const mapContext = useMapContext();
	const pinDelayRef = useRef<null | ReturnType<typeof setTimeout>>(null);
	const radiusWarningToastDelayRef = useRef<null | ReturnType<typeof setTimeout>>(null);

	//
	// B. Handle actions

	const isDraftLngLatAllowed = (lat: number, lng: number): boolean => {
		if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
		const stop = stopDetailContext.data.stop;
		const latitudeN = typeof stop?.latitude === 'number' ? stop.latitude : Number(stop?.latitude);
		const longitudeN = typeof stop?.longitude === 'number' ? stop.longitude : Number(stop?.longitude);
		if (stop?._id && Number.isFinite(latitudeN) && Number.isFinite(longitudeN)) {
			if (isLatLngOutsideEditRadius(latitudeN, longitudeN, lat, lng, STOP_COORDINATE_EDIT_RADIUS_METERS)) {
				if (radiusWarningToastDelayRef.current) clearTimeout(radiusWarningToastDelayRef.current);
				radiusWarningToastDelayRef.current = setTimeout(() => {
					radiusWarningToastDelayRef.current = null;
					useToast.warning({
						autoClose: 6000,
						id: STOP_COORDINATE_EDIT_RADIUS_WARNING_TOAST_ID,
						message: getStopCoordinateEditRadiusWarningMessage(),
						title: STOP_COORDINATE_EDIT_RADIUS_WARNING_TOAST_TITLE,
					});
				}, 400);
				return false;
			}
		}
		return true;
	};

	const handleDraftCoordinatesChange = (value: [number, number]) => {
		const [latRaw, lngRaw] = value;
		const lat = typeof latRaw === 'number' ? latRaw : Number(latRaw);
		const lng = typeof lngRaw === 'number' ? lngRaw : Number(lngRaw);
		if (!isDraftLngLatAllowed(lat, lng)) return;
		setDraftCoords(lat, lng);
		if (pinDelayRef.current) clearTimeout(pinDelayRef.current);
		pinDelayRef.current = setTimeout(() => {
			pinDelayRef.current = null;
			mapContext.actions.handleSearch(coordinatesToSearchQuery(lat, lng));
		}, COORDINATES_PIN_DEBOUNCE_MS);
	};

	useEffect(() => {
		return () => {
			if (pinDelayRef.current) clearTimeout(pinDelayRef.current);
			if (radiusWarningToastDelayRef.current) clearTimeout(radiusWarningToastDelayRef.current);
		};
	}, []);

	//
	// C. Render components

	const [latitude, longitude] = draft;

	return (
		<Section gap="md" padding="md">
			<CoordinatesInput
				key="stop-detail-coordinates-map-draft"
				disabled={stopDetailContext.flags.isReadOnly}
				onChange={handleDraftCoordinatesChange}
				value={[
					typeof latitude === 'number' ? latitude : 0,
					typeof longitude === 'number' ? longitude : 0,
				]}
			/>
			<Divider />
			<Grid columns="ab" gap="sm">
				<Button label="Cancelar" onClick={stopDetailContext.actions.closeCoordinatesEditor} type="button" variant="secondary" />
				<Button
					disabled={stopDetailContext.flags.isReadOnly}
					label="Definir coordenadas"
					onClick={onConfirmDraft}
					type="button"
				/>
			</Grid>
		</Section>
	);

	//
}
