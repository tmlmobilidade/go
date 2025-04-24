import { UploadFile } from '@/components/common/UploadFile';
import { useValidationDetailContext, ValidationDetailContextProvider, ValidationDetailMode } from '@/contexts/ValidationDetail.context';
import { Button, closeModal, Combobox, DatePicker, Description, Grid, Label, openModal, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

const MODAL_ID = 'create-validation-modal';

export const OpenCreateValidationModal = () => {
	openModal({
		children: (
			<ValidationDetailContextProvider validationId={ValidationDetailMode.NEW}>
				<CreateValidationModal />
			</ValidationDetailContextProvider>
		),
		modalId: MODAL_ID,
		size: 'auto',
		withCloseButton: false,
	});
};

/* * */

export default function CreateValidationModal() {
	// A. State Management
	const validationDetailContext = useValidationDetailContext();

	//
	// B. Transform data
	const validFrom = useMemo(() => {
		if (!validationDetailContext.data.form.values.valid_from) return null;
		return Dates.fromOperationalDate(validationDetailContext.data.form.values.valid_from).js_date;
	}, [validationDetailContext.data.form.values.valid_from]);

	const validUntil = useMemo(() => {
		if (!validationDetailContext.data.form.values.valid_until) return null;
		return Dates.fromOperationalDate(validationDetailContext.data.form.values.valid_until).js_date;
	}, [validationDetailContext.data.form.values.valid_until]);

	// D. Render Components
	const renderModalHeader = () => (
		<Section gap="sm" padding="none">
			<Label size="lg">Criar validationo GTFS</Label>
			<Description>
				Carregue um arquivo GTFS para criar um novo validationo. Este será validado
				automaticamente.
			</Description>
		</Section>
	);

	const renderOperatorSelection = () => (
		<Section gap="sm" padding="none">
			<Combobox
				data={validationDetailContext.data.agencies}
				description="Selecione o operador ao qual este validationo pertence"
				label="Operador"
				{...validationDetailContext.data.form.getInputProps('agency_id')}
				fullWidth
			/>
		</Section>
	);

	const renderDateRangeSelection = () => (
		<Section padding="none">
			<Grid className={styles.datePickerGrid} columns="ab" gap="md">
				<DatePicker
					description="Data de início da vigência do validationo"
					flex={1}
					label="Data de início"
					{...validationDetailContext.data.form.getInputProps('valid_from')}
					value={validFrom}
					onChange={(date) => {
						validationDetailContext.data.form.setValues({
							valid_from: Dates.fromJSDate(date).setZone('Europe/Lisbon').operational_date,
						});
					}}
					withAsterisk
				/>
				<DatePicker
					description="Data de fim da vigência do validationo"
					label="Data de fim"
					clearable
					{...validationDetailContext.data.form.getInputProps('valid_until')}
					value={validUntil}
					onChange={(date) => {
						validationDetailContext.data.form.setValues({
							valid_until: Dates.fromJSDate(date).setZone('Europe/Lisbon').operational_date,
						});
					}}
				/>
			</Grid>
		</Section>
	);

	const renderFileUploadSection = () => (
		<Section gap="sm" padding="none">
			<UploadFile
				label="Validationo de Referencia (GO)"
				maxFileSize={5 * 1024 * 1024 * 1024} // 5GB
				onFileChange={validationDetailContext.actions.setOperationValidationFile}
			/>
			<UploadFile
				label="Validationo de Operação (Operador)"
			/>
		</Section>
	);

	const renderActionButtons = () => (
		<Grid columns="ab" gap="md">
			<Button label="Cancelar" onClick={() => closeModal(MODAL_ID)} variant="danger" fullWidth />
			<Button
				disabled={!validationDetailContext.flags.canSave}
				label="Criar validationo"
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
			{renderDateRangeSelection()}
			{renderFileUploadSection()}
			{renderActionButtons()}
		</Section>
	);
}

/* * */
