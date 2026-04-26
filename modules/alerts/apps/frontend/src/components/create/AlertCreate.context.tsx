'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { describeAlert, type DescribeAlertReturnType } from '@tmlmobilidade/go-alerts-pckg-describe';
import { Logger } from '@tmlmobilidade/logger';
import { type Alert, alertCauseEffectReferenceTypeMap, type CreateAlertDto, CreateAlertSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { type CreateContextStateTemplate, keepUrlParams, useDataAgencies, useDataOperationLines, useDataRides, type UseFormReturnType, useHandleUpdate, useMeContext, useMultiStep, type UseMultiStepReturnType, useTypicalForm, useTypicalFormWatch } from '@tmlmobilidade/ui';
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
	// B. Setup form

	const { formRef } = useTypicalForm<CreateAlertDto>(CreateAlertSchema);

	const watchedFormValues = useTypicalFormWatch(formRef.current, [
		'cause',
		'effect',
		'agency_id',
		'auto_texts',
		'active_period_start_date',
		'active_period_end_date',
		'reference_type',
		'references',
		'publish_status',
	]);

	//
	// C. Fetch data

	const { mutate: alertsListMutate } = useSWR<Alert[]>(API_ROUTES.alerts.ALERTS_LIST);

	const { raw: agenciesData } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.alerts.actions.create],
		scope: PermissionCatalog.all.alerts.scope,
	});

	const { raw: operationLinesData } = useDataOperationLines(API_ROUTES.alerts.OPERATION_LINES, {
		filters: {
			agency_ids: watchedFormValues.agency_id ? [watchedFormValues.agency_id] : [],
			date_end: watchedFormValues.active_period_end_date,
			date_start: watchedFormValues.active_period_start_date,
		},
	});

	const { raw: ridesData } = useDataRides(API_ROUTES.alerts.RIDES_LIST, {
		filters: {
			agency_ids: watchedFormValues.agency_id ? [watchedFormValues.agency_id] : [],
			date_end: watchedFormValues.active_period_end_date,
			date_start: watchedFormValues.active_period_start_date,
			operational_statuses: ['running', 'missed', 'scheduled'],
		},
	});

	//
	// D. Transform data

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
				isVisible: agenciesData?.length > 1,
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
				isEnabled: () => !!formRef.current.getValues().cause && !!formRef.current.getValues().effect && !!formRef.current.getValues().agency_id && !!formRef.current.getValues().active_period_start_date,
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
	// E. Handle actions

	useEffect(() => {
		// Skip if agency_id is already set
		if (watchedFormValues.agency_id) return;
		// Pre-select agency if there is only one available
		if (agenciesData?.length === 1) formRef.current.setFieldValue('agency_id', agenciesData[0]._id);
	}, [watchedFormValues.agency_id, agenciesData, formRef]);

	useEffect(() => {
		// Skip if publish status is already set
		if (watchedFormValues.publish_status) return;
		// Set publish status to published to ensure alert is visible immediately
		formRef.current.setFieldValue('publish_status', 'published');
	}, [formRef, watchedFormValues.publish_status]);

	useEffect(() => {
		// Skip if active period start date is already set
		if (watchedFormValues.active_period_start_date) return;
		// Set active period start date to 30 minutes ago
		formRef.current.setFieldValue('active_period_start_date', Dates.now('Europe/Lisbon').minus({ minutes: 30 }).set({ millisecond: 0, second: 0 }).unix_timestamp);
		// Set publish start date to start of today to ensure alert is visible immediately
		formRef.current.setFieldValue('publish_start_date', Dates.now('Europe/Lisbon').startOf('day').unix_timestamp);
	}, [formRef, watchedFormValues.active_period_start_date]);

	useEffect(() => {
		// Skip if active period end date is already set
		if (watchedFormValues.active_period_end_date) return;
		// Set active period end date to the end today
		formRef.current.setFieldValue('active_period_end_date', Dates.now('Europe/Lisbon').plus({ hours: 4 }).unix_timestamp);
		// Set publish end date to end of today
		formRef.current.setFieldValue('publish_end_date', Dates.now('Europe/Lisbon').endOf('day').unix_timestamp);
	}, [formRef, watchedFormValues.active_period_end_date]);

	useEffect(() => {
		// Skip if reference type is already set
		if (watchedFormValues.reference_type) return;
		// Skip if there are no enabled reference types
		if (!enabledReferenceTypes.length) return;
		// Get permission definition for reference types
		const createPermission = PermissionCatalog.get(meContext.data.user.permissions, PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.create);
		// Get reference types availability based on permissions
		const canUseAllReferenceTypes = createPermission?.resources.reference_types.includes(PermissionCatalog.ALLOW_ALL_FLAG);
		const allowedReferenceTypes = createPermission?.resources.reference_types;
		// Set the reference type based on alert cause/effect when possible
		if (enabledReferenceTypes.includes('lines') && (canUseAllReferenceTypes || allowedReferenceTypes.includes('lines'))) {
			formRef.current.setFieldValue('reference_type', 'lines');
		} else if (enabledReferenceTypes.includes('stops') && (canUseAllReferenceTypes || allowedReferenceTypes.includes('stops'))) {
			formRef.current.setFieldValue('reference_type', 'stops');
		} else if (enabledReferenceTypes.includes('rides') && (canUseAllReferenceTypes || allowedReferenceTypes.includes('rides'))) {
			formRef.current.setFieldValue('reference_type', 'rides');
		} else if (enabledReferenceTypes.includes('agency') && (canUseAllReferenceTypes || allowedReferenceTypes.includes('agency'))) {
			formRef.current.setFieldValue('reference_type', 'agency');
		} else {
			Logger.info('No enabled reference types available to set as default.');
		}
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
		// Skip if auto_texts is either true of false
		if (watchedFormValues.auto_texts === true) return;
		if (watchedFormValues.auto_texts === false) return;
		// Preset auto texts flag to true when unset
		formRef.current.setFieldValue('auto_texts', true);
	}, [formRef, watchedFormValues.auto_texts]);

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

	useEffect(() => {
		// Skip if auto texts is not enabled
		if (!watchedFormValues.auto_texts) return;
		// Skip if required fields for templating are not filled
		if (!watchedFormValues.cause) return;
		if (!watchedFormValues.effect) return;
		if (!watchedFormValues.reference_type) return;
		if (!watchedFormValues.references?.length) return;
		// Generate alert templating and set title and description based on it
		let alertTemplating: DescribeAlertReturnType;
		if (watchedFormValues.reference_type === 'agency') {
			// Filter agenciesData to find the selected agency based on parent_id in references
			const selectedAgencyData = agenciesData.find(agency => String(agency._id) === String(watchedFormValues.references[0].parent_id));
			if (!selectedAgencyData) return;
			// Generate alert templating
			alertTemplating = describeAlert({
				cause: watchedFormValues.cause,
				data: selectedAgencyData,
				effect: watchedFormValues.effect,
				reference_type: 'agency',
				references: watchedFormValues.references,
			});
		} else if (watchedFormValues.reference_type === 'lines') {
			// Filter operationLinesData to find the selected lines based on parent_id in references
			const selectedOperationLinesData = operationLinesData.filter(line => watchedFormValues.references.some(ref => String(ref.parent_id) === String(line.line_id)));
			if (!selectedOperationLinesData.length) return;
			// Generate alert templating
			alertTemplating = describeAlert({
				cause: watchedFormValues.cause,
				data: selectedOperationLinesData,
				effect: watchedFormValues.effect,
				reference_type: 'lines',
				references: watchedFormValues.references,
			});
		} else if (watchedFormValues.reference_type === 'rides') {
			// Filter ridesData to find the selected rides based on parent_id in references
			const selectedRidesData = ridesData.filter(ride => watchedFormValues.references.some(ref => String(ref.parent_id) === String(ride._id)));
			if (!selectedRidesData.length) return;
			// Generate alert templating
			alertTemplating = describeAlert({
				cause: watchedFormValues.cause,
				data: selectedRidesData,
				effect: watchedFormValues.effect,
				reference_type: 'rides',
				references: watchedFormValues.references,
			});
		// } else if (watchedFormValues.reference_type === 'stops') {
		// 	// Filter stopsData to find the selected stops based on parent_id in references
		// 	const selectedStopsData = stopsData.filter(stop => watchedFormValues.references.some(ref => String(ref.parent_id) === String(stop._id)));
		// 	if (!selectedStopsData.length) return;
		// 	// Generate alert templating
		// 	alertTemplating = describeAlert({
		// 		cause: watchedFormValues.cause,
		// 		data: selectedStopsData,
		// 		effect: watchedFormValues.effect,
		// 		reference_type: 'stops',
		// 		references: watchedFormValues.references,
		// 	});
		}
		if (!alertTemplating) return;
		formRef.current.setFieldValue('description', alertTemplating.description.pt);
		formRef.current.setFieldValue('title', alertTemplating.title.pt);
	}, [agenciesData, formRef, operationLinesData, ridesData, watchedFormValues.auto_texts, watchedFormValues.cause, watchedFormValues.effect, watchedFormValues.reference_type, watchedFormValues.references]);

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
