'use client';

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, PermissionCatalog } from '@tmlmobilidade/types';
import { ContextFormController, Grid, Label, openConfirmModal, Section, Select, useDataAgencies, useManagedFormContext } from '@tmlmobilidade/ui';
import { useEffect } from 'react';

/* * */

export function AlertCreateStepAgency() {
	//

	//
	// A. Setup variables

	const managedFormContext = useManagedFormContext();

	const { filteredIds: agenciesFilteredIds, options: agenciesOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.alerts.actions.create],
		scope: PermissionCatalog.all.alerts.scope,
	});

	//
	// B. Handle actions

	useEffect(() => {
		// Pre-select agency when only one is available
		if (agenciesFilteredIds?.length !== 1) return;
		if (managedFormContext.form.getValues('agency_id')) return;
		form.setValue('agency_id', agenciesData[0]._id, { shouldDirty: false });
		console.log({ message: 'Auto-selected agency_id based on available agencies data.' });
	}, [agenciesData, form]);

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
					<ContextFormController
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
