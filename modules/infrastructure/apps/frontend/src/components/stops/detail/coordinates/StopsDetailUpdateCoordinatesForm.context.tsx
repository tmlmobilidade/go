'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type StopsUpdateCoordinatesRequest, StopsUpdateCoordinatesRequestSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { type StandardFormContextValue, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { fetchApiData, useHandleUpdate } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useStopsListData } from '../../list/use-stops-list-data';
import { useStopsDetailData } from '../use-stops-detail-data';
import { useStopsDetailStopId } from '../use-stops-detail-stop-id';
import { closeStopsDetailUpdateCoordinatesModal } from './StopsDetailUpdateCoordinates.modal';

/* * */

const StopsDetailUpdateCoordinatesFormContext = createContext<StandardFormContextValue<StopsUpdateCoordinatesRequest> | undefined>(undefined);

export function useStopsDetailUpdateCoordinatesFormContext() {
	const context = useContext(StopsDetailUpdateCoordinatesFormContext);
	if (!context) throw new Error('useStopsDetailUpdateCoordinatesFormContext must be used within a StopsDetailUpdateCoordinatesFormContextProvider');
	return context;
}

/* * */

export function StopsDetailUpdateCoordinatesFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { stopId } = useStopsDetailStopId();

	const { mutate: stopsListMutate } = useStopsListData();

	const { data: stopData, isLoading: stopDataLoading, mutate: stopsDetailMutate } = useStopsDetailData();

	//
	// B. Setup form

	const currentCoordinatesValue = useMemo<StopsUpdateCoordinatesRequest>(() => ({
		latitude: stopData?.latitude,
		longitude: stopData?.longitude,
	}), [stopData?.latitude, stopData?.longitude]);

	const { form, isDirty, isValid, unblock } = useStandardForm<StopsUpdateCoordinatesRequest, typeof StopsUpdateCoordinatesRequestSchema>({
		apiData: currentCoordinatesValue,
		schema: StopsUpdateCoordinatesRequestSchema,
	});

	//
	// C. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Stop>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.infrastructure.STOPS_UPDATE_COORDINATES(stopId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			stopsDetailMutate(response);
			stopsListMutate();
			unblock();
			closeStopsDetailUpdateCoordinatesModal();
		},
	});

	//
	// D. Setup flags

	const { editEnabled, updateEnabled } = useStandardFormCapabilities({
		form: {
			isDirty,
			isValid,
		},
		loading: {
			isLoading: stopDataLoading,
		},
		update: {
			isUpdating: isUpdating,
		},
	});

	//
	// E. Return state

	const stateValue: StandardFormContextValue<StopsUpdateCoordinatesRequest> = useMemo(() => ({
		actions: {
			update: handleUpdate,
		},
		capabilities: {
			editEnabled,
			updateEnabled,
		},
		form,
		isDirty,
		isValid,
		status: {
			isLoading: stopDataLoading,
			isUpdating,
		},
		unblock,
	}), [editEnabled, form, handleUpdate, isUpdating, stopDataLoading, unblock, updateEnabled, isDirty, isValid]);

	return (
		<StopsDetailUpdateCoordinatesFormContext.Provider value={stateValue}>
			{children}
		</StopsDetailUpdateCoordinatesFormContext.Provider>
	);
}
