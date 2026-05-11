'use client';

/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { COORDINATES_PIN_DEBOUNCE_MS, coordinatesToSearchQuery, getStopCoordinateEditRadiusWarningMessage, isLatLngOutsideEditRadius, STOP_COORDINATE_EDIT_RADIUS_METERS, STOP_COORDINATE_EDIT_RADIUS_WARNING_TOAST_ID, STOP_COORDINATE_EDIT_RADIUS_WARNING_TOAST_TITLE } from '@/components/stops/detail/StopDetailCoordinatesModal/coordinates-query';
import { closeStopDetailCoordinatesModal } from '@/contexts/StopDetailCoordinates.modal';
import { Button, CoordinatesInput, Divider, Grid, Section, useMapContext, useToast } from '@tmlmobilidade/ui';
import { useEffect, useRef } from 'react';

/* * */

export function StopDetailCoordinatesSelect() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const mapContext = useMapContext();
	const pinDelayRef = useRef<null | ReturnType<typeof setTimeout>>(null);
	const radiusWarningToastDelayRef = useRef<null | ReturnType<typeof setTimeout>>(null);

	//
	// B. Handle actions

	const handleSetCoordinates = (value: [number, number]) => {
		const [latRaw, lngRaw] = value;
		const lat = typeof latRaw === 'number' ? latRaw : Number(latRaw);
		const lng = typeof lngRaw === 'number' ? lngRaw : Number(lngRaw);
		if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
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
				return;
			}
		}
		stopDetailContext.data.form.setFieldValue('latitude', lat);
		stopDetailContext.data.form.setFieldValue('longitude', lng);
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

	const latitude = stopDetailContext.data.form.values.latitude;
	const longitude = stopDetailContext.data.form.values.longitude;

	return (
		<Section gap="md" padding="md">
			<CoordinatesInput
				key={stopDetailContext.data.form.key('latitude')}
				disabled={stopDetailContext.flags.isReadOnly}
				onChange={handleSetCoordinates}
				value={[
					typeof latitude === 'number' ? latitude : 0,
					typeof longitude === 'number' ? longitude : 0,
				]}
			/>
			<Divider />
			<Grid columns="ab" gap="sm">
				<Button label="Cancelar" onClick={closeStopDetailCoordinatesModal} type="button" variant="secondary" />
				<Button label="Definir coordenadas" onClick={() => handleSetCoordinates([Number(latitude), Number(longitude)])} type="button" />
			</Grid>
		</Section>
	);

	//
}
