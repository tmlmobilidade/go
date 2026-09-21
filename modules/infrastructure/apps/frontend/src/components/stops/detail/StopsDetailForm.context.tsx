'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Stop, type UpdateStopDto, UpdateStopSchema } from '@tmlmobilidade/go-types-infrastructure';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useStopsListData } from '../list/use-stops-list-data';
import { useStopsDetailData } from './use-stops-detail-data';
import { useStopsDetailStopId } from './use-stops-detail-stop-id';

/* * */

const StopsDetailFormContext = createContext<StandardFormContextValue<UpdateStopDto> | undefined>(undefined);

export function useStopsDetailFormContext() {
	const context = useContext(StopsDetailFormContext);
	if (!context) throw new Error('useStopsDetailFormContext must be used within a StopsDetailFormContextProvider');
	return context;
}

/* * */

export function StopsDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { stopId } = useStopsDetailStopId();

	const { data: meData } = useMeData();

	const { mutate: stopsListMutate } = useStopsListData();

	const { data: stopData, isLoading: stopDataLoading, mutate: stopsDetailMutate } = useStopsDetailData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<UpdateStopDto, typeof UpdateStopSchema>({
		apiData: stopData,
		schema: UpdateStopSchema,
	});

	//
	// C. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleAction({
		fetchFn: async () => await fetchApiData<Stop>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.infrastructure.STOPS_UPDATE(stopId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			stopsDetailMutate(response);
			stopsListMutate();
		},
	});

	//
	// D. Setup flags

	const hasUpdatePermission = useMemo(() => {
		return PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.stops.actions.update,
			permissions: meData?.permissions,
			resource_key: 'municipality_ids',
			scope: PermissionCatalog.all.stops.scope,
			value: stopData?.municipality_id,
		});
	}, [meData?.permissions, stopData?.municipality_id]);

	const { editEnabled, updateEnabled } = useStandardFormCapabilities({
		form: {
			isDirty,
			isValid,
		},
		loading: {
			isLoading: stopDataLoading,
		},
		update: {
			hasPermission: hasUpdatePermission,
			isUpdating: isUpdating,
		},
	});

	//
	// E. Return state

	const stateValue: StandardFormContextValue<UpdateStopDto> = useMemo(() => ({
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
		<StopsDetailFormContext.Provider value={stateValue}>
			{children}
		</StopsDetailFormContext.Provider>
	);
}
