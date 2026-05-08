'use client';

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { ContextFormController, DateTimeInput, Divider, Grid, Label, Section, Text, useContextFormWatch, useMeContext } from '@tmlmobilidade/ui';

/* * */

export function AlertCreateStepDates() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const alertCreateContext = useAlertCreateContext();

	const agencyIdValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'agency_id' });
	const referenceTypeValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'reference_type' });

	//
	// B. Transform data

	const hasPermissionToEdit = meContext.actions.hasPermissionResource([
		{
			action: PermissionCatalog.all.alerts.actions.update_dates,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: agencyIdValue,
		},
		{
			action: PermissionCatalog.all.alerts.actions.update_dates,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: referenceTypeValue,
		},
	]);

	//
	// C. Render components

	return (
		<>

			<Section gap="sm">
				<Label size="lg" caps>Período de Vigência</Label>
				<Text size="sm" weight="medium">Período em que o alerta é válido. Distinto da visibilidade. O alerta pode estar visível mas não ser ainda válido (ex: um alerta para um corte de estrada é vísível uma semana antes, mas o corte em si é apenas durante 2 dias).</Text>
				<Grid columns="ab" gap="md">
					<ContextFormController
						control={alertCreateContext.form.instance.control}
						name="active_period_start_date"
						render={({ field, fieldState }) => (
							<DateTimeInput
								error={fieldState.error?.message}
								label="Data de Início"
								onChange={field.onChange}
								readOnly={!hasPermissionToEdit}
								value={field.value}
							/>
						)}
					/>
					<ContextFormController
						control={alertCreateContext.form.instance.control}
						name="active_period_end_date"
						render={({ field, fieldState }) => (
							<DateTimeInput
								error={fieldState.error?.message}
								label="Data de Fim"
								onChange={field.onChange}
								readOnly={!hasPermissionToEdit}
								value={field.value}
								clearable
							/>
						)}
					/>
				</Grid>
			</Section>

			<Divider />

			<Section gap="sm">
				<Label size="lg" caps>Agendamento</Label>
				<Text size="sm" weight="medium">É possível agendar a permanência do alerta nos canais digitais. A visibilidade do alerta é diferente do seu período de vigência.</Text>
				<Grid columns="ab" gap="md">
					<ContextFormController
						control={alertCreateContext.form.instance.control}
						name="publish_start_date"
						render={({ field, fieldState }) => (
							<DateTimeInput
								error={fieldState.error?.message}
								label="Data de Início"
								onChange={field.onChange}
								readOnly={!hasPermissionToEdit}
								value={field.value}
								clearable
							/>
						)}
					/>
					<ContextFormController
						control={alertCreateContext.form.instance.control}
						name="publish_end_date"
						render={({ field, fieldState }) => (
							<DateTimeInput
								error={fieldState.error?.message}
								label="Data de Fim"
								onChange={field.onChange}
								readOnly={!hasPermissionToEdit}
								value={field.value}
								clearable
							/>
						)}
					/>
				</Grid>
			</Section>

		</>
	);
}
