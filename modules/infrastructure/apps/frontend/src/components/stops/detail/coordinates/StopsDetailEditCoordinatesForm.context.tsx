'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { fetchApiData, useHandleUpdate } from '@tmlmobilidade/ui';
import { createContext, Dispatch, type PropsWithChildren, SetStateAction, useContext, useMemo, useState } from 'react';

import { useStopsListData } from '../../list/use-stops-list-data';
import { useStopsDetailData } from '../use-stops-detail-data';
import { useStopsDetailStopId } from '../use-stops-detail-stop-id';
import { closeStopsDetailEditCoordinatesModal } from './StopsDetailEditCoordinates.modal';

/* * */

interface StopsDetailEditCoordinatesFormContextValue {
	actions: {
		updateCoordinates: () => void
	}
	form: {
		latitudeValue: number
		longitudeValue: number
		setLatitudeValue: Dispatch<SetStateAction<number>>
		setLongitudeValue: Dispatch<SetStateAction<number>>
	}
	status: {
		isLoading: boolean
	}
}

/* * */

const StopsDetailEditCoordinatesFormContext = createContext<StopsDetailEditCoordinatesFormContextValue | undefined>(undefined);

export function useStopsDetailEditCoordinatesFormContext() {
	const context = useContext(StopsDetailEditCoordinatesFormContext);
	if (!context) throw new Error('useStopsDetailEditCoordinatesFormContext must be used within a StopsDetailEditCoordinatesFormContextProvider');
	return context;
}

/* * */

export function StopsDetailEditCoordinatesFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { stopId } = useStopsDetailStopId();

	const { mutate: stopsListMutate } = useStopsListData();

	const { data: stopData, mutate: stopsDetailMutate } = useStopsDetailData();

	//
	// B. Setup form

	const [latitudeValue, setLatitudeValue] = useState<number>(stopData?.latitude ?? 0);
	const [longitudeValue, setLongitudeValue] = useState<number>(stopData?.longitude ?? 0);

	//
	// C. Handle actions

	const { action: handleUpdateCoordinates, isLoading: isUpdatingCoordinates } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Stop>({ body: { latitude: latitudeValue, longitude: longitudeValue }, method: 'PUT', url: API_ROUTES.infrastructure.STOPS_UPDATE_COORDINATES(stopId) }),
		onSuccess: (response) => {
			stopsListMutate();
			stopsDetailMutate(response);
			closeStopsDetailEditCoordinatesModal();
		},
	});

	//
	// E. Return state

	const stateValue: StopsDetailEditCoordinatesFormContextValue = useMemo(() => ({
		actions: {
			updateCoordinates: handleUpdateCoordinates,
		},
		form: {
			latitudeValue,
			longitudeValue,
			setLatitudeValue,
			setLongitudeValue,
		},
		status: {
			isLoading: isUpdatingName,
		},
	}), [handleUpdateName, isUpdatingName, nameValue]);

	return (
		<StopsDetailEditCoordinatesFormContext.Provider value={stateValue}>
			{children}
		</StopsDetailEditCoordinatesFormContext.Provider>
	);
}
