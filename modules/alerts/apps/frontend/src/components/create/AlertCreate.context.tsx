'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { describeAlert } from '@tmlmobilidade/go-alerts-pckg-describe';
import { type Alert, type CreateAlertDto, CreateAlertSchema } from '@tmlmobilidade/types';
import { type CreateContextStateTemplate, keepUrlParams, type UseFormReturnType, useHandleUpdate, useMultiStep, type UseMultiStepReturnType, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';

/* * */

export const createRealtimeSteps = ['cause', 'effect', 'references', 'summary'] as const;

/* * */

interface AlertCreateContextState extends CreateContextStateTemplate {
	data: {
		form: UseFormReturnType<CreateAlertDto>
		multi_step: UseMultiStepReturnType<typeof createRealtimeSteps>
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

	//
	// B. Fetch data

	const { mutate: alertsListMutate } = useSWR<Alert[]>(API_ROUTES.alerts.ALERTS_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateAlertDto>(CreateAlertSchema);

	console.log(form.getValues());

	const multiStep = useMultiStep({
		steps: createRealtimeSteps,
		validate: (step) => {
			switch (step) {
				case 'cause':
					return true;
				case 'effect':
					return form.getValues().cause !== undefined;
				case 'references':
					return form.getValues().cause !== undefined && form.getValues().effect !== undefined;
				case 'summary':
					return form.getValues().cause !== undefined && form.getValues().effect !== undefined && form.getValues().references !== undefined && form.getValues().references.length > 0;
				default:
					return false;
			}
		},
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
			console.log({ alertTemplating });
			if (!alertTemplating) return;
			form.setFieldValue('description', alertTemplating.description.pt);
			form.setFieldValue('title', alertTemplating.title.pt);
		})();
	}, [form.getValues()]);

	useEffect(() => {
		if (!form.getValues().active_period_start_date) {
			form.setFieldValue('active_period_start_date', Dates.now('Europe/Lisbon').minus({ minutes: 5 }).unix_timestamp);
		}
	}, [form.getValues().reference_type]);

	useEffect(() => {
		if (!form.getValues().reference_type) {
			form.setFieldValue('reference_type', 'lines');
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
