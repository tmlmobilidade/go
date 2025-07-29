'use client';

/* * */

import { AgencyDisplay } from '@/components/common/AgencyDisplay';
import { FeedInfoDisplay } from '@/components/common/FeedInfoDisplay';
import { useValidationsCreateContext, ValidationsCreateContextProvider } from '@/contexts/ValidationsCreate.context';
import { AlertMessage, Button, closeModal, Divider, FileUpload, Grid, Label, MeContextProvider, openModal, Section, Text } from '@tmlmobilidade/ui';

/* * */

export const CREATE_VALIDATION_MODAL_ID = 'create-validation-modal';

/* * */

export const openCreateValidationModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<ValidationsCreateContextProvider>
					<CreateValidationModal />
				</ValidationsCreateContextProvider>
			</MeContextProvider>
		),
		closeOnClickOutside: false,
		modalId: CREATE_VALIDATION_MODAL_ID,
		padding: 0,
		size: 'auto',
		withCloseButton: false,
	});
};

/* * */

export default function CreateValidationModal() {
	//

	//
	// A. Setup variables

	const validationsCreateContext = useValidationsCreateContext();

	//
	// B. Render Components

	return (
		<>

			<Section gap="xs">
				<Label size="lg" caps>Nova Validação GTFS</Label>
				<Text>Selecione um arquivo GTFS para iniciar a validação.</Text>
			</Section>

			<Divider />

			{validationsCreateContext.flags.error && validationsCreateContext.flags.error.name === 'ValidationError' && (
				<>
					<AlertMessage title={validationsCreateContext.flags.error?.message ?? 'odjisodj'} variant="danger" />
					<Divider />
				</>
			)}

			{validationsCreateContext.data.form.values.gtfs_agency && (
				<>
					<Section gap="sm">
						<Label size="lg">agency.txt</Label>
						<AgencyDisplay data={validationsCreateContext.data.form.values.gtfs_agency} />
					</Section>
					<Divider />
				</>
			)}

			{validationsCreateContext.data.form.values.gtfs_feed_info && (
				<>
					<Section gap="sm">
						<Label size="lg">feed_info.txt</Label>
						<FeedInfoDisplay data={validationsCreateContext.data.form.values.gtfs_feed_info} />
					</Section>
					<Divider />
				</>
			)}

			<Section>
				<FileUpload
					accept="application/zip"
					label="Selecionar Arquivo GTFS"
					maxFileSize={5 * 1024 * 1024 * 1024} // 5 GB
					onFileChange={validationsCreateContext.actions.setValidationFile}
				/>
			</Section>

			<Divider />

			<Section>
				<Grid columns="ab" gap="md">
					<Button
						disabled={validationsCreateContext.flags.loading}
						label="Cancelar"
						onClick={() => closeModal(CREATE_VALIDATION_MODAL_ID)}
						variant="secondary"
					/>
					<Button
						disabled={!validationsCreateContext.flags.can_create}
						label="Criar validação"
						loading={validationsCreateContext.flags.loading}
						onClick={validationsCreateContext.actions.createValidation}
					/>
				</Grid>
			</Section>

		</>
	);

	//
}
