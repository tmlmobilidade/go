'use client';

/* * */

import { type Line, type Stop } from '@carrismetropolitana/api-types/network';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { describeAlert } from '@tmlmobilidade/go-alerts-pckg-describe';
import { type Alert, type CreateAlertDto, CreateAlertSchema, PermissionCatalog, RideNormalized } from '@tmlmobilidade/types';
import { type CreateContextStateTemplate, keepUrlParams, type UseFormReturnType, useHandleUpdate, useMeContext, useMultiStep, type UseMultiStepReturnType, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';
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

	const [selectedReferencesData, setSelectedReferencesData] = useState<RideNormalized[] | { id: string, long_name: string, short_name: string }[] | { id: string, name: string }[]>([]);

	//
	// B. Fetch data

	const { mutate: alertsListMutate } = useSWR<Alert[]>(API_ROUTES.alerts.ALERTS_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateAlertDto>(CreateAlertSchema);

	const multiStep = useMultiStep({
		steps: [
			{
				id: 'cause',
				isValid: () => !!form.getValues().cause,
				isVisible: true,
				label: 'Causa',
				order: 0,
			},
			{
				id: 'effect',
				isEnabled: () => !!form.getValues().cause,
				isValid: () => !!form.getValues().effect,
				isVisible: true,
				label: 'Efeito',
				order: 1,
			},
			{
				id: 'dates',
				isEnabled: () => !!form.getValues().cause && !!form.getValues().effect,
				isValid: () => !!form.getValues().active_period_start_date,
				isVisible: meContext.actions.hasPermission(PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.update_dates),
				label: 'Datas',
				order: 2,
			},
			{
				id: 'references',
				isEnabled: () => !!form.getValues().cause && !!form.getValues().effect && !!form.getValues().active_period_start_date,
				isValid: () => !!form.getValues().reference_type && !!form.getValues().agency_id,
				isVisible: true,
				label: 'Referências',
				order: 3,
			},
			{
				id: 'summary',
				isEnabled: () => !!form.getValues().cause && !!form.getValues().effect && !!form.getValues().active_period_start_date && !!form.getValues().reference_type && !!form.getValues().agency_id,
				isVisible: true,
				label: 'Resumo',
				order: 4,
			},
		],
	});

	//
	// D. Handle actions

	useEffect(() => {
		(async () => {
			if (!form.getValues().cause || !form.getValues().effect || !form.getValues().reference_type || !form.getValues().references?.length) return;
			const alertTemplating = await describeAlert({
				cause: form.getValues().cause,
				data: {
					lines: (selectedReferencesData as { id: string, long_name: string, short_name: string }[]),
					rides: (selectedReferencesData as RideNormalized[]),
					stops: (selectedReferencesData as { id: string, name: string }[]),
				},
				effect: form.getValues().effect,
				reference_type: form.getValues().reference_type,
				references: form.getValues().references ?? [],
			});
			if (!alertTemplating) return;
			form.setFieldValue('description', alertTemplating.description.pt);
			form.setFieldValue('title', alertTemplating.title.pt);
		})();
	}, [
		selectedReferencesData,
		form.getValues().cause,
		form.getValues().effect,
		form.getValues().reference_type,
		form.getValues().references?.length,
	]);

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
			if (createPermission.resources.reference_types.includes(PermissionCatalog.ALLOW_ALL_FLAG)) return form.setFieldValue('reference_type', 'lines');
			if (createPermission.resources.reference_types.includes('lines')) return form.setFieldValue('reference_type', 'lines');
			if (createPermission.resources.reference_types.includes('stops')) return form.setFieldValue('reference_type', 'stops');
			if (createPermission.resources.reference_types.includes('rides')) return form.setFieldValue('reference_type', 'rides');
		}
	}, [form.getValues().reference_type]);

	useEffect(() => {
		(async () => {
			// Reset if no selected reference_type
			if (!form.getValues().reference_type) return setSelectedReferencesData([]);
			// Reset state if no selected references
			if (!form.getValues().references?.length) return setSelectedReferencesData([]);
			// Get a list of unique parent_ids
			const parentIds = form.getValues().references.map(reference => reference.parent_id);
			// Fetch data for lines
			if (form.getValues().reference_type === 'lines') {
				const response = await fetch('https://api.carrismetropolitana.pt/v2/lines');
				const linesData = await response.json() as Line[];
				const result: Line[] = linesData.filter(line => parentIds.includes(line.id));
				setSelectedReferencesData(result);
			}
			// Fetch data for stops
			if (form.getValues().reference_type === 'stops') {
				const response = await fetch('https://api.carrismetropolitana.pt/v2/stops');
				const stopsData = await response.json() as Stop[];
				const result: Stop[] = stopsData.filter(stop => parentIds.includes(stop.id));
				setSelectedReferencesData(result);
			}
			// Fetch data for rides
			if (form.getValues().reference_type === 'rides') {
				const result: RideNormalized[] = [];
				for (const rideId of parentIds) {
					const response = await fetchData<RideNormalized>(API_ROUTES.alerts.RIDES_DETAIL_RIDE(rideId));
					if (!response.data) continue;
					result.push(response.data);
				}
				setSelectedReferencesData(result);
			}
		})();
	}, [form.getValues().reference_type, form.getValues().references]);

	const { action: handleCreate, isLoading: isCreating } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.ALERTS_LIST, 'POST', form.getValues()),
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
			form,
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
