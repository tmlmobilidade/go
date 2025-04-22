import { UploadFile } from '@/components/common/UploadFile';
import { PlanDetailContextProvider, PlanDetailMode, usePlanDetailContext } from '@/contexts/PlanDetail.context';
import { Button, closeModal, Combobox, DatePicker, Description, Grid, Label, openModal, Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

const MODAL_ID = 'create-plan-modal';

export const OpenCreatePlanModal = () => {
	openModal({
		children: (
			<PlanDetailContextProvider planId={PlanDetailMode.NEW}>
				<CreatePlanModal />
			</PlanDetailContextProvider>
		),
		modalId: MODAL_ID,
		size: 'auto',
		withCloseButton: false,
	});
};

/* * */

export default function CreatePlanModal() {
	// A. State Management
	const planDetailContext = usePlanDetailContext();

	// D. Render Components
	const renderModalHeader = () => (
		<Section gap="sm" padding="none">
			<Label size="lg">Criar plano GTFS</Label>
			<Description>
				Carregue um arquivo GTFS para criar um novo plano. Este será validado
				automaticamente.
			</Description>
		</Section>
	);

	const renderOperatorSelection = () => (
		<Section gap="sm" padding="none">
			<Combobox
				data={planDetailContext.data.agencies}
				description="Selecione o operador ao qual este plano pertence"
				label="Operador"
				onChange={planDetailContext.data.form.setFieldValue('agency_id')}
				value={planDetailContext.data.form.getValues().agency_id}
				fullWidth
			/>
		</Section>
	);

	const renderDateRangeSelection = () => (
		<Section padding="none">
			<Grid className={styles.datePickerGrid} columns="ab" gap="md">
				<DatePicker
					description="Data de início da vigência do plano"
					flex={1}
					label="Data de início"
					withAsterisk
					{...planDetailContext.data.form.getInputProps('valid_from')}
				/>
				<DatePicker
					description="Data de fim da vigência do plano"
					flex={1}
					label="Data de fim"
					withAsterisk
					{...planDetailContext.data.form.getInputProps('valid_until')}
				/>
			</Grid>
		</Section>
	);

	const renderFileUploadSection = () => (
		<Section gap="sm" padding="none">
			<UploadFile
				label="Arquivo"
				maxFileSize={5 * 1024 * 1024 * 1024} // 5GB
			/>
		</Section>
	);

	const renderActionButtons = () => (
		<Grid columns="ab" gap="md">
			<Button label="Cancelar" onClick={() => closeModal(MODAL_ID)} variant="danger" fullWidth />
			<Button label="Criar plano" onClick={planDetailContext.actions.createPlan} variant="primary" fullWidth />
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
