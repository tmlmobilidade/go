'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Agency, type UpdateAgencyDto, UpdateAgencySchema } from '@tmlmobilidade/go-types-core';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { type StandardFormContextValue, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { fetchApiData, keepUrlParams, useHandleUpdate } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
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

	const router = useRouter();

	const { agencyId } = useAgenciesDetailAgencyId();

	const { data: meData } = useMeData();

	const { mutate: agenciesListMutate } = useAgenciesListData();

	const { data: agencyData, isLoading: agencyDataLoading, mutate: agenciesDetailMutate } = useAgenciesDetailData();

	//
	// B. Setup form

	const { form, unblock } = useStandardForm<UpdateAgencyDto, typeof UpdateAgencySchema>({
		apiData: agencyData,
		schema: UpdateAgencySchema,
	});

	//
	// D. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Agency>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.core.ROLES_UPDATE(agencyId) }),
		onSuccess: ({ data }) => {
			form.reset(data);
			agenciesDetailMutate();
			agenciesListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Agency>({ method: 'DELETE', url: API_ROUTES.core.ROLES_DELETE(agencyId) }),
		onSuccess: () => {
			agenciesListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.core.ROLES_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Agency>({ method: 'PUT', url: API_ROUTES.core.ROLES_DETAIL(agencyId) }),
		onSuccess: ({ data }) => {
			form.reset(data);
			agenciesDetailMutate();
			agenciesListMutate();
		},
	});

	//
	// C. Setup flags

	const hasDeletePermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: 'delete',
			scope: 'agencies',
		});
	}, [meData?.permissions]);

	const hasUpdatePermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: 'update',
			scope: 'agencies',
		});
	}, [meData?.permissions]);

	const { deleteEnabled, editEnabled, lockEnabled, updateEnabled } = useStandardFormCapabilities({
		delete: {
			hasPermission: hasDeletePermission,
			isDeleting: isDeleting,
		},
		form: {
			isDirty: form.formState.isDirty,
			isValid: form.formState.isValid,
		},
		loading: {
			isLoading: agencyDataLoading,
		},
		locked: {
			hasPermission: hasUpdatePermission,
			isLocked: agencyData?.is_locked ?? false,
			isLocking: isLocking,
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
			delete: handleDelete,
			lock: handleLock,
			update: handleUpdate,
		},
		capabilities: {
			deleteEnabled,
			editEnabled,
			lockEnabled,
			updateEnabled,
		},
		form,
		status: {
			isDeleting,
			isLoading: agencyDataLoading,
			isLocked: agencyData?.is_locked,
			isLocking,
			isUpdating,
		},
		unblock,
	}), [deleteEnabled, editEnabled, form, handleDelete, handleLock, handleUpdate, isDeleting, isLocking, isUpdating, lockEnabled, agencyData?.is_locked, agencyDataLoading, unblock, updateEnabled]);

	return (
		<AgenciesDetailFormContext.Provider value={stateValue}>
			{children}
		</AgenciesDetailFormContext.Provider>
	);
}
