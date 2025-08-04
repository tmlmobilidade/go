'use client';

/* * */

import { StopCreateContextProvider, useStopCreateContext } from '@/contexts/StopCreate.context';
import { AlertMessage, Button, closeModal, Divider, Grid, Label, MeContextProvider, openModal, Section, Text, TextInput, ValueDisplay } from '@tmlmobilidade/ui';

/* * */

export const CREATE_STOP_MODAL_ID = 'create-stop-modal';

/* * */

export const openCreateStopInfosModal = () => {
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
		size: 'auto',
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
				<Label size="lg" caps>Nova Paragem</Label>
				<Text>Introduza os dados em baixo para criar uma paragem</Text>
			</Section>

			<Divider />

			{stopCreateContext.flags.error && stopCreateContext.flags.error.name === 'StopError' && (
				<>
					<AlertMessage title={stopCreateContext.flags.error?.message ?? 'haaaaaaa'} variant="danger" />
					<Divider />
				</>
			)}

			<Section gap="sm">
				<TextInput
					label="Nome da Paragem"
					miw="100%"
					value={stopCreateContext.data.form.values.name}
				/>
				<ValueDisplay label="short name" value={stopCreateContext.data.form.values.name} />
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
