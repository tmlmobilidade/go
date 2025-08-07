'use client';

/* * */

import { StopCreateContextProvider, useStopCreateContext } from '@/contexts/StopCreate.context';
import { AlertMessage, Button, Divider, Grid, Label, MeContextProvider, openModal, Section, Text, TextInput } from '@tmlmobilidade/ui';

import { openCreateStopComfirmInfosModal } from '../CreateStopComfirm';
import { openCreateStopMapModal } from '../CreateStopMap';

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
					onChange={event => stopCreateContext.actions.abbreviationsShortName(event.currentTarget.value)}
					value={stopCreateContext.data.form.values.name}
				/>
				<TextInput
					label="nome curto"
					miw="100%"
					readOnly={true}
					value={stopCreateContext.data.form.values.short_name}
				/>
			</Section>
			<Divider />

			<Section>
				<Grid columns="ab" gap="md">
					<Button
						disabled={stopCreateContext.flags.loading}
						label="Voltar"
						onClick={openCreateStopMapModal}
						variant="secondary"
					/>
					<Button
						label="Próximo passo"
						loading={stopCreateContext.flags.loading}
						onClick={openCreateStopComfirmInfosModal}
					/>
				</Grid>
			</Section>
		</>
	);
}
