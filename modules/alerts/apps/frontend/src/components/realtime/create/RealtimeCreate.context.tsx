'use client';

/* * */

import { RidesData } from '@/contexts/Rides.context';
import { Step, useMultiStepForm, UseMultiStepFormState } from '@/hooks/use-multistep-form';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, type CreateAlertDto, CreateAlertSchema } from '@tmlmobilidade/types';
import { keepUrlParams, type UseFormReturnType, useHandleUpdate, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

type RealtimeCreateContextState = UseMultiStepFormState & {
	actions: {
		addAllTrips: (trips: RidesData[]) => void
		create: () => Promise<void>
		removeAllRides: () => void
		setDetour: (detour: string) => void
		toggleTripReference: (trip: RidesData) => void
	}
	data: {
		detour: string
		form: UseFormReturnType<CreateAlertDto>
		selectedRides: RidesData[]
		steps: Step[]
	}
	flags: {
		canSave: boolean
		isCreating: boolean
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

const STEPS: Step[] = [
	{
		component: null,
		id: 'cause',
	},
	{
		component: null,
		id: 'effect',
	},
	{
		component: null,
		id: 'trip',
	},
	{
		component: null,
		id: 'summary',
	},
];

/* * */

export const RealtimeCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const multiStepForm = useMultiStepForm({ steps: STEPS });

	const [detour, setDetour] = useState<string>('');
	const [selectedRides, setSelectedRides] = useState<RidesData[]>([]);

	//
	// B. Fetch data

	const { mutate: alertsListMutate } = useSWR<Alert[]>(API_ROUTES.alerts.REALTIME_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateAlertDto>(CreateAlertSchema);

	//
	// D. Handle actions

	const { action: handleCreate, isLoading: isCreating } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.REALTIME_LIST, 'POST', form.getValues()),
		onSuccess: (updatedItem) => {
			alertsListMutate();
			if (updatedItem?._id) router.push(keepUrlParams(PAGE_ROUTES.alerts.REALTIME_DETAIL(updatedItem._id)));
		},
	});

	const addAllTrips = (trips: RidesData[]) => {
		const newRides = trips.filter(trip => !selectedRides.some(ride => ride._id === trip._id));
		if (newRides.length > 0) {
			setSelectedRides(prevRides => [...prevRides, ...newRides]);
			form.setFieldValue('references', [
				...form.values.references,
				...newRides.map(trip => ({ child_ids: [], parent_id: trip._id })),
			]);
		}
	};

	const toggleTripReference = (trip: RidesData) => {
		if (form.values.references.some(reference => reference.parent_id === trip._id)) {
			form.setFieldValue('references', form.values.references.filter(reference => reference.parent_id !== trip._id));
			setSelectedRides(selectedRides.filter(ride => ride._id !== trip._id));
		}
		else {
			form.setFieldValue('references', [...form.values.references, { child_ids: [], parent_id: trip._id }]);
			setSelectedRides([...selectedRides, trip]);
		}
	};

	const removeAllRides = () => {
		setSelectedRides([]);
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
				addAllTrips,
				create: handleCreate,
				removeAllRides,
				setDetour,
				toggleTripReference,
				...multiStepForm.actions,
			},
			data: {
				detour,
				form,
				selectedRides,
				...multiStepForm.data,
				steps: STEPS,
			},
			flags: {
				canSave: form.isValid() && hasValidDetour,
				isCreating,
				...multiStepForm.flags,
			},
		};
	}, [
		form,
		isCreating,
		multiStepForm,
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
