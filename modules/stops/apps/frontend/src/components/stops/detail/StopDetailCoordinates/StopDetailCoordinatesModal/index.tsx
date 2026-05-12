'use client';

/* * */

import { StopDetailCoordinatesMap } from '@/components/stops/detail/StopDetailCoordinates/StopDetailCoordinatesMap';
import { coordinatesToSearchQuery, getStopCoordinateEditRadiusWarningMessage, isLatLngOutsideEditRadius, STOP_COORDINATE_EDIT_RADIUS_METERS, STOP_COORDINATE_EDIT_RADIUS_WARNING_TOAST_ID, STOP_COORDINATE_EDIT_RADIUS_WARNING_TOAST_TITLE } from '@/components/stops/detail/StopDetailCoordinates/StopDetailCoordinatesModal/coordinates-query';
import { StopDetailCoordinatesSelect } from '@/components/stops/detail/StopDetailCoordinates/StopDetailCoordinatesSelect';
import { useStopDetailContext } from '@/contexts/StopDetailCoordinates.modal';
import { Divider, Label, MapContextProvider, Pane, Spacer, Toolbar, useMapContext, useToast } from '@tmlmobilidade/ui';
import { useCallback, useEffect, useState } from 'react';

/* * */

/** Separate preference scope so modal search-pin / toolbar state does not overwrite the detail page map. */
const DETAIL_COORDINATES_MAP_SCOPE = 'map:stop-detail-coordinates-modal';

export function StopDetailCoordinatesModalBody() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const mapContext = useMapContext();
	const open = stopDetailContext.flags.isCoordinatesEditorOpen;
	const { form } = stopDetailContext.data;
	const stop = stopDetailContext.data.stop;

	const [draft, setDraft] = useState<[number, number]>(() => {
		const lat = form.values.latitude;
		const lng = form.values.longitude;
		const latN = typeof lat === 'number' ? lat : Number(lat);
		const lngN = typeof lng === 'number' ? lng : Number(lng);
		return [
			Number.isFinite(latN) ? latN : 0,
			Number.isFinite(lngN) ? lngN : 0,
		];
	});

	//
	// B. Handle actions

	useEffect(() => {
		if (!open) return;
		mapContext.actions.toggleStyle('map');
		const vals = form.getValues();
		const latN = typeof vals.latitude === 'number' ? vals.latitude : Number(vals.latitude);
		const lngN = typeof vals.longitude === 'number' ? vals.longitude : Number(vals.longitude);
		if (!Number.isFinite(latN) || !Number.isFinite(lngN)) return;
		setDraft([latN, lngN]);
		mapContext.actions.handleSearch(coordinatesToSearchQuery(latN, lngN));
		// Intentionally only when the editor opens — avoid resetting draft after map clicks / context updates.
		// eslint-disable-next-line react-hooks/exhaustive-deps -- form + mapContext are stable; we only want init on open
	}, [open]);

	//

	const setDraftCoords = useCallback((lat: number, lng: number) => {
		setDraft([lat, lng]);
	}, []);

	const handleConfirmDraft = useCallback(() => {
		const [lat, lng] = draft;
		if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
		const latitudeN = typeof stop?.latitude === 'number' ? stop.latitude : Number(stop?.latitude);
		const longitudeN = typeof stop?.longitude === 'number' ? stop.longitude : Number(stop?.longitude);
		if (stop?._id && Number.isFinite(latitudeN) && Number.isFinite(longitudeN)) {
			if (isLatLngOutsideEditRadius(latitudeN, longitudeN, lat, lng, STOP_COORDINATE_EDIT_RADIUS_METERS)) {
				useToast.warning({
					autoClose: 6000,
					id: STOP_COORDINATE_EDIT_RADIUS_WARNING_TOAST_ID,
					message: getStopCoordinateEditRadiusWarningMessage(),
					title: STOP_COORDINATE_EDIT_RADIUS_WARNING_TOAST_TITLE,
				});
				return;
			}
		}
		form.setFieldValue('latitude', lat);
		form.setFieldValue('longitude', lng);
		mapContext.actions.handleSearch(coordinatesToSearchQuery(lat, lng));
		stopDetailContext.actions.closeCoordinatesEditor();
	}, [draft, form, mapContext.actions, stop, stopDetailContext.actions]);

	//
	// C. Render components

	return (
		<>
			<StopDetailCoordinatesMap setDraftCoords={setDraftCoords} />
			<Divider />
			<StopDetailCoordinatesSelect
				draft={draft}
				onConfirmDraft={handleConfirmDraft}
				setDraftCoords={setDraftCoords}
			/>
		</>
	);

	//
}

export function StopDetailCoordinatesModal() {
	//

	return (
		<Pane
			header={[
				<Toolbar key="stop-detail-coordinates-toolbar">
					<Label size="lg" singleLine>Editar coordenadas</Label>
					<Spacer />
				</Toolbar>,
			]}
		>
			<div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }}>
				<MapContextProvider preferenceScope={DETAIL_COORDINATES_MAP_SCOPE}>
					<StopDetailCoordinatesModalBody />
				</MapContextProvider>
			</div>
		</Pane>
	);

	//
}
