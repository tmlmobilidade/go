'use client';

import { MapViewStops } from '@/components/Map/MapViewStops';
/* * */

import CoordinatesInput from '@/components/CoordinatesInput';
import { StopCreateContextProvider, useStopCreateContext } from '@/contexts/StopCreate.context';
import { AlertMessage, Button, Divider, Grid, Label, MapOptionsContextProvider, MeContextProvider, openModal, Section, Text } from '@tmlmobilidade/ui';
import { Layer, Source } from '@vis.gl/react-maplibre';
import { useMemo } from 'react';

import { openCreateStopInfosModal } from '../CreateStopName';

/* * */

export const CREATE_STOP_MODAL_ID = 'create-stop-modal';

/* * */

export const openCreateStopMapModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<MapOptionsContextProvider>
					<StopCreateContextProvider>
						<CreateStopModal />
					</StopCreateContextProvider>
				</MapOptionsContextProvider>
			</MeContextProvider>
		),
		closeOnClickOutside: false,
		modalId: CREATE_STOP_MODAL_ID,
		padding: 0,
		radius: 15,
		size: 'xl',
		withCloseButton: false,
	});
};

/* * */

export default function CreateStopModal() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();

	//

	const handleSelectInMap = (value: [number, number]) => {
		stopCreateContext.data.form.setFieldValue('latitude', value[0]);
		stopCreateContext.data.form.setFieldValue('longitude', value[1]);
	};

	const selectedCoordinatesMapData = useMemo(() => {
		if (stopCreateContext.data.form.values.latitude && stopCreateContext.data.form.values.longitude) {
			const geojson = {
				geometry: {
					coordinates: [stopCreateContext.data.form.values.longitude, stopCreateContext.data.form.values.latitude],
					type: 'Point',
				},
				properties: {},
				type: 'Feature',
			};

			return geojson;
		}
		return null;
	}, [stopCreateContext.data.form.values]);

	//
	// B. Hnadle actions
	const handleMapClick = (event) => {
		stopCreateContext.actions.createStopCoordinates(event.lngLat.lat, event.lngLat.lng);
	};

	//
	// C. Render Components

	return (
		<Section padding="lg">
			<Section gap="xs">
				<Label size="lg" caps>Nova Paragem</Label>
				<Text>selecione no mapa a localização da paragem que pretende criar</Text>
			</Section>

			<Divider />

			{stopCreateContext.flags.error && stopCreateContext.flags.error.name === 'StopError' && (
				<>
					<AlertMessage title={stopCreateContext.flags.error?.message ?? 'haaaaaaa'} variant="danger" />
					<Divider />
				</>
			)}

			<Section gap="md">
				<MapViewStops onClick={handleMapClick}>
					{/* @ts-expect-error: 1234567890 */}
					<Source data={selectedCoordinatesMapData} generateId={true} id="selected-coordinates" type="geojson">
						<Layer
							id="selected-coordinates"
							source="selected-coordinates"
							type="circle"
							paint={{
								'circle-color': ['case', ['boolean', ['feature-state', 'selected'], false], '#EE4B2B', '#ff0000'],
								'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, ['case', ['boolean', ['feature-state', 'selected'], false], 5, 1], 10, ['case', ['boolean', ['feature-state', 'selected'], false], 20, 10]],
								'circle-stroke-color': '#000000',
								'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 16, 0.8, 26, 5],
							}}
						/>
					</Source>
				</MapViewStops>
			</Section>
			<Divider />

			<Section gap="md">
				<Grid columns="ab" gap="sm">
					<CoordinatesInput
						label1="Latitude"
						label2="Longitude"
						onChange={handleSelectInMap}
						value={[stopCreateContext.data.form.values.latitude, stopCreateContext.data.form.values.longitude]}
					/>
				</Grid>
			</Section>
			<Divider />

			<Section>
				<Grid columns="ab" gap="md">
					<Button
						disabled={stopCreateContext.flags.loading}
						label="Cancelar"
						onClick={stopCreateContext.actions.closeCreateStopModalAndReset}
						variant="secondary"
					/>
					<Button
						label="Próximo passo"
						loading={stopCreateContext.flags.loading}
						onClick={openCreateStopInfosModal}
					/>
				</Grid>
			</Section>
		</Section>
	);
}
