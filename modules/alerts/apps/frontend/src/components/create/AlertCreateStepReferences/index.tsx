'use client';

import { ReferencesEditor } from '@/components/common/references/ReferencesEditor';
import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, AlertReferenceTypeValues, PermissionCatalog } from '@tmlmobilidade/types';
import { LoadingSection, NoDataLabel, Section, useContextFormWatch, useDataAgencies } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertCreateStepReferences() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const alertCreateContext = useAlertCreateContext();

	const agencyIdValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'agency_id' });
	const causeValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'cause' });
	const effectValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'effect' });
	const activePeriodEndDateValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'active_period_end_date' });
	const activePeriodStartDateValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'active_period_start_date' });
	const municipalityIdsValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'municipality_ids' });
	const referencesValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'references' });
	const referenceTypeValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'reference_type' });

	//
	// B. Fetch data

	const { filtered: agenciesData, isLoading: agenciesLoading } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.alerts.actions.create],
		scope: PermissionCatalog.all.alerts.scope,
	});

	//
	// C. Transform data

	const preparedOptions = useMemo(() => {
		// Find the agency data that matches the selected agency_id in the form.
		const matchingAgencyData = agenciesData?.find(item => item._id === agencyIdValue);
		if (!matchingAgencyData) return [];
		// Only show effects that have at least one reference_type enabled (cause > effect > reference_type = true).
		// Map to the format needed for rendering the buttons
		// and sort alphabetically by label.
		return AlertReferenceTypeValues
			.filter(referenceTypeValue => !!matchingAgencyData.alerts_map[causeValue][effectValue][referenceTypeValue])
			.sort((a, b) => a.localeCompare(b));
	}, [agenciesData, agencyIdValue, causeValue, effectValue]);

	//
	// D. Handle actions

	const handleChangeReferenceType = (value: Alert['reference_type']) => {
		alertCreateContext.form.instance.setValue('reference_type', value, { shouldDirty: true });
	};

	const handleChangeReferences = (value: Alert['references']) => {
		alertCreateContext.form.instance.setValue('references', value, { shouldDirty: true });
	};

	//
	// E. Render components

	if (agenciesLoading) {
		return <LoadingSection />;
	}

	if (!preparedOptions.length) {
		return (
			<Section alignItems="center" height="100%" justifyContent="center" padding="lg">
				<NoDataLabel text={t('default:alerts.create.references.no_data')} />
			</Section>
		);
	}

	return (
		<ReferencesEditor
			activePeriodEndDate={activePeriodEndDateValue}
			activePeriodStartDate={activePeriodStartDateValue}
			enabledReferenceTypes={preparedOptions}
			onChangeReferences={handleChangeReferences}
			onChangeReferenceType={handleChangeReferenceType}
			selectedAgencyId={agencyIdValue}
			selectedMunicipalityIds={municipalityIdsValue}
			selectedReferences={referencesValue}
			selectedReferenceType={referenceTypeValue}
		/>
	);
}
