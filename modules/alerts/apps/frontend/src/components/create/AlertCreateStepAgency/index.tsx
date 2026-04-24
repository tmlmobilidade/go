'use client';

/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, PermissionCatalog } from '@tmlmobilidade/types';
import { Grid, Label, openConfirmModal, Section, Select, useDataAgencies } from '@tmlmobilidade/ui';

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
	// B. Handle actions

	const handleChangeAgencyId = (value: Alert['agency_id']) => {
		if (alertCreateContext.data.form.getValues().references?.length > 0) {
			openConfirmModal({
				cancelProps: { variant: 'danger' },
				centered: true,
				children: <Label>Ao alterar o operador, irá perder as referências que já foram adicionadas.</Label>,
				closeOnClickOutside: true,
				labels: { cancel: 'Cancelar', confirm: 'Continuar' },
				onConfirm: () => {
					alertCreateContext.data.form.setFieldValue('agency_id', value);
					alertCreateContext.data.form.setFieldValue('references', []);
				},
				title: 'Tem a certeza que pretende mudar de operador?',
			});
		} else {
			alertCreateContext.data.form.setFieldValue('agency_id', value);
			alertCreateContext.data.form.setFieldValue('references', []);
		}
	};

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
						onChange={handleChangeAgencyId}
					/>
				)}
			</Grid>
		</Section>
	);
}
