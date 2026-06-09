'use client';

/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { COORDINATES_PIN_DEBOUNCE_MS, coordinatesToSearchQuery, getStopCoordinateEditRadiusWarningMessage, isLatLngOutsideEditRadius, STOP_COORDINATE_EDIT_RADIUS_METERS, STOP_COORDINATE_EDIT_RADIUS_WARNING_TOAST_ID, STOP_COORDINATE_EDIT_RADIUS_WARNING_TOAST_TITLE } from '@/components/stops/detail/StopDetailCoordinates/StopDetailCoordinatesModal/coordinates-query';
import { Button, CoordinatesInput, Divider, Grid, Section, useMapContext, useToast } from '@tmlmobilidade/ui';
import { useEffect, useRef } from 'react';

/* * */

interface StopDetailCoordinatesSelectProps {
	draft: [number | undefined, number | undefined]
	onConfirmDraft: () => void
	setDraftCoords: (latitude: number | undefined, longitude: number | undefined) => void
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

	const handleDraftCoordinatesChange = (value: [number | undefined, number | undefined] | undefined) => {
		if (!value) {
			setDraftCoords(undefined, undefined);
			if (pinDelayRef.current) clearTimeout(pinDelayRef.current);
			mapContext.actions.handleSearch('');
			return;
		}
		const [latRaw, lngRaw] = value;
		if (latRaw === undefined || lngRaw === undefined) {
			setDraftCoords(latRaw, lngRaw);
			if (pinDelayRef.current) clearTimeout(pinDelayRef.current);
			mapContext.actions.handleSearch('');
			return;
		}
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
				value={
					typeof latitude !== 'number' && typeof longitude !== 'number'
						? undefined
						: [latitude, longitude]
				}
			/>
			<Divider />
			<Grid columns="ab" gap="sm">
				<Button label="Cancelar" onClick={stopDetailContext.actions.closeCoordinatesEditor} type="button" variant="secondary" />
				<Button
					disabled={stopDetailContext.flags.isReadOnly || !latitude || !longitude}
					label="Definir coordenadas"
					onClick={onConfirmDraft}
					type="button"
				/>
			</Grid>
		</Section>
	);

	//
}
