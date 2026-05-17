/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type AlertCause, AlertCauseValues, PermissionCatalog } from '@tmlmobilidade/types';
import { AlertCauseIcons, Grid, LargeButton, LoadingSection, NoDataLabel, Section, useContextFormWatch, useDataAgencies } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertCreateStepCause() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const alertCreateContext = useAlertCreateContext();

	const agencyIdValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'agency_id' });
	const causeValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'cause' });

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
		alertCreateContext.form.instance.setValue('cause', value, { shouldDirty: true });
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
				<NoDataLabel text={t('default:alerts.create.causes.no_data')} />
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
