'use client';

/* * */

import { ReferencesEditor } from '@/components/common/references/ReferencesEditor';
import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, PermissionCatalog } from '@tmlmobilidade/types';
import { useDataAgencies } from '@tmlmobilidade/ui';

/* * */

export function AlertCreateStepReferences() {
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

	const handleChangeReferenceType = (value: Alert['reference_type']) => {
		alertCreateContext.data.form.setFieldValue('reference_type', value);
	};

	const handleChangeReferences = (references: Alert['references']) => {
		alertCreateContext.data.form.setFieldValue('references', references);
	};

	//
	// C. Render components

	return (
		<ReferencesEditor
			activePeriodEndDate={alertCreateContext.data.form.getValues().active_period_end_date}
			activePeriodStartDate={alertCreateContext.data.form.getValues().active_period_start_date}
			availableAgenciesOptions={agenciesOptions}
			enabledReferenceTypes={alertCreateContext.data.enabled_reference_types}
			onChangeReferences={handleChangeReferences}
			onChangeReferenceType={handleChangeReferenceType}
			selectedAgencyId={alertCreateContext.data.form.getValues().agency_id}
			selectedMunicipalityIds={alertCreateContext.data.form.getValues().municipality_ids}
			selectedReferences={alertCreateContext.data.form.getValues().references}
			selectedReferenceType={alertCreateContext.data.form.getValues().reference_type}
		/>
	);
}
