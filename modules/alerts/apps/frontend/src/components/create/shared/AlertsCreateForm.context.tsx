'use client';

import { AlertReferenceTypeValues, type CreateAlertDto } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { useAgenciesData, useStandardForm, type UseStandardFormReturnType, useStandardFormWatch, useMeContext } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';

/* * */

const AlertsCreateFormContext = createContext<undefined | UseStandardFormReturnType<CreateAlertDto>>(undefined);

export function useAlertsCreateFormContext() {
	const context = useContext(AlertsCreateFormContext);
	if (!context) throw new Error('useAlertsCreateFormContext must be used within a AlertsCreateFormContextProvider');
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

	const { form, unblock } = useStandardForm<CreateAlertDto>({
		defaultValues: formDefaultValues,
		// schema: CreateAlertSchema,
	});

	const agencyIdValue = useStandardFormWatch({ control: form.control, name: 'agency_id' });
	const causeValue = useStandardFormWatch({ control: form.control, name: 'cause' });
	const effectValue = useStandardFormWatch({ control: form.control, name: 'effect' });
	const referenceTypeValue = useStandardFormWatch({ control: form.control, name: 'reference_type' });
	const referencesValue = useStandardFormWatch({ control: form.control, name: 'references' });
	const activePeriodEndDateValue = useStandardFormWatch({ control: form.control, name: 'active_period_end_date' });
	const autoTextsValue = useStandardFormWatch({ control: form.control, name: 'auto_texts' });

	//
	// C. Fetch data

	const { data: agenciesData } = useAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.alerts.actions.create],
			scope: PermissionCatalog.all.alerts.scope,
		},
	});

	//
	// D. Side effects

	/**
	 * Auto-select "agency_id" when only one agency is available.
	 */
	useEffect(() => {
		// Skip if no agencies are available
		if (!agenciesData?.length) return;
		// Skip if more than one agency is available
		if (agenciesData?.length !== 1) return;
		// Skip if "agency_id" is already set
		if (agencyIdValue) return;
		// Auto-select "agency_id"
		form.setValue('agency_id', agenciesData[0]._id, { shouldDirty: false });
		// eslint-disable-next-line no-console
		console.log('[Form] Auto-selected "agency_id" based on available agencies data.');
	}, [agenciesData, agencyIdValue, form]);

	/**
	 * Unset "cause" when "agency_id" changes.
	 */
	useEffect(() => {
		form.setValue('cause', undefined, { shouldDirty: false });
		// eslint-disable-next-line no-console
		console.log(`[Form] Unset "cause" because "agency_id" changed -> agency_id: "${agencyIdValue}"`);
	}, [agencyIdValue, form]);

	/**
	 * Unset "effect" when "cause" changes.
	 */
	useEffect(() => {
		form.setValue('effect', undefined, { shouldDirty: false });
		// eslint-disable-next-line no-console
		console.log(`[Form] Unset "effect" because "cause" changed -> cause: "${causeValue}"`);
	}, [causeValue, form]);

	/**
	 * Restore default end dates when "active_period_end_date" is cleared.
	 */
	useEffect(() => {
		// Skip if "active_period_end_date" is already set
		if (activePeriodEndDateValue) return;
		// Restore default end dates when active_period_end_date is cleared.
		form.setValue('active_period_end_date', Dates.now('local').plus({ hours: 4 }).unix_timestamp);
		form.setValue('publish_end_date', Dates.now('local').endOf('day').unix_timestamp);
		// eslint-disable-next-line no-console
		console.log(`[Form] Restored default end dates because "active_period_end_date" was cleared -> active_period_end_date: "${activePeriodEndDateValue}"`);
	}, [activePeriodEndDateValue, form]);

	/**
	 * Unset "reference_type" when "effect" changes.
	 */
	useEffect(() => {
		form.setValue('reference_type', undefined, { shouldDirty: false });
		// eslint-disable-next-line no-console
		console.log(`[Form] Unset "reference_type" because "effect" changed -> effect: "${effectValue}"`);
	}, [effectValue, form]);

	/**
	 * Unset "references" when "reference_type" changes.
	 */
	useEffect(() => {
		form.setValue('references', [], { shouldDirty: false });
		// eslint-disable-next-line no-console
		console.log(`[Form] Unset "references" because "reference_type" changed -> reference_type: "${referenceTypeValue}"`);
	}, [form, referenceTypeValue]);

	/**
	 * Unset "title" and "description" when "references" changes,
	 * only if "auto_texts" is enabled.
	 */
	useEffect(() => {
		if (autoTextsValue !== true) return;
		form.setValue('title', '', { shouldDirty: false });
		form.setValue('description', '', { shouldDirty: false });
		// eslint-disable-next-line no-console
		console.log(`[Form] Unset "title" and "description" because "references" changed -> auto_texts: "${autoTextsValue}", references: "${referencesValue}"`);
	}, [autoTextsValue, form, referencesValue]);

	/**
	 * Auto-select the best "reference_type" based
	 * on "cause"/"effect" and user permissions.
	 */
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
		else console.log(`[Form] No enabled "reference_type" options available to set as default -> cause: "${causeValue}", effect: "${effectValue}"`);
		// eslint-disable-next-line no-console
		console.log(`[Form] Auto-selected "reference_type" options based on "cause"/"effect" change and user permissions -> cause: "${causeValue}", effect: "${effectValue}"`);
	}, [agenciesData, agencyIdValue, causeValue, effectValue, form, meContext.data.user.permissions, referenceTypeValue]);

	/**
	 * Auto-select "references" when "reference_type"
	 * is set to "agency".
	 */
	useEffect(() => {
		// Skip if reference_type is not 'agency' or agency_id is not set
		if (referenceTypeValue !== 'agency' || !agencyIdValue) return;
		// When reference_type is 'agency' or agency_id changes to non-empty,
		// set references to the selected agency.
		form.setValue('references', [{ child_ids: [], parent_id: agencyIdValue }], { shouldDirty: false });
		// eslint-disable-next-line no-console
		console.log(`[Form] Auto-selected "references" based on "reference_type" = "agency" selection -> reference_type: "${referenceTypeValue}", agency_id: "${agencyIdValue}"`);
	}, [form, referenceTypeValue, agencyIdValue]);

	//
	// H. Return state

	if (!agenciesData?.length) return null;

	return (
		<AlertsCreateFormContext.Provider value={{ form, unblock }}>
			{children}
		</AlertsCreateFormContext.Provider>
	);
}
