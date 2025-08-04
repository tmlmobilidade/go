'use client';

import { MapViewStops } from '@/components/Map/MapViewStops';
/* * */

import { StopCreateContextProvider, useStopCreateContext } from '@/contexts/StopCreate.context';
import { AlertMessage, Button, closeModal, Divider, Grid, Label, MapOptionsContextProvider, MapView, MeContextProvider, openModal, Section, Text, TextInput } from '@tmlmobilidade/ui';

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
	// B. Render Components

	return (
		<Section padding="lg">
			<Section gap="xs">
				<Label size="lg" caps>Nova Paragem</Label>
				<Text>selecione no mapa a localização da paragem</Text>
			</Section>

			<Divider />

			{stopCreateContext.flags.error && stopCreateContext.flags.error.name === 'StopError' && (
				<>
					<AlertMessage title={stopCreateContext.flags.error?.message ?? 'haaaaaaa'} variant="danger" />
					<Divider />
				</>
			)}

			<Section gap="md">
				<MapView>
					<MapViewStops />
				</MapView>
			</Section>
			<Divider />

			<Section gap="md">
				<TextInput
					label="latitude da Paragem"
					miw="100%"
					value={stopCreateContext.data.form.values.latitude}
				/>
				<TextInput
					label="Longitude da Paragem"
					miw="100%"
					value={stopCreateContext.data.form.values.longitude}
				/>
			</Section>
			<Divider />

			<Section>
				<Grid columns="ab" gap="md">
					<Button
						disabled={stopCreateContext.flags.loading}
						label="Cancelar"
						onClick={() => closeModal(CREATE_STOP_MODAL_ID)}
						variant="secondary"
					/>
					<Button
						disabled={!stopCreateContext.flags.can_create}
						label="Proxima pagina"
						loading={stopCreateContext.flags.loading}
						onClick={openCreateStopInfosModal}
					/>
				</Grid>
			</Section>
		</Section>
	);
}
