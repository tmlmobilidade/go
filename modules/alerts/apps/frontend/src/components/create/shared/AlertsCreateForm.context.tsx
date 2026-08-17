'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { AlertReferenceTypeValues, type CreateAlertDto } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { useContextForm, type UseContextFormReturnType, useContextFormWatch, useDataAgencies, useMeContext } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';

/* * */

const AlertsCreateFormContext = createContext<undefined | UseContextFormReturnType<CreateAlertDto>>(undefined);

export function useAlertsCreateFormContext() {
	const context = useContext(AlertsCreateFormContext);
	if (!context) {
		throw new Error('useAlertsCreateFormContext must be used within a AlertsCreateFormContextProvider');
	}
	return context;
}

/* * */

export function AlertsCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	//
	// B. Setup form

	const formDefaultValues = useMemo<Partial<CreateAlertDto>>(() => ({

		active_period_end_date: Dates
			.now('local')
			.plus({ hours: 4 })
			.endOf('hour')
			.unix_timestamp,

		active_period_start_date: Dates
			.now('local')
			.minus({ hours: 1 })
			.startOf('hour')
			.unix_timestamp,

		auto_texts: true,

		publish_end_date: Dates
			.now('local')
			.endOf('day')
			.unix_timestamp,

		publish_start_date: Dates
			.now('local')
			.startOf('day')
			.unix_timestamp,

		publish_status: 'published',

		references: [],

	}), []);

	const { form, unblock } = useContextForm<CreateAlertDto>({
		defaultValues: formDefaultValues,
		// schema: CreateAlertSchema,
	});

	const agencyIdValue = useContextFormWatch({ control: form.control, name: 'agency_id' });
	const causeValue = useContextFormWatch({ control: form.control, name: 'cause' });
	const effectValue = useContextFormWatch({ control: form.control, name: 'effect' });
	const referenceTypeValue = useContextFormWatch({ control: form.control, name: 'reference_type' });
	const referencesValue = useContextFormWatch({ control: form.control, name: 'references' });
	const activePeriodEndDateValue = useContextFormWatch({ control: form.control, name: 'active_period_end_date' });

	//
	// C. Fetch data

	const { filtered: agenciesData } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.alerts.actions.create],
		scope: PermissionCatalog.all.alerts.scope,
	});

	//
	// D. Side effects

	useEffect(() => {
		// Pre-select agency when only one is available
		if (agenciesData?.length !== 1) return;
		if (form.getValues('agency_id')) return;
		form.setValue('agency_id', agenciesData[0]._id, { shouldDirty: false });
		// eslint-disable-next-line no-console
		console.log({ message: 'Auto-selected agency_id based on available agencies data.' });
	}, [agenciesData, form]);

	useEffect(() => {
		// Reset effect field when cause changes
		form.setValue('effect', undefined);
		// eslint-disable-next-line no-console
		console.log({ message: 'Reset effect field due to cause change.' });
	}, [causeValue, form]);

	useEffect(() => {
		// Reset reference_type and references when effect changes
		form.setValue('reference_type', undefined);
		form.setValue('references', []);
		// eslint-disable-next-line no-console
		console.log({ message: 'Reset reference_type and references fields due to effect change.' });
	}, [effectValue, form]);

	useEffect(() => {
		// If auto_texts is enabled, reset texts when references change
		if (!form.getValues('auto_texts')) return;
		form.setValue('title', '');
		form.setValue('description', '');
		// eslint-disable-next-line no-console
		console.log({ message: 'Reset title and description fields due to references change.' });
	}, [referencesValue, form]);

	useEffect(() => {
		// Skip if reference_type is already set,
		// as we don't want to override user's selection.
		if (referenceTypeValue) return;
		// Skip if agency, cause or effect are not set, as reference_type will be
		// auto-set based on their combination when all are selected.
		if (!agencyIdValue || !causeValue || !effectValue) return;
		// Find the agency data that matches the selected agency_id.
		const matchingAgencyData = agenciesData?.find(item => item._id === agencyIdValue);
		if (!matchingAgencyData) return;
		// Extract the available reference types for the selected agency/cause/effect combination.
		const enabledTypes = AlertReferenceTypeValues.filter(referenceTypeValue => !!matchingAgencyData.alerts_map?.[causeValue]?.[effectValue]?.[referenceTypeValue]);
		if (!enabledTypes.length) return;
		// Get user's permissions for alert creation to determine which reference types they can select.
		const permissions = PermissionCatalog.get(meContext.data.user.permissions, PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.create);
		const allowAllReferenceTypes = permissions?.resources.reference_types.includes(PermissionCatalog.ALLOW_ALL_FLAG);
		const allowedReferenceTypes = permissions?.resources.reference_types ?? [];
		// Auto-select the best reference_type based on permissions.
		if (enabledTypes.includes('lines') && (allowAllReferenceTypes || allowedReferenceTypes.includes('lines'))) form.setValue('reference_type', 'lines');
		else if (enabledTypes.includes('stops') && (allowAllReferenceTypes || allowedReferenceTypes.includes('stops'))) form.setValue('reference_type', 'stops');
		else if (enabledTypes.includes('rides') && (allowAllReferenceTypes || allowedReferenceTypes.includes('rides'))) form.setValue('reference_type', 'rides');
		else if (enabledTypes.includes('agency') && (allowAllReferenceTypes || allowedReferenceTypes.includes('agency'))) form.setValue('reference_type', 'agency');
		// eslint-disable-next-line no-console
		else console.log({ message: 'No enabled reference types available to set as default.' });
		// eslint-disable-next-line no-console
		console.log({ message: 'Auto-selected reference_type options based on cause/effect change and user permissions.' });
	}, [agenciesData, agencyIdValue, causeValue, effectValue, form, meContext.data.user.permissions, referenceTypeValue]);

	useEffect(() => {
		// Skip if reference_type is not 'agency' or agency_id is not set
		if (referenceTypeValue !== 'agency' || !agencyIdValue) return;
		// When reference_type is 'agency' or agency_id changes to non-empty,
		// set references to the selected agency.
		form.setValue('references', [{ child_ids: [], parent_id: form.getValues('agency_id') }]);
		// eslint-disable-next-line no-console
		console.log({ message: 'Auto-selected Agency references based on reference_type "agency" selection.' });
	}, [form, referenceTypeValue, agencyIdValue]);

	useEffect(() => {
		// Skip if active_period_end_date is already set
		if (activePeriodEndDateValue != null) return;
		// Restore default end dates when active_period_end_date is cleared.
		form.setValue('active_period_end_date', Dates.now('Europe/Lisbon').plus({ hours: 4 }).unix_timestamp);
		form.setValue('publish_end_date', Dates.now('Europe/Lisbon').endOf('day').unix_timestamp);
		// eslint-disable-next-line no-console
		console.log({ message: 'Restored default end dates because active_period_end_date was cleared.' });
	}, [form, activePeriodEndDateValue]);

	//
	// H. Return state

	return (
		<AlertsCreateFormContext.Provider value={{ form, unblock }}>
			{children}
		</AlertsCreateFormContext.Provider>
	);
}
