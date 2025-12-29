'use client';

/* * */

import { usePeriodAssignContext } from '@/components/periods/calendar/PeriodAssign.context';
import { usePeriodsListContext } from '@/components/periods/list/PeriodsList.context';
import { IconAlertTriangle, IconCalendar } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Alert, Button, ColorInput, ColorSwatch, Label, Radio, Section, Select, Text, TextInput, useDataAgencies } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export const ASSIGN_PERIOD_MODAL_ID = 'assign-period-modal';

/* * */

export function PeriodAssignContent() {
	//

	//
	// A. Setup variables

	const periodsListContext = usePeriodsListContext();
	const periodAssignContext = usePeriodAssignContext();
	const { options: agencyOptions } = useDataAgencies(PermissionCatalog.all.periods.scope, PermissionCatalog.all.periods.actions.update);

	const agencyPeriods = useMemo(() => {
		if (!periodAssignContext.data.form.values.agency_id) return [];

		return periodsListContext.data.raw
			.filter(period => period.agency_id === periodAssignContext.data.form.values.agency_id)
			.map(period => ({
				icon: <ColorSwatch color={period.color || '#3b82f6'} size={14} />,
				label: period.name,
				value: period._id,
			}));
	}, [periodAssignContext.data.form.values.agency_id, periodsListContext.data.raw]);

	//
	// B. Render components

	return (
		<>

			{/* Date Range Summary */}
			<Section gap="md">
				<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
					<IconCalendar />
					<Label size="md">Intervalo de Datas Selecionado</Label>
				</Section>

				<Text size="sm">
					{periodAssignContext.data.dateRangeInfo.startDate}
					{' → '}
					{periodAssignContext.data.dateRangeInfo.endDate}
					{' '}
					({periodAssignContext.data.dateRangeInfo.dayCount} {periodAssignContext.data.dateRangeInfo.dayCount === 1 ? 'dia' : 'dias'})
				</Text>
			</Section>

			{/* Agency Selection */}
			<Section gap="md">
				<Select data={agencyOptions} label="Operador" placeholder="Selecione o operador" w="100%" {...periodAssignContext.data.form.getInputProps('agency_id')} />
			</Section>

			{periodAssignContext.data.form.values.agency_id && (
				<>

					{/* Assignment Mode */}
					<Section gap="md">
						<Label size="md">Atribuir</Label>
						<Radio.Group
							{...periodAssignContext.data.form.getInputProps('assignmentMode')}
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
						{periodAssignContext.data.form.values.assignmentMode === 'existing' ? (
							<>
								<Label size="md">Selecionar Período</Label>
								{agencyPeriods.length > 0 && (
									<Select
										data={agencyPeriods}
										placeholder="Procurar..."
										w="100%"
										{...periodAssignContext.data.form.getInputProps('periodId')}
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
									{...periodAssignContext.data.form.getInputProps('newPeriodName')}
								/>

								<ColorInput
									label="Cor"
									withEyeDropper={false}
									{...periodAssignContext.data.form.getInputProps('color')}
								/>
							</>
						)}
					</Section>

					{/* Conflict Warning */}
					{periodAssignContext.data.conflictWarning && !periodAssignContext.flags.conflictAcknowledged && (
						<Section gap="md">
							<Alert color="var(--color-primary)" icon={<IconAlertTriangle />} title="Aviso de Conflito" variant="light" w="100%">
								<Section gap="md" padding="none">
									<Text size="sm">{periodAssignContext.data.conflictWarning}</Text>
									<Button
										label="Compreendo e quero continuar"
										onClick={periodAssignContext.actions.acknowledgeConflicts}
										fullWidth
									/>
								</Section>
							</Alert>
						</Section>
					)}
				</>
			)}
		</>
	);

	//
}
