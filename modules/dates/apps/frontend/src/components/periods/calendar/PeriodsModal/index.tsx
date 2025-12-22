'use client';

/* * */

import { AgencySelect } from '@/components/common/AgencySelect';
import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { PeriodsAssignContextProvider, usePeriodsAssignContext } from '@/contexts/PeriodsAssign.context';
import { PeriodsListContextProvider, usePeriodsListContext } from '@/contexts/PeriodsList.context';
import { IconAlertTriangle, IconCalendar } from '@tabler/icons-react';
import { Dates } from '@tmlmobilidade/dates';
import { Alert, Button, closeModal, ColorInput, ColorSwatch, Combobox, Label, openModal, Radio, Section, Text, TextInput } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export const ASSIGN_PERIOD_MODAL_ID = 'assign-period-modal';

/* * */

interface AssignPeriodModalProps {
	dateRange: {
		end: Dates
		start: Dates
	}
}

/* * */

export const openAssignPeriodModal = (dateRange: AssignPeriodModalProps['dateRange'], clearSelection: () => void) => {
	openModal({
		children: (
			<AgenciesContextProvider>
				<PeriodsListContextProvider>
					<PeriodsAssignContextProvider dateRange={dateRange}>
						<AssignPeriodModal />
					</PeriodsAssignContextProvider>
				</PeriodsListContextProvider>
			</AgenciesContextProvider>
		),
		modalId: ASSIGN_PERIOD_MODAL_ID,
		onClose: () => {
			// Defer clearSelection until after render completes
			setTimeout(clearSelection, 0);
		},
		size: 'lg',
		title: 'Atribuir período ao intervalo de datas',
		withCloseButton: true,
	});
};

/* * */

function AssignPeriodModal() {
	//

	//
	// A. Setup variables

	const periodsListContext = usePeriodsListContext();
	const periodsAssignContext = usePeriodsAssignContext();

	//
	// B. Get periods for selected agency

	const agencyPeriods = useMemo(() => {
		if (!periodsAssignContext.data.form.values.agency_id) return [];

		return periodsListContext.data.all
			.filter(period => period.agency_id === periodsAssignContext.data.form.values.agency_id)
			.map(period => ({
				icon: <ColorSwatch color={period.color || '#3b82f6'} size={14} />,
				label: period.name,
				value: period._id,
			}));
	}, [periodsAssignContext.data.form.values.agency_id, periodsListContext.data.all]);

	//
	// C. Handle actions

	const handleCloseModal = () => {
		closeModal(ASSIGN_PERIOD_MODAL_ID);
	};

	//
	// D. Render components

	return (
		<>

			{/* Date Range Summary */}
			<Section gap="md">
				<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
					<IconCalendar />
					<Label size="md">Intervalo de Datas Selecionado</Label>
				</Section>

				<Text size="sm">
					{periodsAssignContext.data.dateRangeInfo.startDate}
					{' → '}
					{periodsAssignContext.data.dateRangeInfo.endDate}
					{' '}
					({periodsAssignContext.data.dateRangeInfo.dayCount} {periodsAssignContext.data.dateRangeInfo.dayCount === 1 ? 'dia' : 'dias'})
				</Text>
			</Section>

			{/* Agency Selection */}
			<Section gap="md">
				<AgencySelect label="Operador" {...periodsAssignContext.data.form.getInputProps('agency_id')} />
			</Section>

			{periodsAssignContext.data.form.values.agency_id && (
				<>

					{/* Assignment Mode */}
					<Section gap="md">
						<Label size="md">Atribuir</Label>
						<Radio.Group
							{...periodsAssignContext.data.form.getInputProps('assignmentMode')}
						>
							<Radio
								label="Atribuir a Período Existente"
								value="existing"
							/>
							<Radio
								label="Criar Novo Período"
								value="create"
							/>
						</Radio.Group>
					</Section>

					{/* Conditional Input based on mode */}
					<Section gap="md">
						{periodsAssignContext.data.form.values.assignmentMode === 'existing' ? (
							<>
								<Label size="md">Selecionar Período</Label>
								{agencyPeriods.length > 0 && (
									<Combobox
										data={agencyPeriods}
										placeholder="Procurar..."
										fullWidth
										{...periodsAssignContext.data.form.getInputProps('periodId')}
									/>
								)}
								{agencyPeriods.length === 0 && (
									<Alert variant="warning">
										<Text size="sm">
											Não há períodos disponíveis para este operador. Por favor, crie um novo período.
										</Text>
									</Alert>
								)}
							</>
						) : (
							<>
								<Label size="md">Nome</Label>
								<TextInput
									placeholder="Ex: Período Escolar 2025"
									w="100%"
									{...periodsAssignContext.data.form.getInputProps('newPeriodName')}
								/>

								<ColorInput
									label="Cor"
									withEyeDropper={false}
									{...periodsAssignContext.data.form.getInputProps('color')}
								/>
							</>
						)}
					</Section>

					{/* Conflict Warning */}
					{periodsAssignContext.data.conflictWarning && !periodsAssignContext.flags.conflictAcknowledged && (
						<Section gap="md">
							<Alert color="var(--color-primary)" icon={<IconAlertTriangle />} title="Aviso de Conflito" variant="light" w="100%">
								<Section gap="md" padding="none">
									<Text size="sm">{periodsAssignContext.data.conflictWarning}</Text>
									<Button
										label="Compreendo e quero continuar"
										onClick={periodsAssignContext.actions.acknowledgeConflicts}
										fullWidth
									/>
								</Section>
							</Alert>
						</Section>
					)}
				</>
			)}

			{/* Actions */}
			<Section flexDirection="row" gap="md">
				<Button
					disabled={periodsAssignContext.flags.loading}
					label="Cancelar"
					onClick={handleCloseModal}
					variant="secondary"
					fullWidth
				/>
				<Button
					disabled={!periodsAssignContext.data.canSubmit || periodsAssignContext.flags.loading}
					label="Atribuir"
					loading={periodsAssignContext.flags.loading}
					onClick={periodsAssignContext.actions.handleAssign}
					variant="primary"
					fullWidth
				/>
			</Section>
		</>
	);

	//
}
