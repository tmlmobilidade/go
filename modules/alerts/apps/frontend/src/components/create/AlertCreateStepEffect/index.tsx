/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type AlertEffect, AlertEffectValues, PermissionCatalog } from '@tmlmobilidade/types';
import { AlertEffectIcons, Grid, LargeButton, LoadingSection, NoDataLabel, Section, useContextFormWatch, useDataAgencies } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertCreateStepEffect() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const alertCreateContext = useAlertCreateContext();

	const agencyIdValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'agency_id' });
	const causeValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'cause' });
	const effectValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'effect' });

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
		return AlertEffectValues
			.filter(effect => Object.values(matchingAgencyData.alerts_map?.[causeValue]?.[effect] ?? {})?.some(referenceType => !!referenceType))
			.map(item => ({ icon: AlertEffectIcons[item], label: t(`shared:alerts.effects.${item}.title`) as string, value: item }))
			.sort((a, b) => a.label.localeCompare(b.label));
	}, [t, agenciesData, agencyIdValue, causeValue]);

	//
	// D. Handle actions

	const handleSelectEffect = (value: AlertEffect) => {
		alertCreateContext.form.instance.setValue('effect', value, { shouldDirty: true });
		alertCreateContext.form.multi_step.actions.next();
	};

	//
	// E. Render components

	if (agenciesLoading) {
		return <LoadingSection />;
	}

	if (!preparedOptions.length) {
		return (
			<Section alignItems="center" height="100%" justifyContent="center" padding="lg">
				<NoDataLabel text={t('default:alerts.create.effects.no_data')} />
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
