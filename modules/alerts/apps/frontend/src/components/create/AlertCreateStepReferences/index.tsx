'use client';

import { ReferencesEditor } from '@/components/common/references/ReferencesEditor';
import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, alertCauseEffectReferenceTypeMap, PermissionCatalog } from '@tmlmobilidade/types';
import { useContextFormWatch, useDataAgencies } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

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

	const causeValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'cause' });
	const effectValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'effect' });
	const activePeriodEndDateValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'active_period_end_date' });
	const activePeriodStartDateValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'active_period_start_date' });
	const agencyIdValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'agency_id' });
	const municipalityIdsValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'municipality_ids' });
	const referencesValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'references' });
	const referenceTypeValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'reference_type' });

	//
	// B. Transform data

	const enabledReferenceTypes = useMemo(() => {
		const causeMap = alertCauseEffectReferenceTypeMap[causeValue];
		if (!causeMap) return [];
		return causeMap[effectValue] ?? [];
	}, [causeValue, effectValue]);

	//
	// C. Handle actions

	const handleChangeReferenceType = (value: Alert['reference_type']) => {
		alertCreateContext.form.instance.setValue('reference_type', value, { shouldDirty: true });
	};

	const handleChangeReferences = (value: Alert['references']) => {
		alertCreateContext.form.instance.setValue('references', value, { shouldDirty: true });
	};

	//
	// D. Render components

	return (
		<ReferencesEditor
			activePeriodEndDate={activePeriodEndDateValue}
			activePeriodStartDate={activePeriodStartDateValue}
			availableAgenciesOptions={agenciesOptions}
			enabledReferenceTypes={enabledReferenceTypes}
			onChangeReferences={handleChangeReferences}
			onChangeReferenceType={handleChangeReferenceType}
			selectedAgencyId={agencyIdValue}
			selectedMunicipalityIds={municipalityIdsValue}
			selectedReferences={referencesValue}
			selectedReferenceType={referenceTypeValue}
		/>
	);
}
