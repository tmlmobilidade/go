'use client';

/* * */

import { StopCreateContextProvider, useStopCreateContext } from '@/contexts/StopCreate.context';
import { AlertMessage, Button, closeModal, Divider, Grid, Label, MeContextProvider, openModal, Section, Text, TextInput } from '@tmlmobilidade/ui';

/* * */

export const CREATE_STOP_MODAL_ID = 'create-stop-modal';

/* * */

export const openCreateStopComfirmInfosModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<StopCreateContextProvider>
					<CreateStopModal />
				</StopCreateContextProvider>
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
	// B. Render Components

	return (
		<>
			<Section gap="xs">
				<Label size="lg" caps>Comfirmação de dados</Label>
				<Text>comfirme os dados abaixo para comfirmar a criação da paragem</Text>
			</Section>

			<Divider />

			{stopCreateContext.flags.error && stopCreateContext.flags.error.name === 'StopError' && (
				<>
					<AlertMessage title={stopCreateContext.flags.error?.message ?? 'haaaaaaa'} variant="danger" />
					<Divider />
				</>
			)}

			<Section gap="sm">
				<Grid columns="abc">
					<TextInput
						label="Nome da Paragem"
						miw="100%"
						onChange={event => stopCreateContext.actions.abbreviationsShortName(event.currentTarget.value)}
						value={stopCreateContext.data.form.values.name}
					/>
					<TextInput
						label="nome curto"
						miw="100%"
						readOnly={true}
						value={stopCreateContext.data.form.values.short_name}
					/>
				</Grid>
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
						label="Criar Paragem"
						loading={stopCreateContext.flags.loading}
						onClick={stopCreateContext.actions.createStop}
					/>
				</Grid>
			</Section>
		</>
	);
}
