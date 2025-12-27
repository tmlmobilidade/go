'use client';

/* * */

import { useLinesContext } from '@/contexts/Lines.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { describeAlert } from '@tmlmobilidade/go-alerts-pckg-describe';
import { type Alert, type CreateAlertDto, CreateAlertSchema, PermissionCatalog, type RideNormalized, UnixTimestamp } from '@tmlmobilidade/types';
import { type CreateContextStateTemplate, keepUrlParams, useClockUpdates, useDataAgencies, useDataRides, useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType, type UseFormReturnType, useHandleUpdate, useMultiStep, type UseMultiStepReturnType, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

export const createRealtimeSteps = ['cause', 'effect', 'trip', 'summary'] as const;

/* * */

interface RealtimeCreateContextState extends CreateContextStateTemplate {
	actions: CreateContextStateTemplate['actions'] & {
		removeAllRides: () => void
		toggleRideSelection: (rideId: string) => void
	}
	data: {
		filtered_rides: RideNormalized[]
		form: UseFormReturnType<CreateAlertDto>
		multi_step: UseMultiStepReturnType<typeof createRealtimeSteps>
	}
	filters: {
		lines: UseFilterStateListReturnType
		search: UseFilterStateStringReturnType
		stops: UseFilterStateListReturnType
		view_mode?: UseFilterStateStringReturnType
	}
	flags: CreateContextStateTemplate['flags'] & {
		isRidesLoading: boolean
	}
};

/* * */

const RealtimeCreateContext = createContext<RealtimeCreateContextState | undefined>(undefined);

export function useRealtimeCreateContext() {
	const context = useContext(RealtimeCreateContext);
	if (!context) {
		throw new Error('useRealtimeCreateContext must be used within a RealtimeCreateContextProvider');
	}
	return context;
}

/* * */

export const RealtimeCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();

	const filterLines = useFilterStateList('lines', [], linesContext.data.options);
	const filterStops = useFilterStateList('stops', [], stopsContext.data.options);
	const filterSearch = useFilterStateString('search');
	const filterViewMode = useFilterStateString('view_mode', 'all');

	const minuteUpdates = useClockUpdates('minute');

	const [startDate, setStartDate] = useState<UnixTimestamp>();
	const [endDate, setEndDate] = useState<UnixTimestamp>();

	//
	// B. Fetch data

	const { mutate: realtimeListMutate } = useSWR<Alert[]>(API_ROUTES.alerts.REALTIME_LIST);

	const { filteredIds: filteredAgencyIds } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.alerts.actions.read_realtime],
		scope: PermissionCatalog.all.alerts.scope,
	});

	const { isLoading: ridesLoading, raw: ridesData } = useDataRides(API_ROUTES.alerts.RIDES_LIST, {
		filters: {
			agency_ids: filteredAgencyIds,
			date_end: endDate,
			date_start: startDate,
			line_ids: filterLines.value,
			operational_statuses: ['running', 'missed', 'scheduled'],
			search: filterSearch.value,
			stop_ids: filterStops.value,
		},
	});

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateAlertDto>(CreateAlertSchema);

	const multiStep = useMultiStep({
		steps: createRealtimeSteps,
		validate: (step) => {
			switch (step) {
				case 'cause':
					return true;
				case 'effect':
					return form.getValues().cause !== undefined;
				case 'summary':
					return form.getValues().cause !== undefined && form.getValues().effect !== undefined && form.getValues().references !== undefined && form.getValues().references.length > 0;
				case 'trip':
					return form.getValues().cause !== undefined && form.getValues().effect !== undefined;
				default:
					return false;
			}
		},
	});

	//
	// D. Handle actions

	useEffect(() => {
		(async () => {
			form.setFieldValue('type', 'realtime');
			const alertTemplating = await describeAlert({
				alert_type: 'realtime',
				cause: form.getValues().cause,
				data: {
					rides: ridesData.filter(ride => form.getValues().references?.some(reference => reference.parent_id === ride._id)),
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

	const validateSteps = () => {
		return true;
	};

	useEffect(() => {
		// Skip if clock is not ready
		if (!minuteUpdates) return;
		// Prevent changing dates if rides are selected
		if (form.getValues().references?.length > 0) return;
		// Update dates to refresh rides. This sets a window
		// of availability that is reset every minute.
		setStartDate(minuteUpdates.minus({ minutes: 30 }).unix_timestamp);
		setEndDate(minuteUpdates.plus({ hours: 4 }).unix_timestamp);
	}, [minuteUpdates]);

	const { action: handleCreate, isLoading: isCreating } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.REALTIME_LIST, 'POST', form.getValues()),
		onSuccess: (updatedItem) => {
			realtimeListMutate();
			if (updatedItem?._id) router.push(keepUrlParams(PAGE_ROUTES.alerts.REALTIME_DETAIL(updatedItem._id)));
		},
	});

	const toggleRideSelection = (rideId: string) => {
		// Get existing references
		const existingReferences = form.getValues().references ?? [];
		// If ride is already selected, remove it and return
		if (existingReferences?.some(reference => reference.parent_id === rideId)) {
			form.setFieldValue('references', existingReferences.filter(reference => reference.parent_id !== rideId));
			return;
		}
		// Otherwise, add it to the references array
		form.setFieldValue('references', [...existingReferences, { child_ids: [], parent_id: rideId }]);
	};

	const removeAllRides = () => {
		form.setFieldValue('references', []);
	};

	//
	// E. Define State

	const contextValue: RealtimeCreateContextState = useMemo(() => ({
		actions: {
			create: handleCreate,
			removeAllRides,
			toggleRideSelection,
		},
		data: {
			filtered_rides: ridesData,
			form,
			multi_step: multiStep,
		},
		filters: {
			lines: filterLines,
			search: filterSearch,
			stops: filterStops,
			view_mode: filterViewMode,
		},
		flags: {
			canCreate: true,
			error: undefined,
			isCreating,
			isLoading: false,
			isRidesLoading: ridesLoading,
		},
	}), [
		filterStops,
		ridesData,
		form,
		isCreating,
		filterLines,
		filterSearch,
		filterViewMode,
		ridesLoading,
		multiStep,
	]);

	//
	// F. Return state

	return (
		<RealtimeCreateContext.Provider value={contextValue}>
			{children}
		</RealtimeCreateContext.Provider>
	);

	//
};
