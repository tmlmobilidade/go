/* * */

import { type AlertEffect, AlertEffectValues } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { AlertEffectIcons, Grid, LargeButton, LoadingSection, NoDataLabel, Section, useAgenciesData, useContextFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAlertsCreateFormContext } from '../../shared/AlertsCreateForm.context';
import { useAlertsCreateFormStepsContext } from '../../shared/AlertsCreateFormSteps.context';

/* * */

export function AlertCreateStepEffect() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { form: alertsCreateForm } = useAlertsCreateFormContext();
	const { actions: alertsCreateFormStepsActions } = useAlertsCreateFormStepsContext();

	const agencyIdValue = useContextFormWatch({ control: alertsCreateForm.control, name: 'agency_id' });
	const causeValue = useContextFormWatch({ control: alertsCreateForm.control, name: 'cause' });
	const effectValue = useContextFormWatch({ control: alertsCreateForm.control, name: 'effect' });

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
		// Only show effects that have at least one reference_type enabled (cause > effect > reference_type = true).
		// Map to the format needed for rendering the buttons
		// and sort alphabetically by label.
		return AlertEffectValues
			.filter(effect => Object.values(matchingAgencyData.alerts_map?.[causeValue]?.[effect] ?? {})?.some(referenceType => !!referenceType))
			.map(item => ({ icon: AlertEffectIcons[item], label: t(`shared:alerts.effects.${item}.title`) as string, value: item }))
			.sort((a, b) => a.label.localeCompare(b.label));
	}, [t, agenciesData, agencyIdValue, causeValue]);

	//
	// D. Handle actions

	const handleSelectEffect = (value: AlertEffect) => {
		alertsCreateForm.setValue('effect', value, { shouldDirty: true });
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
				<NoDataLabel text={t('alerts:create.effects.no_data')} />
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
						isActive={effectValue === item.value}
						onClick={() => handleSelectEffect(item.value)}
						orientation="horizontal"
						title={item.label}
					/>
				))}
			</Grid>
		</Section>
	);
}
