'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Agency, type UpdateAgencyDto, UpdateAgencySchema } from '@tmlmobilidade/go-types-core';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { type StandardFormContextValue, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { fetchApiData, useHandleAction } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useAgenciesListData } from '../list/use-agencies-list-data';
import { useAgenciesDetailAgencyId } from './use-agencies-detail-agency-id';
import { useAgenciesDetailData } from './use-agencies-detail-data';

/* * */

const AgenciesDetailFormContext = createContext<StandardFormContextValue<UpdateAgencyDto> | undefined>(undefined);

export function useAgenciesDetailFormContext() {
	const context = useContext(AgenciesDetailFormContext);
	if (!context) throw new Error('useAgenciesDetailFormContext must be used within a AgenciesDetailFormContextProvider');
	return context;
}

/* * */

export function AgenciesDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { agencyId } = useAgenciesDetailAgencyId();

	const { data: meData } = useMeData();

	const { mutate: agenciesListMutate } = useAgenciesListData();

	const { data: agencyData, isLoading: agencyDataLoading, mutate: agenciesDetailMutate } = useAgenciesDetailData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<UpdateAgencyDto, typeof UpdateAgencySchema>({
		apiData: agencyData,
		schema: UpdateAgencySchema,
	});

	//
	// C. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleAction({
		fetchFn: async () => await fetchApiData<Agency>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.core.AGENCIES_DETAIL(agencyId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			agenciesDetailMutate(response);
			agenciesListMutate();
		},
	});

	//
	// D. Setup flags

	const hasUpdatePermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: 'update',
			scope: 'agencies',
		});
	}, [meData?.permissions]);

	const { editEnabled, updateEnabled } = useStandardFormCapabilities({
		form: {
			isDirty,
			isValid,
		},
		loading: {
			isLoading: agencyDataLoading,
		},
		update: {
			hasPermission: hasUpdatePermission,
			isUpdating: isUpdating,
		},
	});

	//
	// E. Return state

	const stateValue: StandardFormContextValue<UpdateAgencyDto> = useMemo(() => ({
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
			isLoading: agencyDataLoading,
			isUpdating,
		},
		unblock,
	}), [editEnabled, form, handleUpdate, isUpdating, agencyDataLoading, unblock, updateEnabled, isDirty, isValid]);

	return (
		<AgenciesDetailFormContext.Provider value={stateValue}>
			{children}
		</AgenciesDetailFormContext.Provider>
	);
}
