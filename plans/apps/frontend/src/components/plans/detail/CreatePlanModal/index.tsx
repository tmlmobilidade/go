import { UploadFile } from '@/components/common/UploadFile';
import { PlanDetailContextProvider, PlanDetailMode, usePlanDetailContext } from '@/contexts/PlanDetail.context';
import { Button, closeModal, Combobox, DatePicker, Description, Grid, Label, openModal, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { useMemo } from 'react';

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

	//
	// B. Transform data
	const validFrom = useMemo(() => {
		if (!planDetailContext.data.form.values.valid_from) return null;
		return Dates.fromOperationalDate(planDetailContext.data.form.values.valid_from).js_date;
	}, [planDetailContext.data.form.values.valid_from]);

	const validUntil = useMemo(() => {
		if (!planDetailContext.data.form.values.valid_until) return null;
		return Dates.fromOperationalDate(planDetailContext.data.form.values.valid_until).js_date;
	}, [planDetailContext.data.form.values.valid_until]);

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
				{...planDetailContext.data.form.getInputProps('agency_id')}
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
					{...planDetailContext.data.form.getInputProps('valid_from')}
					value={validFrom}
					onChange={(date) => {
						planDetailContext.data.form.setValues({
							valid_from: Dates.fromJSDate(date).setZone('Europe/Lisbon').operational_date,
						});
					}}
					withAsterisk
				/>
				<DatePicker
					description="Data de fim da vigência do plano"
					label="Data de fim"
					clearable
					{...planDetailContext.data.form.getInputProps('valid_until')}
					value={validUntil}
					onChange={(date) => {
						planDetailContext.data.form.setValues({
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
				label="Plano de Referencia (GO)"
				maxFileSize={5 * 1024 * 1024 * 1024} // 5GB
				onFileChange={planDetailContext.actions.setOperationPlanFile}
			/>
			<UploadFile
				label="Plano de Operação (Operador)"
			/>
		</Section>
	);

	const renderActionButtons = () => (
		<Grid columns="ab" gap="md">
			<Button label="Cancelar" onClick={() => closeModal(MODAL_ID)} variant="danger" fullWidth />
			<Button
				disabled={!planDetailContext.flags.canSave}
				label="Criar plano"
				onClick={planDetailContext.actions.savePlan}
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
