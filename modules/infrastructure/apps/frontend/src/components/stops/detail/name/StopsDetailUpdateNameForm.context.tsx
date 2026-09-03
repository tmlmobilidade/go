'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type StopsUpdateNameRequest, StopsUpdateNameRequestSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { type StandardFormContextValue, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { fetchApiData, useHandleAction } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useStopsListData } from '../../list/use-stops-list-data';
import { useStopsDetailData } from '../use-stops-detail-data';
import { useStopsDetailStopId } from '../use-stops-detail-stop-id';
import { closeStopsDetailUpdateNameModal } from './StopsDetailUpdateName.modal';

/* * */

const StopsDetailUpdateNameFormContext = createContext<StandardFormContextValue<StopsUpdateNameRequest> | undefined>(undefined);

export function useStopsDetailUpdateNameFormContext() {
	const context = useContext(StopsDetailUpdateNameFormContext);
	if (!context) throw new Error('useStopsDetailUpdateNameFormContext must be used within a StopsDetailUpdateNameFormContextProvider');
	return context;
}

/* * */

export function StopsDetailUpdateNameFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { stopId } = useStopsDetailStopId();

	const { mutate: stopsListMutate } = useStopsListData();

	const { data: stopData, isLoading: stopDataLoading, mutate: stopsDetailMutate } = useStopsDetailData();

	//
	// B. Setup form

	const currentNameValue = useMemo<StopsUpdateNameRequest>(() => ({
		name: stopData?.name,
		short_name: stopData?.short_name,
		tts_name: stopData?.tts_name,
	}), [stopData?.name, stopData?.short_name, stopData?.tts_name]);

	const { form, isDirty, isValid, unblock } = useStandardForm<StopsUpdateNameRequest, typeof StopsUpdateNameRequestSchema>({
		apiData: currentNameValue,
		schema: StopsUpdateNameRequestSchema,
	});

	//
	// C. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleAction({
		fetchFn: async () => await fetchApiData<Stop>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.infrastructure.STOPS_UPDATE_NAME(stopId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			stopsDetailMutate(response);
			stopsListMutate();
			unblock();
			closeStopsDetailUpdateNameModal();
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

	const stateValue: StandardFormContextValue<StopsUpdateNameRequest> = useMemo(() => ({
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
		<StopsDetailUpdateNameFormContext.Provider value={stateValue}>
			{children}
		</StopsDetailUpdateNameFormContext.Provider>
	);
}
