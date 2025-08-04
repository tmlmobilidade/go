'use client';

/* * */

import { StopCreateContextProvider, useStopCreateContext } from '@/contexts/StopCreate.context';
import { AlertMessage, Divider, Label, MeContextProvider, openModal, Section, Text, ValueDisplay } from '@tmlmobilidade/ui';

/* * */

export const CREATE_STOP_MODAL_ID = 'create-stop-modal';

/* * */

export const openCreateStopModal = () => {
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
					<AlertMessage title={stopCreateContext.flags.error?.message ?? 'odjisodj'} variant="danger" />
					<Divider />
				</>
			)}

			{stopCreateContext.data.form.values.name && (
				<>
					<Section gap="sm">
						<ValueDisplay label="Nome da Paragem" value={stopCreateContext.data.form.values.name} />
					</Section>
					<Divider />
				</>
			)}

			{stopCreateContext.data.form.values.latitude && stopCreateContext.data.form.values.longitude && (
				<>
					<Section gap="sm">
						<ValueDisplay label="latitude da Paragem" value={stopCreateContext.data.form.values.latitude} />
						<ValueDisplay label="Longitude da Paragem" value={stopCreateContext.data.form.values.longitude} />
					</Section>
					<Divider />
				</>
			)}
		</>
	);
}
