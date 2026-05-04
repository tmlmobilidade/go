'use client';

/* * */

import { ReferencesEditor } from '@/components/common/references/ReferencesEditor';
import { useAlertDetailContext } from '@/components/detail/AlertDetail.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, PermissionCatalog } from '@tmlmobilidade/types';
import { Collapsible, Label, openConfirmModal, Section, Select, useDataAgencies } from '@tmlmobilidade/ui';
import { Controller } from 'react-hook-form';

/* * */

export function AlertDetailSectionReferences() {
	//

	//
	// A. Setup variables

	const alertDetailContext = useAlertDetailContext();

	const { options: agenciesOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.alerts.actions.read, PermissionCatalog.all.alerts.actions.update],
		scope: PermissionCatalog.all.alerts.scope,
	});

	const agencyIdValue = alertDetailContext.form.instance.watch('agency_id');
	const municipalityIdsValue = alertDetailContext.form.instance.watch('municipality_ids');
	const activePeriodStartDateValue = alertDetailContext.form.instance.watch('active_period_start_date');
	const activePeriodEndDateValue = alertDetailContext.form.instance.watch('active_period_end_date');
	const referenceTypeValue = alertDetailContext.form.instance.watch('reference_type');
	const referencesValue = alertDetailContext.form.instance.watch('references');

	//
	// B. Handle actions

	const handleChangeAgencyId = (value: Alert['agency_id'], fieldOnChange: (v: Alert['agency_id']) => void) => {
		if (alertDetailContext.form.instance.getValues('references')?.length > 0) {
			openConfirmModal({
				cancelProps: { variant: 'danger' },
				centered: true,
				children: <Label>Ao alterar o operador, irá perder as referências que já foram adicionadas.</Label>,
				closeOnClickOutside: true,
				labels: { cancel: 'Cancelar', confirm: 'Continuar' },
				onConfirm: () => {
					fieldOnChange(value);
					alertDetailContext.form.instance.setValue('references', []);
				},
				title: 'Tem a certeza que pretende mudar de operador?',
			});
		} else {
			fieldOnChange(value);
			alertDetailContext.form.instance.setValue('references', []);
		}
	};

	const handleChangeReferenceType = (value: Alert['reference_type']) => {
		alertDetailContext.form.instance.setValue('reference_type', value);
	};

	const handleChangeReferences = (references: Alert['references']) => {
		alertDetailContext.form.instance.setValue('references', references);
	};

	//
	// C. Render components

	return (
		<Collapsible
			description="As referências (Linhas, Paragens, Municípios, Etc...) afetadas por este alerta."
			title="Referências"
			defaultOpen
		>

			{agenciesOptions.length > 1 && (
				<Section>
					<Controller
						control={alertDetailContext.form.instance.control}
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
				</Section>
			)}

			<ReferencesEditor
				activePeriodEndDate={activePeriodEndDateValue}
				activePeriodStartDate={activePeriodStartDateValue}
				availableAgenciesOptions={agenciesOptions}
				enabledReferenceTypes={['agency', 'lines', 'rides', 'stops']}
				onChangeReferences={handleChangeReferences}
				onChangeReferenceType={handleChangeReferenceType}
				selectedAgencyId={agencyIdValue}
				selectedMunicipalityIds={municipalityIdsValue}
				selectedReferences={referencesValue}
				selectedReferenceType={referenceTypeValue}
			/>

		</Collapsible>
	);
}
