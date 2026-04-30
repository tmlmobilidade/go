'use client';

/* * */

import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Collapsible, DateTimeInput, Divider, Grid, Label, Section, Text, useMeContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function AlertDetailSectionDates() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const alertDetailContext = useAlertDetailContext();

	//
	// B. Transform data

	const hasPermissionToEdit = useMemo(() => {
		const canEditThisAgency = meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.alerts.actions.update_dates,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertDetailContext.data.alert.agency_id,
		});
		const canEditThisReferenceType = meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.alerts.actions.update_dates,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertDetailContext.data.alert.reference_type,
		});
		// User can edit dates if they have permission
		// for the agency and reference type.
		return canEditThisAgency && canEditThisReferenceType;
	}, [
		meContext.data.user?.permissions,
		alertDetailContext.data.alert.agency_id,
		alertDetailContext.data.alert.reference_type,
	]);

	//
	// C. Render components

	return (
		<Collapsible
			description=""
			title="Datas de Vigência e Agendamento"
		>

			<Section gap="sm">
				<Label size="md" caps>Período de Vigência</Label>
				<Text size="sm" weight="medium">Período em que o alerta é válido. Distinto da visibilidade. O alerta pode estar visível mas não ser ainda válido (ex: um alerta para um corte de estrada é vísível uma semana antes, mas o corte em si é apenas durante 2 dias).</Text>
				<Grid columns="ab" gap="md">
					<DateTimeInput
						key={alertDetailContext.data.form.key('active_period_start_date')}
						label="Data de Início"
						readOnly={!hasPermissionToEdit}
						{...alertDetailContext.data.form.getInputProps('active_period_start_date')}
					/>
					<DateTimeInput
						key={alertDetailContext.data.form.key('active_period_end_date')}
						label="Data de Fim"
						readOnly={!hasPermissionToEdit}
						clearable
						{...alertDetailContext.data.form.getInputProps('active_period_end_date')}
					/>
				</Grid>
			</Section>

			<Divider />

			<Section gap="sm">
				<Label size="md" caps>Agendamento</Label>
				<Text size="sm" weight="medium">É possível agendar a permanência do alerta nos canais digitais. A visibilidade do alerta é diferente do seu período de vigência.</Text>
				<Grid columns="ab" gap="md">
					<DateTimeInput
						key={alertDetailContext.data.form.key('publish_start_date')}
						label="Data de Início"
						readOnly={!hasPermissionToEdit}
						clearable
						{...alertDetailContext.data.form.getInputProps('publish_start_date')}
					/>
					<DateTimeInput
						key={alertDetailContext.data.form.key('publish_end_date')}
						label="Data de Fim"
						readOnly={!hasPermissionToEdit}
						clearable
						{...alertDetailContext.data.form.getInputProps('publish_end_date')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
