'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { fetchApiData, useHandleUpdate } from '@tmlmobilidade/ui';
import { createContext, Dispatch, type PropsWithChildren, SetStateAction, useContext, useMemo, useState } from 'react';

import { useStopsListData } from '../../list/use-stops-list-data';
import { useStopsDetailData } from '../use-stops-detail-data';
import { useStopsDetailStopId } from '../use-stops-detail-stop-id';
import { closeStopsDetailEditNameModal } from './StopsDetailEditName.modal';

/* * */

interface StopsDetailEditNameFormContextValue {
	actions: {
		updateName: () => void
	}
	form: {
		nameValue: string
		setNameValue: Dispatch<SetStateAction<string>>
	}
	status: {
		isLoading: boolean
	}
}

/* * */

const StopsDetailEditNameFormContext = createContext<StopsDetailEditNameFormContextValue | undefined>(undefined);

export function useStopsDetailEditNameFormContext() {
	const context = useContext(StopsDetailEditNameFormContext);
	if (!context) throw new Error('useStopsDetailEditNameFormContext must be used within a StopsDetailEditNameFormContextProvider');
	return context;
}

/* * */

export function StopsDetailEditNameFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { stopId } = useStopsDetailStopId();

	const { mutate: stopsListMutate } = useStopsListData();

	const { data: stopData, mutate: stopsDetailMutate } = useStopsDetailData();

	//
	// B. Setup form

	const [nameValue, setNameValue] = useState<string>(stopData?.name);

	//
	// C. Handle actions

	const { action: handleUpdateName, isLoading: isUpdatingName } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Stop>({ body: { name: nameValue }, method: 'PUT', url: API_ROUTES.infrastructure.STOPS_UPDATE_NAME(stopId) }),
		onSuccess: (response) => {
			stopsListMutate();
			stopsDetailMutate(response);
			closeStopsDetailEditNameModal();
		},
	});

	//
	// E. Return state

	const stateValue: StopsDetailEditNameFormContextValue = useMemo(() => ({
		actions: {
			updateName: handleUpdateName,
		},
		form: {
			nameValue,
			setNameValue,
		},
		status: {
			isLoading: isUpdatingName,
		},
	}), [handleUpdateName, isUpdatingName, nameValue]);

	return (
		<StopsDetailEditNameFormContext.Provider value={stateValue}>
			{children}
		</StopsDetailEditNameFormContext.Provider>
	);
}
