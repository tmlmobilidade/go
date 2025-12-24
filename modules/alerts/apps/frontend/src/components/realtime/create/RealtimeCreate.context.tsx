'use client';

/* * */

import { useLinesContext } from '@/contexts/Lines.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { useDataRides } from '@/hooks/use-data-rides';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type Alert, type CreateAlertDto, CreateAlertSchema, PermissionCatalog, type RideNormalized, UnixTimestamp } from '@tmlmobilidade/types';
import { keepUrlParams, useDataAgencies, useFilterStateList, UseFilterStateListReturnType, useFilterStateString, UseFilterStateStringReturnType, type UseFormReturnType, useHandleUpdate, useMultiStep, UseMultiStepReturnType, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

export const createRealtimeSteps = ['cause', 'effect', 'trip', 'summary'] as const;

/* * */

interface RealtimeCreateContextState {
	actions: {
		create: () => Promise<void>
		removeAllRides: () => void
		selectVisibleRides: () => void
		setDetour: (detour: string) => void
		toggleRideSelection: (rideId: string) => void
	}
	data: {
		detour: string
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
	flags: {
		canSave: boolean
		isCreating: boolean
		ridesLoading: boolean
	}
};

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

	const [detour, setDetour] = useState<string>('');

	const filterSearch = useFilterStateString('search');
	const filterLines = useFilterStateList('lines', [], linesContext.data.options);
	const filterStops = useFilterStateList('stops', [], stopsContext.data.options);

	const filterViewMode = useFilterStateString('view_mode', 'all');

	const [startDate, setStartDate] = useState<UnixTimestamp>();
	const [endDate, setEndDate] = useState<UnixTimestamp>();

	//
	// B. Fetch data

	useEffect(() => {
		const setDates = () => {
			// Update start date to 30 minutes ago every minute
			const newStartDate = Dates.now('Europe/Lisbon').minus({ minutes: 30 }).unix_timestamp;
			setStartDate(newStartDate);
			// Update end date to now plus 4 hours every minute
			const newEndDate = Dates.now('Europe/Lisbon').plus({ hours: 4 }).unix_timestamp;
			setEndDate(newEndDate);
		};
		setDates();
		const interval = setInterval(setDates, 60000);
		return () => clearInterval(interval);
	}, []);

	// const startDate = Dates.now('Europe/Lisbon').minus({ minutes: 30 }).unix_timestamp;
	// const todayEndDate = Dates.now('Europe/Lisbon').endOf('day').plus({ hours: 4 }).unix_timestamp;

	const { mutate: realtimeListMutate } = useSWR<Alert[]>(API_ROUTES.alerts.REALTIME_LIST);

	const { filteredIds: filteredAgencyIds } = useDataAgencies(PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.read_realtime);

	const { isLoading: ridesLoading, raw: ridesData } = useDataRides({
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

	const { action: handleCreate, isLoading: isCreating } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.REALTIME_LIST, 'POST', form.getValues()),
		onSuccess: (updatedItem) => {
			realtimeListMutate();
			if (updatedItem?._id) router.push(keepUrlParams(PAGE_ROUTES.alerts.REALTIME_DETAIL(updatedItem._id)));
		},
	});

	const selectVisibleRides = () => {
		// const existingReferences = form.getValues().references ?? [];
		// const newReferences = rideIds
		// 	.filter(rideId => !existingReferences.some(reference => reference.parent_id === rideId))
		// 	.map(rideId => ({ child_ids: [], parent_id: rideId }));
		// form.setFieldValue('references', [...existingReferences, ...newReferences]);
	};

	const toggleRideSelection = (rideId: string) => {
		const existingReferences = form.getValues().references ?? [];
		if (existingReferences?.some(reference => reference.parent_id === rideId)) {
			form.setFieldValue('references', form.values.references.filter(reference => reference.parent_id !== rideId));
		}
		else {
			form.setFieldValue('references', [...existingReferences, { child_ids: [], parent_id: rideId }]);
		}
	};

	const removeAllRides = () => {
		form.setFieldValue('references', []);
	};

	useEffect(() => {
		const needsDetour = form.values.effect === 'DETOUR' && form.values.cause === 'CONSTRUCTION';
		if (!needsDetour && detour.length > 0) {
			setDetour('');
		}
	}, [form.values.effect, form.values.cause, detour.length]);

	//
	// E. Define State

	const contextValue: RealtimeCreateContextState = useMemo(() => {
		const needsDetour = form.values.effect === 'DETOUR' && form.values.cause === 'CONSTRUCTION';
		const hasValidDetour = !needsDetour || detour.trim().length > 0;

		return {
			actions: {
				create: handleCreate,
				removeAllRides,
				selectVisibleRides,
				setDetour,
				toggleRideSelection,
			},
			data: {
				detour,
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
				canSave: form.isValid() && hasValidDetour,
				isCreating,
				ridesLoading,
			},
		};
	}, [
		detour,
		filterStops,
		ridesData,
		form,
		isCreating,
		filterLines,
		filterSearch,
		filterViewMode,
		ridesLoading,
		multiStep,
		detour,
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
