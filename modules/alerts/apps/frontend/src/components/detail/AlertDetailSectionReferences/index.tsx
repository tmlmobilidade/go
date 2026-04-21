'use client';

/* * */

import { ReferencesEditor } from '@/components/common/references/ReferencesEditor';
import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, PermissionCatalog } from '@tmlmobilidade/types';
import { Collapsible, useDataAgencies } from '@tmlmobilidade/ui';

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
		alertDetailContext.data.form.setFieldValue('agency_id', value);
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
			description="As referências (Linhas, Paragens, Municípios, Etc...) afetadas deste alerta."
			title="Referências"
			defaultOpen
		>
			<ReferencesEditor
				activePeriodEndDate={alertDetailContext.data.form.getValues().active_period_end_date}
				activePeriodStartDate={alertDetailContext.data.form.getValues().active_period_start_date}
				availableAgenciesOptions={agenciesOptions}
				enabledReferenceTypes={['agency', 'lines', 'rides', 'stops']}
				onChangeAgencyId={handleChangeAgencyId}
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
