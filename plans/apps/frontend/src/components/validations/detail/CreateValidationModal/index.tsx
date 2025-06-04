import { UploadFile } from '@/components/common/UploadFile';
import { useValidationDetailContext, ValidationDetailContextProvider, ValidationDetailMode } from '@/contexts/ValidationDetail.context';
import { Button, closeModal, Combobox, Description, Grid, Label, openModal, Section } from '@tmlmobilidade/ui';

/* * */

export const CREATE_VALIDATION_MODAL_ID = 'create-validation-modal';

export const OpenCreateValidationModal = () => {
	openModal({
		children: (
			<ValidationDetailContextProvider validationId={ValidationDetailMode.NEW}>
				<CreateValidationModal />
			</ValidationDetailContextProvider>
		),
		modalId: CREATE_VALIDATION_MODAL_ID,
		size: 'auto',
		withCloseButton: false,
	});
};

/* * */

export default function CreateValidationModal() {
	// A. State Management
	const validationDetailContext = useValidationDetailContext();

	// D. Render Components
	const renderModalHeader = () => (
		<Section gap="sm" padding="none">
			<Label size="lg">Criar validação GTFS</Label>
			<Description>
				Carregue um arquivo GTFS para efetuar a validação do mesmo.
			</Description>
		</Section>
	);

	const renderOperatorSelection = () => (
		<Section gap="sm" padding="none">
			<Combobox
				data={validationDetailContext.data.agencies}
				description="Selecione o operador ao qual este validação pertence"
				label="Operador"
				{...validationDetailContext.data.form.getInputProps('agency_id')}
				fullWidth
			/>
		</Section>
	);

	const renderFileUploadSection = () => (
		<Section gap="sm" padding="none">
			<UploadFile
				label="Ficheiro GTFS"
				maxFileSize={5 * 1024 * 1024 * 1024} // 5GB
				onFileChange={validationDetailContext.actions.setValidationFile}
			/>
		</Section>
	);

	const renderActionButtons = () => (
		<Grid columns="ab" gap="md">
			<Button label="Cancelar" onClick={() => closeModal(CREATE_VALIDATION_MODAL_ID)} variant="danger" fullWidth />
			<Button
				disabled={!validationDetailContext.flags.canSave || validationDetailContext.flags.isSaving}
				label="Criar validação"
				loading={validationDetailContext.flags.isSaving}
				onClick={validationDetailContext.actions.saveValidation}
				variant="primary"
				fullWidth
			/>
		</Grid>
	);

	return (

		<Section gap="lg">
			{renderModalHeader()}
			{renderOperatorSelection()}
			{renderFileUploadSection()}
			{renderActionButtons()}
		</Section>
	);
}

/* * */
