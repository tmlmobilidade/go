'use client';

import { useAnnotationsAgenciesData } from '@/components/annotations/shared/use-annotations-agencies-data';
import { useYearPeriodsRawData } from '@/components/year-periods/shared/use-year-periods-raw-data';
import { IconAlertTriangle, IconCalendar } from '@tabler/icons-react';
import { Alert, Button, ColorInput, ColorSwatch, Label, MultiSelect, Radio, Section, Select, StandardFormController, Text, TextInput } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useYearPeriodsAssignFormContext } from '../YearPeriodsAssignForm.context';

/* * */

export function YearPeriodsAssignContent() {
	//

	//
	// A. Setup variables

	const { acknowledgeConflicts, conflictWarning, dateRangeInfo, form, isConflictAcknowledged, values } = useYearPeriodsAssignFormContext();

	const { options: agencyOptions } = useAnnotationsAgenciesData();

	const { data: yearPeriodsData } = useYearPeriodsRawData();

	//
	// B. Transform data

	const yearPeriodOptions = useMemo(() => {
		// Skip if no agencies are selected
		if (!values.agency_ids?.length) return [];
		// Keep only the year periods with at least one of the selected agencies
		const selectedAgenciesSet = new Set(values.agency_ids);
		return yearPeriodsData
			.filter(yearPeriod => yearPeriod.agency_ids?.some(agencyId => selectedAgenciesSet.has(agencyId)))
			.map(yearPeriod => ({
				icon: <ColorSwatch color={yearPeriod.color || '#3b82f6'} size={14} />,
				label: yearPeriod.name,
				value: yearPeriod._id,
			}));
	}, [values.agency_ids, yearPeriodsData]);

	//
	// C. Render components

	return (
		<>

			<Section gap="md">
				<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
					<IconCalendar />
					<Label size="md">Intervalo de Datas Selecionado</Label>
				</Section>
				<Text size="sm">
					{dateRangeInfo.startDate}
					{' → '}
					{dateRangeInfo.endDate}
					{' '}
					({dateRangeInfo.dayCount} {dateRangeInfo.dayCount === 1 ? 'dia' : 'dias'})
				</Text>
			</Section>

			<Section gap="md">
				<StandardFormController
					control={form.control}
					name="agency_ids"
					render={({ field, fieldState }) => (
						<MultiSelect
							data={agencyOptions}
							error={fieldState.error?.message}
							label="Operadores"
							onBlur={field.onBlur}
							onChange={field.onChange}
							placeholder="Selecione os operadores"
							value={field.value ?? []}
						/>
					)}
				/>
			</Section>

			{values.agency_ids && values.agency_ids.length > 0 && (
				<>

					<Section gap="md">
						<Label size="md">Atribuir</Label>
						<StandardFormController
							control={form.control}
							name="assignmentMode"
							render={({ field }) => (
								<Radio.Group onChange={field.onChange} value={field.value}>
									<Radio label="Atribuir a Período Existente" value="existing" />
									<Radio label="Criar Novo Período" value="create" />
								</Radio.Group>
							)}
						/>
					</Section>

					<Section gap="md">
						{values.assignmentMode === 'existing' ? (
							<>
								<Label size="md">Selecionar Período</Label>
								{yearPeriodOptions.length > 0 && (
									<StandardFormController
										control={form.control}
										name="yearPeriodId"
										render={({ field, fieldState }) => (
											<Select
												data={yearPeriodOptions}
												error={fieldState.error?.message}
												onBlur={field.onBlur}
												onChange={field.onChange}
												placeholder="Procurar..."
												value={field.value ?? ''}
											/>
										)}
									/>
								)}
								{yearPeriodOptions.length === 0 && (
									<Alert variant="warning">
										<Text size="sm">Não há períodos disponíveis para este operador. Por favor, crie um novo período.</Text>
									</Alert>
								)}
							</>
						) : (
							<>
								<Label size="md">Nome</Label>
								<StandardFormController
									control={form.control}
									name="newPeriodName"
									render={({ field, fieldState }) => (
										<TextInput
											error={fieldState.error?.message}
											onBlur={field.onBlur}
											onChange={e => field.onChange(e.currentTarget.value)}
											placeholder="Ex: Período Escolar 2025"
											value={field.value ?? ''}
										/>
									)}
								/>
								<StandardFormController
									control={form.control}
									name="color"
									render={({ field, fieldState }) => (
										<ColorInput
											error={fieldState.error?.message}
											label="Cor"
											onBlur={field.onBlur}
											onChange={field.onChange}
											value={field.value ?? ''}
											withEyeDropper={false}
										/>
									)}
								/>
							</>
						)}
					</Section>

					{conflictWarning && !isConflictAcknowledged && (
						<Section gap="md">
							<Alert color="var(--color-primary)" icon={<IconAlertTriangle />} title="Aviso de Conflito" variant="light" w="100%">
								<Section gap="md" padding="none">
									<Text size="sm">{conflictWarning}</Text>
									<Button label="Compreendo e quero continuar" onClick={acknowledgeConflicts} fullWidth />
								</Section>
							</Alert>
						</Section>
					)}

				</>
			)}
		</>
	);
}
