'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { describeAlert } from '@tmlmobilidade/go-alerts-pckg-describe';
import { type Alert, type CreateAlertDto, CreateAlertSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { type CreateContextStateTemplate, keepUrlParams, type UseFormReturnType, useHandleUpdate, useMeContext, useMultiStep, type UseMultiStepReturnType, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface AlertCreateContextState extends CreateContextStateTemplate {
	data: {
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

export const AlertCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const meContext = useMeContext();

	//
	// B. Fetch data

	const { mutate: alertsListMutate } = useSWR<Alert[]>(API_ROUTES.alerts.ALERTS_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateAlertDto>(CreateAlertSchema);

	const multiStep = useMultiStep({
		steps: [
			{ id: 'cause', label: 'Causa', order: 0 },
			{ id: 'effect', label: 'Efeito', order: 1 },
			{ id: 'dates', label: 'Datas', order: 2 },
			{ id: 'references', label: 'Referências', order: 3 },
			{ id: 'summary', label: 'Resumo', order: 4 },
		],
	});

	//
	// D. Handle actions

	useEffect(() => {
		(async () => {
			const alertTemplating = await describeAlert({
				cause: form.getValues().cause,
				data: {
					rides: [],
				},
				effect: form.getValues().effect,
				reference_type: 'rides',
				references: form.getValues().references ?? [],
			});
			if (!alertTemplating) return;
			form.setFieldValue('description', alertTemplating.description.pt);
			form.setFieldValue('title', alertTemplating.title.pt);
		})();
	}, [form.getValues()]);

	useEffect(() => {
		if (!form.getValues().publish_status) {
			form.setFieldValue('publish_status', 'published');
		}
	}, [form.getValues().publish_status]);

	useEffect(() => {
		if (!form.getValues().active_period_start_date) {
			form.setFieldValue('active_period_start_date', Dates.now('Europe/Lisbon').minus({ minutes: 5 }).set({ millisecond: 0, second: 0 }).unix_timestamp);
		}
	}, [form.getValues().active_period_start_date]);

	useEffect(() => {
		if (!form.getValues().reference_type) {
			const createPermission = PermissionCatalog.get(meContext.data.user.permissions, PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.create);
			if (createPermission.resources.reference_types.includes('lines')) return form.setFieldValue('reference_type', 'lines');
			if (createPermission.resources.reference_types.includes('stops')) return form.setFieldValue('reference_type', 'stops');
			if (createPermission.resources.reference_types.includes('rides')) return form.setFieldValue('reference_type', 'rides');
		}
	}, [form.getValues().reference_type]);

	const { action: handleCreate, isLoading: isCreating } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.ALERTS_LIST, 'POST', form.getValues()),
		onSuccess: (updatedItem) => {
			alertsListMutate();
			if (updatedItem?._id) router.push(keepUrlParams(PAGE_ROUTES.alerts.ALERTS_DETAIL(updatedItem._id)));
		},
	});

	//
	// E. Define State

	const contextValue: AlertCreateContextState = useMemo(() => ({
		actions: {
			create: handleCreate,
		},
		data: {
			form,
			multi_step: multiStep,
		},
		flags: {
			canCreate: true,
			error: undefined,
			isCreating,
			isLoading: false,
		},
	}), [
		form,
		isCreating,
		multiStep,
	]);

	//
	// F. Return state

	return (
		<AlertCreateContext.Provider value={contextValue}>
			{children}
		</AlertCreateContext.Provider>
	);

	//
};
