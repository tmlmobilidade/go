'use client';

/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Grid, Section, Select, useDataAgencies } from '@tmlmobilidade/ui';

/* * */

export function AlertCreateStepAgency() {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();

	const { options: agenciesOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.alerts.actions.create],
		scope: PermissionCatalog.all.alerts.scope,
	});

	//
	// C. Render components

	return (
		<Section>
			<Grid gap="md">
				{agenciesOptions.length > 1 && (
					<Select
						clearable={false}
						data={agenciesOptions}
						label="Operador afetado"
						{...alertCreateContext.data.form.getInputProps('agency_id')}
					/>
				)}
			</Grid>
		</Section>
	);
}
