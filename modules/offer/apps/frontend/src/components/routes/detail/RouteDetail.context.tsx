'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type PopulatedLine, type RoutesDetail } from '@tmlmobilidade/go-offer-pckg-types';
import { type UpdateRouteDto, UpdateRouteSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { DetailContextStateTemplate, fetchApiData, keepUrlParams, useDetailState, type UseFormReturnType, useHandleAction, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface RouteDetailContextState {
	actions: DetailContextStateTemplate['actions']
	data: {
		form: UseFormReturnType<UpdateRouteDto>
		id: string
		line: null | PopulatedLine
		route: null | RoutesDetail
	}
	flags: DetailContextStateTemplate['flags'] & {
		isLockedByLine: boolean
	}
}

/* * */

const RouteDetailContext = createContext<RouteDetailContextState | undefined>(undefined);

export function useRouteDetailContext() {
	const context = useContext(RouteDetailContext);
	if (!context) {
		throw new Error('useRouteDetailContext must be used within a RouteDetailContextProvider');
	}
	return context;
}

/* * */

export const RouteDetailContextProvider = ({ children, lineId, routeId }: PropsWithChildren<{ lineId: string, routeId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	//
	// B. Fetch data

	const { data: routeData, error: routeError, isLoading: routeLoading, mutate: routeMutate } = useSWR<ApiResponse<RoutesDetail>>(API_ROUTES.offer.ROUTES_DETAIL(routeId), {
		fetcher: async url => await fetchApiData<RoutesDetail>({ url }),
	});

	const { data: lineData, error: lineError, isLoading: lineLoading, mutate: lineMutate } = useSWR<ApiResponse<PopulatedLine>>(API_ROUTES.offer.LINES_DETAIL(lineId), {
		fetcher: async url => await fetchApiData<PopulatedLine>({ url }),
		refreshInterval: 10_000,
	});

	//
	// C. Setup form

	const { form } = useTypicalForm<UpdateRouteDto>(UpdateRouteSchema, routeData?.data);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleAction({
		fetchFn: async () => await fetchApiData<RoutesDetail>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.offer.ROUTES_DETAIL(routeId) }),
		onSuccess: (data) => {
			form.resetDirty();
			routeMutate(data);
			lineMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleAction({
		fetchFn: async () => await fetchApiData<RoutesDetail>({ body: routeData, method: 'DELETE', url: API_ROUTES.offer.ROUTES_DETAIL(routeId) }),
		onSuccess: () => {
			form.resetDirty();
			lineMutate();
			router.push(keepUrlParams(PAGE_ROUTES.offer.LINES_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleAction({
		fetchFn: async () => await fetchApiData<RoutesDetail>({ url: API_ROUTES.offer.ROUTES_DETAIL_LOCK(routeId) }),
		onSuccess: (data) => {
			form.resetDirty();
			routeMutate(data);
			lineMutate();
		},
	});

	//
	// E. Setup permissions

	const permissions = meContext.actions.getScopePermissions({
		actions: PermissionCatalog.all.lines.actions,
		resource: {
			key: 'agency_ids',
			requireAll: false,
			value: lineData?.data?.agency_id ? [lineData.data.agency_id] : [],
		},
		scope: PermissionCatalog.all.lines.scope,
	});

	const { canDelete, canLock, canSave, isReadOnly } = useDetailState({
		hasError: !!routeError || !!lineError,
		isDeleted: null,
		isDeleting,
		isDirty: form.isDirty(),
		isLoading: routeLoading || lineLoading || !lineData?.data,
		isLocked: routeData?.data?.is_locked || lineData?.data?.is_locked,
		isLocking,
		isSaving: isSaving,
		isValid: form.isValid(),
		permissions: {
			delete: permissions.delete,
			lock: permissions.lock && !lineData?.data?.is_locked,
			read: permissions.read,
			update: permissions.update,
		},
	});

	//
	// F. Define context value

	const contextValue: RouteDetailContextState = useMemo(() => ({
		actions: {
			delete: handleDelete,
			lock: handleLock,
			save: handleSave,
		},
		data: {
			form,
			id: routeId,
			line: lineData?.data,
			route: routeData?.data,
		},
		flags: {
			canDelete,
			canLock,
			canSave,
			error: routeError,
			isDeleting,
			isLoading: routeLoading || lineLoading || !lineData?.data,
			isLockedByLine: !!lineData?.data?.is_locked,
			isLocking,
			isReadOnly,
			isSaving: isSaving,
		},
	}), [routeData, routeError, routeLoading, routeId, form, isSaving, lineData?.data, canDelete, canLock, canSave, isDeleting, isLocking, isReadOnly, handleDelete, handleLock, handleSave, lineLoading]);

	//
	// G. Render components

	return (
		<RouteDetailContext.Provider value={contextValue}>
			{children}
		</RouteDetailContext.Provider>
	);

	//
};
