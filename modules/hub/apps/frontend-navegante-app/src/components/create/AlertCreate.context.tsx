'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import { type Alert, alertCauseEffectReferenceTypeMap, type CreateAlertDto, PermissionCatalog } from '@tmlmobilidade/types';
import { type CreateContextStateTemplate, keepUrlParams, useContextForm, useContextFormWatch, useDataAgencies, useDataOperationalLines, useDataOperationalStops, useDataRides, useHandleUpdate, useMeContext, useMultiStep, type UseMultiStepReturnType } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface AlertCreateContextState extends CreateContextStateTemplate<CreateAlertDto> {
	form: CreateContextStateTemplate<CreateAlertDto>['form'] & {
		multi_step: UseMultiStepReturnType
	}
}

/* * */

const AlertCreateContext = createContext<AlertCreateContextState | undefined>(undefined);

export function useAlertCreateContext() {
	const context = useContext(AlertCreateContext);
	if (!context) {
		throw new Error('useAlertCreateContext must be used within a AlertCreateContextProvider');
	}
	return context;
}

/* * */

export function AlertCreateContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	//
	// B. Setup form

	const { form, unblock } = useContextForm<CreateAlertDto>({
		defaultValues: {
			active_period_end_date: Dates.now('Europe/Lisbon').plus({ hours: 4 }).unix_timestamp,
			active_period_start_date: Dates.now('Europe/Lisbon').minus({ minutes: 30 }).set({ millisecond: 0, second: 0 }).unix_timestamp,
			auto_texts: true,
			publish_end_date: Dates.now('Europe/Lisbon').endOf('day').unix_timestamp,
			publish_start_date: Dates.now('Europe/Lisbon').startOf('day').unix_timestamp,
			publish_status: 'published',
			references: [],
		},
		// schema: CreateAlertSchema,
	});

	const agencyIdValue = useContextFormWatch({ control: form.control, name: 'agency_id' });
	const causeValue = useContextFormWatch({ control: form.control, name: 'cause' });
	const effectValue = useContextFormWatch({ control: form.control, name: 'effect' });
	const referenceTypeValue = useContextFormWatch({ control: form.control, name: 'reference_type' });
	const referencesValue = useContextFormWatch({ control: form.control, name: 'references' });
	const activePeriodStartDateValue = useContextFormWatch({ control: form.control, name: 'active_period_start_date' });
	const activePeriodEndDateValue = useContextFormWatch({ control: form.control, name: 'active_period_end_date' });

	//
	// C. Fetch data

	const { mutate: alertsListMutate } = useSWR<Alert[]>(API_ROUTES.alerts.ALERTS_LIST);

	const { filtered: agenciesData, isLoading: agenciesLoading } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.alerts.actions.create],
		scope: PermissionCatalog.all.alerts.scope,
	});

	//
	// Leave the following data fetching hooks in place as they are
	// used for preloading the necessary data for the references step.

	useDataOperationalLines(API_ROUTES.alerts.OPERATION_LINES, {
		filters: {
			agency_ids: agencyIdValue ? [agencyIdValue] : [],
			date_end: activePeriodEndDateValue,
			date_start: activePeriodStartDateValue,
		},
	});

	useDataOperationalStops(API_ROUTES.alerts.OPERATION_STOPS, {
		filters: {
			agency_ids: agencyIdValue ? [agencyIdValue] : [],
			date_end: activePeriodEndDateValue,
			date_start: activePeriodStartDateValue,
		},
	});

	useDataRides(API_ROUTES.alerts.OPERATION_RIDES, {
		filters: {
			agency_ids: agencyIdValue ? [agencyIdValue] : [],
			date_end: activePeriodEndDateValue,
			date_start: activePeriodStartDateValue,
			operational_statuses: ['running', 'missed', 'scheduled'],
		},
	});

	//
	// D. Side effects

	useEffect(() => {
		// Pre-select agency when only one is available
		if (agenciesData?.length !== 1) return;
		if (form.getValues('agency_id')) return;
		form.setValue('agency_id', agenciesData[0]._id, { shouldDirty: false });
		Logger.info('Auto-selected agency_id based on available agencies data.');
	}, [agenciesData, form]);

	useEffect(() => {
		// Reset effect field when cause changes
		form.setValue('effect', undefined);
		Logger.info('Reset effect field due to cause change.');
	}, [causeValue, form]);

	useEffect(() => {
		// Reset reference_type and references when effect changes
		form.setValue('reference_type', undefined);
		form.setValue('references', []);
		Logger.info('Reset reference_type and references fields due to effect change.');
	}, [effectValue, form]);

	useEffect(() => {
		// If auto_texts is enabled, reset texts when references change
		if (!form.getValues('auto_texts')) return;
		form.setValue('title', '');
		form.setValue('description', '');
		Logger.info('Reset title and description fields due to references change.');
	}, [referencesValue, form]);

	useEffect(() => {
		// Skip if cause or effect are not set, as reference_type will be
		// auto-set based on their combination when both are selected.
		if (!causeValue || !effectValue) return;
		// Skip if reference_type is already set, as we don't want to override user's selection.
		if (referenceTypeValue) return;
		// Extract the available reference types for the selected cause/effect combination.
		const enabledTypes = alertCauseEffectReferenceTypeMap[causeValue]?.[effectValue] ?? [];
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
		else Logger.info('No enabled reference types available to set as default.');
		Logger.info('Auto-selected reference_type options based on cause/effect change and user permissions.');
	}, [causeValue, effectValue, form, meContext.data.user.permissions, referenceTypeValue]);

	useEffect(() => {
		// Skip if reference_type is not 'agency' or agency_id is not set
		if (referenceTypeValue !== 'agency' || !agencyIdValue) return;
		// When reference_type is 'agency' or agency_id changes to non-empty,
		// set references to the selected agency.
		form.setValue('references', [{ child_ids: [], parent_id: form.getValues('agency_id') }]);
		Logger.info('Auto-selected Agency references based on reference_type "agency" selection.');
	}, [form, referenceTypeValue, agencyIdValue]);

	useEffect(() => {
		// Skip if active_period_end_date is already set
		if (activePeriodEndDateValue != null) return;
		// Restore default end dates when active_period_end_date is cleared.
		form.setValue('active_period_end_date', Dates.now('Europe/Lisbon').plus({ hours: 4 }).unix_timestamp);
		form.setValue('publish_end_date', Dates.now('Europe/Lisbon').endOf('day').unix_timestamp);
		Logger.info('Restored default end dates because active_period_end_date was cleared.');
	}, [form, activePeriodEndDateValue]);

	//
	// E. Multi-step setup
	// Steps are memoized so useMultiStep only recalculates when agencies or permissions change,
	// not on every form value change.

	const steps = useMemo(() => [
		{
			id: 'cause',
			isValid: () => !!form.getValues('cause'),
			isVisible: true,
			label: 'Causa',
			order: 0,
		},
		{
			id: 'effect',
			isEnabled: () => !!form.getValues('cause'),
			isValid: () => !!form.getValues('effect'),
			isVisible: true,
			label: 'Efeito',
			order: 1,
		},
		{
			id: 'agency',
			isEnabled: () => !!form.getValues('cause') && !!form.getValues('effect'),
			isValid: () => !!form.getValues('agency_id'),
			isVisible: agenciesData?.length > 1,
			label: 'Operador',
			order: 2,
		},
		{
			id: 'dates',
			isEnabled: () => !!form.getValues('agency_id'),
			isValid: () => !!form.getValues('active_period_start_date'),
			isVisible: meContext.actions.hasPermission(PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.update_dates),
			label: 'Datas',
			order: 3,
		},
		{
			id: 'references',
			isEnabled: () => !!form.getValues('cause') && !!form.getValues('effect') && !!form.getValues('agency_id') && !!form.getValues('active_period_start_date'),
			isValid: () => !!form.getValues('reference_type') && !!form.getValues('agency_id') && !!form.getValues('references')?.length,
			isVisible: true,
			label: 'Referências',
			order: 4,
		},
		{
			id: 'summary',
			isEnabled: () => !!form.getValues('cause') && !!form.getValues('effect') && !!form.getValues('active_period_start_date') && !!form.getValues('reference_type') && !!form.getValues('agency_id') && !!form.getValues('references')?.length,
			isValid: () => !!form.getValues('cause') && !!form.getValues('effect') && !!form.getValues('active_period_start_date') && !!form.getValues('reference_type') && !!form.getValues('agency_id') && !!form.getValues('references')?.length && !!form.getValues('title')?.length && !!form.getValues('description')?.length,
			isVisible: true,
			label: 'Resumo',
			order: 5,
		},

	], [agenciesData?.length, form, meContext.actions]);

	const multiStep = useMultiStep({ steps });

	//
	// F. Submit action

	const { action: handleCreate, isLoading: isCreating } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.ALERTS_LIST, 'POST', form.getValues()),
		onSuccess: (updatedItem) => {
			form.reset();
			unblock();
			alertsListMutate();
			if (updatedItem?._id) router.push(keepUrlParams(PAGE_ROUTES.alerts.ALERTS_DETAIL(updatedItem._id)));
		},
	});

	//
	// G. Define state
	// control, getValues, setValue are stable references from useForm and do not
	// change between renders, so they are safe to include in the memoized value.

	const contextValue = useMemo<AlertCreateContextState>(() => ({
		actions: {
			create: handleCreate,
		},
		flags: {
			canCreate: true,
			error: undefined,
			isCreating,
			isLoading: agenciesLoading,
		},
		form: {
			instance: form,
			multi_step: multiStep,
		},
	}), [agenciesLoading, form, handleCreate, isCreating, multiStep]);

	//
	// H. Return state

	return (
		<AlertCreateContext.Provider value={contextValue}>
			{children}
		</AlertCreateContext.Provider>
	);

	//
}
