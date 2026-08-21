/* * */

import { type AlertCause, AlertCauseValues } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { AlertCauseIcons, Grid, LargeButton, LoadingSection, NoDataLabel, Section, useAgenciesData, useContextFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAlertsCreateFormContext } from '../../shared/AlertsCreateForm.context';
import { useAlertsCreateFormStepsContext } from '../../shared/AlertsCreateFormSteps.context';

/* * */

export function AlertCreateStepCause() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { form: alertsCreateForm } = useAlertsCreateFormContext();
	const { actions: alertsCreateFormStepsActions } = useAlertsCreateFormStepsContext();

	const agencyIdValue = useContextFormWatch({ control: alertsCreateForm.control, name: 'agency_id' });
	const causeValue = useContextFormWatch({ control: alertsCreateForm.control, name: 'cause' });

	//
	// B. Fetch data

	const { data: agenciesData, isLoading: agenciesLoading } = useAgenciesData({
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
		// Only show causes that have at least one effect/reference_type
		// enabled (cause > effect > reference_type = true).
		// Map to the format needed for rendering the buttons
		// and sort alphabetically by label.
		return AlertCauseValues
			.filter(cause => Object.values(matchingAgencyData.alerts_map?.[cause] ?? {})?.some(effect => !!Object.values(effect ?? {})?.find(reference => !!reference)))
			.map(item => ({ icon: AlertCauseIcons[item], label: t(`shared:alerts.causes.${item}.title`) as string, value: item }))
			.sort((a, b) => a.label.localeCompare(b.label));
	}, [t, agenciesData, agencyIdValue]);

	//
	// D. Handle actions

	const handleSelectCause = (value: AlertCause) => {
		alertsCreateForm.setValue('cause', value, { shouldDirty: true });
		alertsCreateFormStepsActions.next();
	};

	//
	// E. Render components

	if (agenciesLoading) {
		return <LoadingSection />;
	}

	if (!preparedOptions.length) {
		return (
			<Section alignItems="center" height="100%" justifyContent="center" padding="lg">
				<NoDataLabel text={t('alerts:create.causes.no_data')} />
			</Section>
		);
	}

	return (
		<Section padding="lg">
			<Grid columns="abc" gap="md">
				{preparedOptions.map(item => (
					<LargeButton
						key={item.value}
						icon={item.icon}
						isActive={causeValue === item.value}
						onClick={() => handleSelectCause(item.value)}
						orientation="horizontal"
						title={item.label}
					/>
				))}
			</Grid>
		</Section>
	);
}
