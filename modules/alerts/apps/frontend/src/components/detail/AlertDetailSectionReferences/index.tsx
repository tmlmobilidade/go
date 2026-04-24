'use client';

/* * */

import { ReferencesEditor } from '@/components/common/references/ReferencesEditor';
import { useAlertDetailContext } from '@/components/detail/AlertDetail.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, PermissionCatalog } from '@tmlmobilidade/types';
import { Collapsible, Label, openConfirmModal, Select, useDataAgencies } from '@tmlmobilidade/ui';

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

	//
	// B. Handle actions

	const handleChangeAgencyId = (value: Alert['agency_id']) => {
		if (alertDetailContext.data.form.getValues().references?.length > 0) {
			openConfirmModal({
				cancelProps: { variant: 'danger' },
				centered: true,
				children: <Label>Ao alterar o operador, irá perder as referências que já foram adicionadas.</Label>,
				closeOnClickOutside: true,
				labels: { cancel: 'Cancelar', confirm: 'Continuar' },
				onConfirm: () => {
					alertDetailContext.data.form.setFieldValue('agency_id', value);
					alertDetailContext.data.form.setFieldValue('references', []);
				},
				title: 'Tem a certeza que pretende mudar de operador?',
			});
		} else {
			alertDetailContext.data.form.setFieldValue('agency_id', value);
			alertDetailContext.data.form.setFieldValue('references', []);
		}
	};

	const handleChangeReferenceType = (value: Alert['reference_type']) => {
		alertDetailContext.data.form.setFieldValue('reference_type', value);
	};

	const handleChangeReferences = (references: Alert['references']) => {
		alertDetailContext.data.form.setFieldValue('references', references);
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
				<Select
					clearable={false}
					data={agenciesOptions}
					label="Operador afetado"
					{...alertDetailContext.data.form.getInputProps('agency_id')}
					onChange={handleChangeAgencyId}
				/>
			)}

			<ReferencesEditor
				activePeriodEndDate={alertDetailContext.data.form.getValues().active_period_end_date}
				activePeriodStartDate={alertDetailContext.data.form.getValues().active_period_start_date}
				availableAgenciesOptions={agenciesOptions}
				enabledReferenceTypes={['agency', 'lines', 'rides', 'stops']}
				onChangeReferences={handleChangeReferences}
				onChangeReferenceType={handleChangeReferenceType}
				selectedAgencyId={alertDetailContext.data.form.getValues().agency_id}
				selectedMunicipalityIds={alertDetailContext.data.form.getValues().municipality_ids}
				selectedReferences={alertDetailContext.data.form.getValues().references}
				selectedReferenceType={alertDetailContext.data.form.getValues().reference_type}
			/>

		</Collapsible>
	);
}
