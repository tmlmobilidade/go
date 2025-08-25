'use client';

/* * */

import { useStopCreateContext } from '@/contexts/StopCreate.context';
import { AlertMessage, Button, CoordinatesInput, Divider, Grid, Label, Section, Text } from '@tmlmobilidade/ui';

import CreateStopStep1Map from '../CreateStopStep1Map';

/* * */

export default function CreateStopStep1() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();

	//

	const handleSelectInMap = (value: [number, number]) => {
		stopCreateContext.data.form.setFieldValue('latitude', value[0]);
		stopCreateContext.data.form.setFieldValue('longitude', value[1]);
	};

	// const selectedCoordinatesMapData = useMemo(() => {
	// 	if (stopCreateContext.data.form.values.latitude && stopCreateContext.data.form.values.longitude) {
	// 		const geojson = {
	// 			geometry: {
	// 				coordinates: [stopCreateContext.data.form.values.longitude, stopCreateContext.data.form.values.latitude],
	// 				type: 'Point',
	// 			},
	// 			properties: {},
	// 			type: 'Feature',
	// 		};

	// 		return geojson;
	// 	}
	// 	return null;
	// }, [stopCreateContext.data.form.values]);

	//
	// B. Handle actions

	// const handleMapClick = (event) => {
	// 	stopCreateContext.actions.createStopCoordinates(event.lngLat.lat, event.lngLat.lng);
	// };

	//
	// C. Render Components

	return (
		<>

			<Section gap="xs">
				<Text>Selecione a localização da paragem que pretende criar:</Text>
			</Section>

			<Divider />

			{stopCreateContext.flags.error && stopCreateContext.flags.error.name === 'StopError' && (
				<>
					<AlertMessage title={stopCreateContext.flags.error?.message ?? 'haaaaaaa'} variant="danger" />
					<Divider />
				</>
			)}

			<CreateStopStep1Map />

			<Divider />

			<Section gap="md">
				<CoordinatesInput
					onChange={handleSelectInMap}
					value={[stopCreateContext.data.form.values.latitude, stopCreateContext.data.form.values.longitude]}
				/>
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
					{/* <Button
						label="Próximo passo"
						loading={stopCreateContext.flags.loading}
						onClick={openCreateStopInfosModal}
					/> */}
				</Grid>
			</Section>

		</>
	);
}
