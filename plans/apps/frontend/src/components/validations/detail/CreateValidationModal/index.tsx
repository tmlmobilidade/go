import { UploadFile } from '@/components/common/UploadFile';
import { useValidationDetailContext, ValidationDetailContextProvider, ValidationDetailMode } from '@/contexts/ValidationDetail.context';
import { IconAlertCircle } from '@tabler/icons-react';
import { Button, closeModal, Description, Divider, Grid, Label, MeContextProvider, openModal, Section, Text } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

/* * */

export const CREATE_VALIDATION_MODAL_ID = 'create-validation-modal';

export const OpenCreateValidationModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<ValidationDetailContextProvider validationId={ValidationDetailMode.NEW}>
					<CreateValidationModal />
				</ValidationDetailContextProvider>
			</MeContextProvider>
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

	const renderFileUploadSection = () => (
		<Section gap="sm" padding="none">
			<UploadFile
				label="Ficheiro GTFS"
				maxFileSize={5 * 1024 * 1024 * 1024} // 5GB
				onFileChange={validationDetailContext.actions.setValidationFile}
			/>
		</Section>
	);

	const renderFeedInfoSection = () => {
		if (!validationDetailContext.data.form.values.gtfs_agency || !validationDetailContext.data.form.values.gtfs_feed_info) return null;

		return (
			<Section gap="sm" padding="none">
				<Label>Agência</Label>
				<Grid columns="abc" gap="md">
					<Section padding="none">
						<Label size="sm" caps>ID</Label>
						<Text size="base">{validationDetailContext.data.form.values.gtfs_agency.agency_id ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Nome</Label>
						<Text size="base">{validationDetailContext.data.form.values.gtfs_agency.agency_name ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>URL</Label>
						<Text size="base">{validationDetailContext.data.form.values.gtfs_agency.agency_url ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Email</Label>
						<Text size="base">{validationDetailContext.data.form.values.gtfs_agency.agency_email ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Telefone</Label>
						<Text size="base">{validationDetailContext.data.form.values.gtfs_agency.agency_phone ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>URL</Label>
						<Text size="base">{validationDetailContext.data.form.values.gtfs_agency.agency_url ?? 'N/A'}</Text>
					</Section>
				</Grid>
				<Divider />
				<Label>Feed Info</Label>
				<Grid columns="abc" gap="md">
					<Section padding="none">
						<Label size="sm" caps>Data de início</Label>
						<Text size="base">{Dates.fromOperationalDate(validationDetailContext.data.form.values.gtfs_feed_info.feed_start_date, 'Europe/Lisbon').toLocaleString(Dates.FORMATS.DATE_FULL_WITH_YEAR)}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Data de fim</Label>
						<Text size="base">{Dates.fromOperationalDate(validationDetailContext.data.form.values.gtfs_feed_info.feed_end_date, 'Europe/Lisbon').toLocaleString(Dates.FORMATS.DATE_FULL_WITH_YEAR)}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Linguagem do feed</Label>
						<Text size="base">{validationDetailContext.data.form.values.gtfs_feed_info.feed_lang?.toUpperCase() ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Email de contacto</Label>
						<Text size="base">{validationDetailContext.data.form.values.gtfs_feed_info.feed_contact_email ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>URL de contacto</Label>
						<Text size="base">{validationDetailContext.data.form.values.gtfs_feed_info.feed_contact_url ?? 'N/A'}</Text>
					</Section>
				</Grid>
			</Section>
		);
	};

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

	const renderError = () => {
		if (validationDetailContext.flags.error && validationDetailContext.flags.error.name === 'ValidationError') {
			return (
				<div className={styles.errorContainer}>
					<IconAlertCircle size={20} />
					<Text size="base">{validationDetailContext.flags.error.message}</Text>
				</div>
			);
		}
		return null;
	};

	return (
		<Section gap="lg">
			{renderError()}
			{renderModalHeader()}
			{renderFeedInfoSection()}
			{renderFileUploadSection()}
			{renderActionButtons()}
		</Section>
	);
}

/* * */
