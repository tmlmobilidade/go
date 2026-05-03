'use client';

/* * */

import { ReferencesEditor } from '@/components/common/references/ReferencesEditor';
import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, alertCauseEffectReferenceTypeMap, PermissionCatalog } from '@tmlmobilidade/types';
import { useDataAgencies } from '@tmlmobilidade/ui';
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

	const causeValue = alertCreateContext.form.instance.watch('cause');
	const effectValue = alertCreateContext.form.instance.watch('effect');
	const activePeriodEndDateValue = alertCreateContext.form.instance.watch('active_period_end_date');
	const activePeriodStartDateValue = alertCreateContext.form.instance.watch('active_period_start_date');
	const agencyIdValue = alertCreateContext.form.instance.watch('agency_id');
	const municipalityIdsValue = alertCreateContext.form.instance.watch('municipality_ids');
	const referencesValue = alertCreateContext.form.instance.watch('references');
	const referenceTypeValue = alertCreateContext.form.instance.watch('reference_type');

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
		alertCreateContext.form.instance.setValue('reference_type', value);
	};

	const handleChangeReferences = (value: Alert['references']) => {
		alertCreateContext.form.instance.setValue('references', value);
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
