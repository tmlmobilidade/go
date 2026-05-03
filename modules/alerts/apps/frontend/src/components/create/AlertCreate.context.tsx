'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import { type Alert, alertCauseEffectReferenceTypeMap, type CreateAlertDto, CreateAlertSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { type CreateContextStateTemplate, keepUrlParams, useContextForm, useDataAgencies, useHandleUpdate, useMeContext, useMultiStep, type UseMultiStepReturnType } from '@tmlmobilidade/ui';
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
	// C. Fetch data

	const { mutate: alertsListMutate } = useSWR<Alert[]>(API_ROUTES.alerts.ALERTS_LIST);

	const { raw: agenciesData } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.alerts.actions.create],
		scope: PermissionCatalog.all.alerts.scope,
	});

	//
	// B. Setup form with react-hook-form
	// One-time initializations are handled via defaultValues instead of effects,
	// eliminating the polling re-render cycle from useTypicalFormWatch.

	const form = useContextForm<CreateAlertDto>({
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

	//
	// D. Side effects

	useEffect(() => {
		// Pre-select agency when only one is available.
		// Reads getValues() imperatively so this effect
		// only runs when agenciesData changes,
		// not on every agency_id change.
		if (agenciesData?.length !== 1) return;
		if (form.getValues('agency_id')) return;
		form.setValue('agency_id', agenciesData[0]._id);
	}, [agenciesData, form]);

	// Reset downstream fields when cause changes.
	useEffect(() => {
		const sub = form.watch((_, { name }) => {
			if (name !== 'cause') return;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			form.setValue('effect', null as any);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			form.setValue('reference_type', null as any);
			form.setValue('references', []);
		});
		return () => sub.unsubscribe();
	}, [form]);

	// Reset reference_type and references when effect changes,
	// then auto-select the best reference_type based on permissions.
	useEffect(() => {
		const sub = form.watch((values, { name }) => {
			if (name !== 'effect') return;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			form.setValue('reference_type', null as any);
			form.setValue('references', []);
			if (!values.cause || !values.effect) return;
			const enabledTypes = alertCauseEffectReferenceTypeMap[values.cause]?.[values.effect] ?? [];
			if (!enabledTypes.length) return;
			const perm = PermissionCatalog.get(meContext.data.user.permissions, PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.create);
			const canAll = perm?.resources.reference_types.includes(PermissionCatalog.ALLOW_ALL_FLAG);
			const allowed = perm?.resources.reference_types ?? [];
			if (enabledTypes.includes('lines') && (canAll || allowed.includes('lines'))) form.setValue('reference_type', 'lines');
			else if (enabledTypes.includes('stops') && (canAll || allowed.includes('stops'))) form.setValue('reference_type', 'stops');
			else if (enabledTypes.includes('rides') && (canAll || allowed.includes('rides'))) form.setValue('reference_type', 'rides');
			else if (enabledTypes.includes('agency') && (canAll || allowed.includes('agency'))) form.setValue('reference_type', 'agency');
			else Logger.info('No enabled reference types available to set as default.');
		});
		return () => sub.unsubscribe();
	}, [form, meContext.data.user.permissions]);

	// When reference_type is 'agency' or agency_id changes while reference_type is 'agency',
	// sync references to the selected agency.
	useEffect(() => {
		const sub = form.watch((values, { name }) => {
			if (name !== 'reference_type' && name !== 'agency_id') return;
			if (values.reference_type !== 'agency' || !values.agency_id) return;
			form.setValue('references', [{ child_ids: [], parent_id: values.agency_id }]);
		});
		return () => sub.unsubscribe();
	}, [form]);

	// Restore default end dates when active_period_end_date is cleared.
	useEffect(() => {
		const sub = form.watch((values, { name }) => {
			if (name !== 'active_period_end_date' || values.active_period_end_date != null) return;
			form.setValue('active_period_end_date', Dates.now('Europe/Lisbon').plus({ hours: 4 }).unix_timestamp);
			form.setValue('publish_end_date', Dates.now('Europe/Lisbon').endOf('day').unix_timestamp);
		});
		return () => sub.unsubscribe();
	}, [form]);

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
			isValid: () => !!form.getValues('cause') && !!form.getValues('effect') && !!form.getValues('active_period_start_date') && !!form.getValues('reference_type') && !!form.getValues('agency_id') && !!form.getValues('references')?.length,
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
		data: {

		},
		flags: {
			canCreate: true,
			error: undefined,
			isCreating,
			isLoading: false,
		},
		form: {
			instance: form,
			multi_step: multiStep,
		},
	}), [form, handleCreate, isCreating, multiStep]);

	//
	// H. Return state

	return (
		<AlertCreateContext.Provider value={contextValue}>
			{children}
		</AlertCreateContext.Provider>
	);

	//
}
