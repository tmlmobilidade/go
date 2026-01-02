'use client';

/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { DateTimeInput, Divider, Grid, Label, Section, Text, useMeContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function AlertCreateStepDates() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const alertCreateContext = useAlertCreateContext();

	//
	// B. Transform data

	const hasPermissionToEdit = useMemo(() => {
		const canEditThisAgency = meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.alerts.actions.update_dates,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertCreateContext.data.form.getValues().agency_id,
		});
		const canEditThisReferenceType = meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.alerts.actions.update_dates,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertCreateContext.data.form.getValues().reference_type,
		});
		// User can edit dates if they have permission
		// for the agency and reference type.
		return canEditThisAgency && canEditThisReferenceType;
	}, [
		meContext.data.user?.permissions,
		alertCreateContext.data.form.getValues().agency_id,
		alertCreateContext.data.form.getValues().reference_type,
	]);

	//
	// C. Render components

	return (
		<>

			<Section gap="sm">
				<Label size="lg" caps>Período de Vigência</Label>
				<Text size="sm" weight="medium">Período em que o alerta é válido. Distinto da visibilidade. O alerta pode estar visível mas não ser ainda válido (ex: um alerta para um corte de estrada é vísível uma semana antes, mas o corte em si é apenas durante 2 dias).</Text>
				<Grid columns="ab" gap="md">
					<DateTimeInput
						key={alertCreateContext.data.form.key('active_period_start_date')}
						label="Data de Início"
						readOnly={!hasPermissionToEdit}
						{...alertCreateContext.data.form.getInputProps('active_period_start_date')}
					/>
					<DateTimeInput
						key={alertCreateContext.data.form.key('active_period_end_date')}
						label="Data de Fim"
						readOnly={!hasPermissionToEdit}
						clearable
						{...alertCreateContext.data.form.getInputProps('active_period_end_date')}
					/>
				</Grid>
			</Section>

			<Divider />

			<Section gap="sm">
				<Label size="lg" caps>Agendamento</Label>
				<Text size="sm" weight="medium">É possível agendar a permanência do alerta nos canais digitais. A visibilidade do alerta é diferente do seu período de vigência.</Text>
				<Grid columns="ab" gap="md">
					<DateTimeInput
						key={alertCreateContext.data.form.key('publish_start_date')}
						label="Data de Início"
						readOnly={!hasPermissionToEdit}
						clearable
						{...alertCreateContext.data.form.getInputProps('publish_start_date')}
					/>
					<DateTimeInput
						key={alertCreateContext.data.form.key('publish_end_date')}
						label="Data de Fim"
						readOnly={!hasPermissionToEdit}
						clearable
						{...alertCreateContext.data.form.getInputProps('publish_end_date')}
					/>
				</Grid>
			</Section>

		</>
	);
}
