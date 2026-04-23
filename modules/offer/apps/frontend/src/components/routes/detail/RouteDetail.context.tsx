'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Line, PermissionCatalog, Route, type UpdateRouteDto, UpdateRouteSchema } from '@tmlmobilidade/types';
import { DetailContextStateTemplate, keepUrlParams, useDetailState, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext } from 'react';
import useSWR from 'swr';

/* * */

interface RouteDetailContextState {
	actions: DetailContextStateTemplate['actions']
	data: {
		form: UseFormReturnType<UpdateRouteDto>
		id: string
		line: Line | null
		route: null | Route
	}
	flags: DetailContextStateTemplate['flags']
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

	const { data: routeData, error: routeError, isLoading: routeLoading, mutate: routeMutate } = useSWR<Route>(API_ROUTES.offer.ROUTES_DETAIL(routeId));
	const { data: lineData, mutate: lineMutate } = useSWR<Line>(API_ROUTES.offer.LINES_DETAIL(lineId));

	//
	// C. Setup form

	const { formRef } = useTypicalForm<UpdateRouteDto>(UpdateRouteSchema, routeData);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Route>(API_ROUTES.offer.ROUTES_DETAIL(routeId), 'PUT', formRef.current.getValues()),
		onSuccess: (updatedItem) => {
			formRef.current.resetDirty();
			routeMutate(updatedItem);
			lineMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Route>(API_ROUTES.offer.ROUTES_DETAIL(routeId), 'DELETE', routeData),
		onSuccess: () => {
			formRef.current.resetDirty();
			lineMutate();
			router.push(keepUrlParams(PAGE_ROUTES.offer.LINES_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Route>(API_ROUTES.offer.ROUTES_DETAIL_LOCK(routeId)),
		onSuccess: (updatedItem) => {
			formRef.current.resetDirty();
			routeMutate(updatedItem);
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
			value: lineData?.agency_id ? [lineData.agency_id] : [],
		},
		scope: PermissionCatalog.all.lines.scope,
	});

	const { canDelete, canLock, canSave, isReadOnly } = useDetailState({
		hasError: !!routeError,
		isDeleted: null,
		isDeleting,
		isDirty: formRef.current.isDirty(),
		isLoading: routeLoading,
		isLocked: routeData?.is_locked,
		isLocking,
		isSaving: isSaving,
		isValid: formRef.current.isValid(),
		permissions: {
			delete: permissions.delete,
			lock: permissions.lock,
			read: permissions.read,
			update: permissions.update,
		},
	});

	//
	// F. Define context value

	const contextValue: RouteDetailContextState = {
		actions: {
			delete: handleDelete,
			lock: handleLock,
			save: handleSave,
		},
		data: {
			form: formRef.current,
			id: routeId,
			line: lineData,
			route: routeData,
		},
		flags: {
			canDelete,
			canLock,
			canSave,
			error: routeError,
			isDeleting,
			isLoading: routeLoading,
			isLocking,
			isReadOnly,
			isSaving: isSaving,
		},
	};

	//
	// G. Render components

	return (
		<RouteDetailContext.Provider value={contextValue}>
			{children}
		</RouteDetailContext.Provider>
	);

	//
};
