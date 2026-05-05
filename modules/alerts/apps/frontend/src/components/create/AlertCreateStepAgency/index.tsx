'use client';

/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, PermissionCatalog } from '@tmlmobilidade/types';
import { Grid, Label, openConfirmModal, Section, Select, useDataAgencies } from '@tmlmobilidade/ui';
import { Controller } from 'react-hook-form';

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

	const handleChangeAgencyId = (value: Alert['agency_id'], fieldOnChange: (v: Alert['agency_id']) => void) => {
		if (alertCreateContext.form.instance.getValues('references')?.length > 0) {
			openConfirmModal({
				cancelProps: { variant: 'danger' },
				centered: true,
				children: <Label>Ao alterar o operador, irá perder as referências que já foram adicionadas.</Label>,
				closeOnClickOutside: true,
				labels: { cancel: 'Cancelar', confirm: 'Continuar' },
				onConfirm: () => {
					fieldOnChange(value);
					alertCreateContext.form.instance.setValue('references', [], { shouldDirty: true });
				},
				title: 'Tem a certeza que pretende mudar de operador?',
			});
		} else {
			fieldOnChange(value);
			alertCreateContext.form.instance.setValue('references', [], { shouldDirty: true });
		}
	};

	//
	// C. Render components

	return (
		<Section>
			<Grid gap="md">
				{agenciesOptions.length > 1 && (
					<Controller
						control={alertCreateContext.form.instance.control}
						name="agency_id"
						render={({ field, fieldState }) => (
							<Select
								clearable={false}
								data={agenciesOptions}
								error={fieldState.error?.message}
								label="Operador afetado"
								onBlur={field.onBlur}
								onChange={value => handleChangeAgencyId(value, field.onChange)}
								value={field.value}
							/>
						)}
					/>
				)}
			</Grid>
		</Section>
	);
}
