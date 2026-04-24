'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import { type Alert, alertCauseEffectReferenceTypeMap, type CreateAlertDto, CreateAlertSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { type CreateContextStateTemplate, keepUrlParams, useDataAgencies, type UseFormReturnType, useHandleUpdate, useMeContext, useMultiStep, type UseMultiStepReturnType, useTypicalForm, useTypicalFormWatch } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface AlertCreateContextState extends CreateContextStateTemplate {
	data: {
		enabled_reference_types: Alert['reference_type'][]
		form: UseFormReturnType<CreateAlertDto>
		multi_step: UseMultiStepReturnType
	}
};

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
	// B. Fetch data

	const { mutate: alertsListMutate } = useSWR<Alert[]>(API_ROUTES.alerts.ALERTS_LIST);

	const { options: agenciesOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.alerts.actions.create],
		scope: PermissionCatalog.all.alerts.scope,
	});

	//
	// C. Setup form

	const { formRef } = useTypicalForm<CreateAlertDto>(CreateAlertSchema);

	const watchedFormValues = useTypicalFormWatch(formRef.current, [
		'cause',
		'effect',
		'agency_id',
		'active_period_start_date',
		'active_period_end_date',
		'reference_type',
		'references',
		'publish_status',
	]);

	const multiStep = useMultiStep({
		steps: [
			{
				id: 'cause',
				isValid: () => !!formRef.current.getValues().cause,
				isVisible: true,
				label: 'Causa',
				order: 0,
			},
			{
				id: 'effect',
				isEnabled: () => !!formRef.current.getValues().cause,
				isValid: () => !!formRef.current.getValues().effect,
				isVisible: true,
				label: 'Efeito',
				order: 1,
			},
			{
				id: 'agency',
				isEnabled: () => !!formRef.current.getValues().cause && !!formRef.current.getValues().effect,
				isValid: () => !!formRef.current.getValues().agency_id,
				isVisible: agenciesOptions?.length > 1,
				label: 'Operador',
				order: 2,
			},
			{
				id: 'dates',
				isEnabled: () => !!formRef.current.getValues().agency_id,
				isValid: () => !!formRef.current.getValues().active_period_start_date,
				isVisible: meContext.actions.hasPermission(PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.update_dates),
				label: 'Datas',
				order: 3,
			},
			{
				id: 'references',
				isEnabled: () => !!formRef.current.getValues().cause && !!formRef.current.getValues().effect && !!formRef.current.getValues().active_period_start_date,
				isValid: () => !!formRef.current.getValues().reference_type && !!formRef.current.getValues().agency_id && !!formRef.current.getValues().references?.length,
				isVisible: true,
				label: 'Referências',
				order: 4,
			},
			{
				id: 'summary',
				isEnabled: () => !!formRef.current.getValues().cause && !!formRef.current.getValues().effect && !!formRef.current.getValues().active_period_start_date && !!formRef.current.getValues().reference_type && !!formRef.current.getValues().agency_id && !!formRef.current.getValues().references?.length,
				isVisible: true,
				label: 'Resumo',
				order: 5,
			},
		],
	});

	//
	// D. Transform data

	const enabledReferenceTypes = useMemo(() => {
		// Extract the possible reference types
		// for the selected cause and effect.
		const causeMapValue = alertCauseEffectReferenceTypeMap[watchedFormValues.cause];
		if (!causeMapValue) return [];
		// If there is a valid cause, get the reference types
		// for the selected effect.
		const effectMapValue = causeMapValue[watchedFormValues.effect];
		if (!effectMapValue) return [];
		// Return the reference types that are valid
		// for the selected cause and effect.
		return effectMapValue;
	}, [watchedFormValues.cause, watchedFormValues.effect]);

	//
	// D. Handle actions

	useEffect(() => {
		if (watchedFormValues.agency_id) return;
		if (agenciesOptions?.length === 1) formRef.current.setFieldValue('agency_id', agenciesOptions[0].value);
	}, [watchedFormValues.agency_id, agenciesOptions, formRef]);

	useEffect(() => {
		if (watchedFormValues.publish_status) return;
		formRef.current.setFieldValue('publish_status', 'published');
	}, [formRef, watchedFormValues.publish_status]);

	useEffect(() => {
		if (watchedFormValues.active_period_start_date) return;
		// Set active period start date to 5 minutes ago
		formRef.current.setFieldValue('active_period_start_date', Dates.now('Europe/Lisbon').minus({ minutes: 5 }).set({ millisecond: 0, second: 0 }).unix_timestamp);
		// Set publish start date to start of today to ensure alert is visible immediately
		formRef.current.setFieldValue('publish_start_date', Dates.now('Europe/Lisbon').startOf('day').unix_timestamp);
	}, [formRef, watchedFormValues.active_period_start_date]);

	useEffect(() => {
		if (watchedFormValues.active_period_end_date) return;
		// Set active period end date to the end today
		formRef.current.setFieldValue('active_period_end_date', Dates.now('Europe/Lisbon').plus({ hours: 4 }).unix_timestamp);
		// Set publish end date to end of today
		formRef.current.setFieldValue('publish_end_date', Dates.now('Europe/Lisbon').endOf('day').unix_timestamp);
	}, [formRef, watchedFormValues.active_period_end_date]);

	useEffect(() => {
		// Skip if reference type is already set
		if (formRef.current.getValues().reference_type) return;
		// Skip if there are no enabled reference types
		if (!enabledReferenceTypes.length) return;
		// Get permission definition for reference types
		const createPermission = PermissionCatalog.get(meContext.data.user.permissions, PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.create);
		// Set the reference type based on alert cause/effect when possible
		if (createPermission?.resources.reference_types.includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			if (enabledReferenceTypes.includes('lines')) return formRef.current.setFieldValue('reference_type', 'lines');
			if (enabledReferenceTypes.includes('stops')) return formRef.current.setFieldValue('reference_type', 'stops');
			if (enabledReferenceTypes.includes('rides')) return formRef.current.setFieldValue('reference_type', 'rides');
			if (enabledReferenceTypes.includes('agency')) return formRef.current.setFieldValue('reference_type', 'agency');
			return Logger.info('No enabled reference types available to set as default.');
		}
		// Set the reference type based on permissions
		if (enabledReferenceTypes.includes('lines') && createPermission?.resources.reference_types.includes('lines')) return formRef.current.setFieldValue('reference_type', 'lines');
		if (enabledReferenceTypes.includes('stops') && createPermission?.resources.reference_types.includes('stops')) return formRef.current.setFieldValue('reference_type', 'stops');
		if (enabledReferenceTypes.includes('rides') && createPermission?.resources.reference_types.includes('rides')) return formRef.current.setFieldValue('reference_type', 'rides');
		if (enabledReferenceTypes.includes('agency') && createPermission?.resources.reference_types.includes('agency')) return formRef.current.setFieldValue('reference_type', 'agency');
	}, [watchedFormValues.reference_type, enabledReferenceTypes, meContext.data.user.permissions, formRef]);

	useEffect(() => {
		// Skip if reference type is not agency
		if (watchedFormValues.reference_type !== 'agency') return;
		// Skip if no agency_id selected
		if (!watchedFormValues.agency_id) return;
		// Set selected references to the selected agency
		formRef.current.setFieldValue('references', [{ child_ids: [], parent_id: watchedFormValues.agency_id }]);
	}, [watchedFormValues.reference_type, watchedFormValues.agency_id, formRef]);

	useEffect(() => {
		// Reset effect and reference type when cause changes as they are dependent on cause
		formRef.current.setFieldValue('effect', null);
		formRef.current.setFieldValue('reference_type', null);
		formRef.current.setFieldValue('references', []);
	}, [formRef, watchedFormValues.cause]);

	useEffect(() => {
		// Reset reference type when effect changes as they are dependent on effect
		formRef.current.setFieldValue('reference_type', null);
		formRef.current.setFieldValue('references', []);
	}, [formRef, watchedFormValues.effect]);

	const { action: handleCreate, isLoading: isCreating } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.ALERTS_LIST, 'POST', formRef.current.getValues()),
		onSuccess: (updatedItem) => {
			alertsListMutate();
			if (updatedItem?._id) router.push(keepUrlParams(PAGE_ROUTES.alerts.ALERTS_DETAIL(updatedItem._id)));
		},
	});

	//
	// E. Define State

	const contextValue: AlertCreateContextState = {
		actions: {
			create: handleCreate,
		},
		data: {
			enabled_reference_types: enabledReferenceTypes,
			form: formRef.current,
			multi_step: multiStep,
		},
		flags: {
			canCreate: true,
			error: undefined,
			isCreating,
			isLoading: false,
		},
	};

	//
	// F. Return state

	return (
		<AlertCreateContext.Provider value={contextValue}>
			{children}
		</AlertCreateContext.Provider>
	);

	//
};
