'use client';

import { useAlertsAgenciesData } from '@/components/alerts/shared/use-alerts-agencies-data';
import { type Alert } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Grid, Label, openConfirmModal, Section, Select, StandardFormController } from '@tmlmobilidade/ui';

import { useAlertsCreateFormContext } from '../../AlertsCreateForm.context';

/* * */

export function AlertCreateStepAgency() {
	//

	//
	// A. Setup variables

	const { form: alertsCreateForm } = useAlertsCreateFormContext();

	const { options: agenciesOptions } = useAlertsAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.alerts.actions.create],
			scope: PermissionCatalog.all.alerts.scope,
		},
	});

	//
	// B. Handle actions

	const handleChangeAgencyId = (value: Alert['agency_id'], fieldOnChange: (v: Alert['agency_id']) => void) => {
		if (alertsCreateForm.getValues('references')?.length > 0) {
			openConfirmModal({
				cancelProps: { variant: 'danger' },
				centered: true,
				children: <Label>Ao alterar o operador, irá perder as referências que já foram adicionadas.</Label>,
				closeOnClickOutside: true,
				labels: { cancel: 'Cancelar', confirm: 'Continuar' },
				onConfirm: () => {
					fieldOnChange(value);
					alertsCreateForm.setValue('references', [], { shouldDirty: true });
				},
				title: 'Tem a certeza que pretende mudar de operador?',
			});
		} else {
			fieldOnChange(value);
			alertsCreateForm.setValue('references', [], { shouldDirty: true });
		}
	};

	//
	// C. Render components

	return (
		<Section>
			<Grid gap="md">
				{agenciesOptions.length > 1 && (
					<StandardFormController
						control={alertsCreateForm.control}
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
