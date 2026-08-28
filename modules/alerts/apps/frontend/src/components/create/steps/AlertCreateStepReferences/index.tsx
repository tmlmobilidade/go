'use client';

import { ReferencesEditor } from '@/components/references/shared/ReferencesEditor';
import { useAlertsAgenciesData } from '@/components/shared/use-alerts-agencies-data';
import { type Alert, AlertReferenceTypeValues } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { LoadingSection, NoDataLabel, Section, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAlertsCreateFormContext } from '../../AlertsCreateForm.context';

/* * */

export function AlertCreateStepReferences() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { form: alertsCreateForm } = useAlertsCreateFormContext();

	const agencyIdValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'agency_id' });
	const causeValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'cause' });
	const effectValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'effect' });
	const activePeriodEndDateValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'active_period_end_date' });
	const activePeriodStartDateValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'active_period_start_date' });
	const referencesValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'references' });
	const referenceTypeValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'reference_type' });

	//
	// B. Fetch data

	const { data: agenciesData, isLoading: agenciesLoading } = useAlertsAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.alerts.actions.create],
			scope: PermissionCatalog.all.alerts.scope,
		},
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
			.filter(referenceTypeValue => !!matchingAgencyData.alerts_map?.[causeValue]?.[effectValue]?.[referenceTypeValue])
			.sort((a, b) => a.localeCompare(b));
	}, [agenciesData, agencyIdValue, causeValue, effectValue]);

	//
	// D. Handle actions

	const handleChangeReferenceType = (value: Alert['reference_type']) => {
		alertsCreateForm.setValue('reference_type', value, { shouldDirty: true });
	};

	const handleChangeReferences = (value: Alert['references']) => {
		alertsCreateForm.setValue('references', value, { shouldDirty: true });
	};

	//
	// E. Render components

	if (agenciesLoading) {
		return <LoadingSection />;
	}

	if (!preparedOptions.length) {
		return (
			<Section alignItems="center" height="100%" justifyContent="center" padding="lg">
				<NoDataLabel text={t('alerts:create.references.no_data')} />
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
			selectedReferences={referencesValue}
			selectedReferenceType={referenceTypeValue}
		/>
	);
}
