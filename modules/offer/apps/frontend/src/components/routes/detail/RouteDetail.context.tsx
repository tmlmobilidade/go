'use client';

import { useLinesDetailData } from '@/components/lines/detail/use-lines-detail-data';
import { useLinesListData } from '@/components/lines/list/use-lines-list-data';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type PopulatedLine, type RoutesDetail } from '@tmlmobilidade/go-offer-pckg-types';
import { type UpdateRouteDto, UpdateRouteSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef } from 'react';

import { useRoutesDetailData } from './use-routes-detail-data';

/* * */

interface RouteDetailContextState extends StandardFormContextValue<UpdateRouteDto> {
	data: {
		id: string
		line: PopulatedLine | undefined
		route: RoutesDetail | undefined
	}
	error: null | string
	isLockedByLine: boolean
}

/* * */

const RouteDetailContext = createContext<RouteDetailContextState | undefined>(undefined);

export function useRouteDetailContext() {
	const context = useContext(RouteDetailContext);
	if (!context) throw new Error('useRouteDetailContext must be used within a RouteDetailContextProvider');
	return context;
}

/* * */

export function RouteDetailContextProvider({ children, lineId, routeId }: PropsWithChildren<{ lineId: string, routeId: string }>) {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { data: me, error: meError, isLoading: meLoading } = useMeData();
	const { mutate: listMutate } = useLinesListData();
	const { data: route, error, isLoading: dataLoading, mutate } = useRoutesDetailData(routeId);
	const { data: line, error: lineError, isLoading: lineLoading, mutate: lineMutate } = useLinesDetailData(lineId);
	const accessRef = useRef({ deleteEnabled: false, editEnabled: false, lockEnabled: false, updateEnabled: false });

	//
	// B. Setup form

	const apiData = useMemo(() => route ? { code: route.code, name: route.name, path_type: route.path_type } : undefined, [route]);
	const { form, isDirty, isValid, unblock } = useStandardForm<UpdateRouteDto, typeof UpdateRouteSchema>({
		apiData,
		schema: UpdateRouteSchema,
	});

	//
	// C. Handle requests

	const { action: updateRequest, isLoading: isUpdating } = useHandleAction({
		fetchFn: async () => await fetchApiData<RoutesDetail>({ body: UpdateRouteSchema.parse(form.getValues()), method: 'PUT', url: API_ROUTES.offer.ROUTES_DETAIL(routeId) }),
		onSuccess: (response) => {
			form.reset(UpdateRouteSchema.parse(response.data));
			mutate(response);
			listMutate();
			lineMutate();
		},
	});

	const { action: deleteRequest, isLoading: isDeleting } = useHandleAction({
		fetchFn: async () => await fetchApiData<undefined>({ method: 'DELETE', url: API_ROUTES.offer.ROUTES_DETAIL(routeId) }),
		onSuccess: () => {
			form.reset();
			unblock();
			listMutate();
			lineMutate();
			router.push(keepUrlParams(PAGE_ROUTES.offer.LINES_LIST));
		},
	});

	const { action: lockRequest, isLoading: isLocking } = useHandleAction({
		fetchFn: async () => await fetchApiData<RoutesDetail>({ url: API_ROUTES.offer.ROUTES_DETAIL_LOCK(routeId) }),
		onSuccess: (response) => {
			mutate(response);
			listMutate();
			lineMutate();
		},
	});

	//
	// D. Setup capabilities

	const permissions = PermissionCatalog.getScopePermissions({
		actions: PermissionCatalog.all.lines.actions,
		permissions: me?.permissions ?? [],
		resource: { key: 'agency_ids', requireAll: true, value: line?.agency_id ? [line.agency_id] : [] },
		scope: PermissionCatalog.all.lines.scope,
	});
	const hasData = !!line && !!route && route.line_id === lineId;
	const isLockedByLine = !!line?.is_locked;
	const isLoading = dataLoading || meLoading || lineLoading;
	const hasError = !!(error || meError || lineError);
	const standardCapabilities = useStandardFormCapabilities({
		delete: { hasPermission: permissions.delete, isDeleting },
		form: { isDirty, isValid },
		loading: { isLoading: isLoading || hasError || !hasData || isUpdating || isDeleting || isLocking },
		locked: { hasPermission: permissions.lock && !isLockedByLine, isLocked: !!route?.is_locked || isLockedByLine, isLocking },
		update: { hasPermission: permissions.update && permissions.read, isUpdating },
	});
	const capabilities = useMemo(() => ({
		...standardCapabilities,
		editEnabled: standardCapabilities.editEnabled && permissions.update && permissions.read,
	}), [standardCapabilities, permissions.update, permissions.read]);
	accessRef.current = capabilities;

	//
	// E. Guard actions against current access

	const handleUpdate = useCallback(async () => {
		if (!accessRef.current.updateEnabled) return;
		await form.handleSubmit(async () => {
			if (accessRef.current.updateEnabled) await updateRequest();
		})();
	}, [form, updateRequest]);

	const handleDelete = useCallback(async () => {
		if (accessRef.current.deleteEnabled) await deleteRequest();
	}, [deleteRequest]);

	const handleLock = useCallback(async () => {
		if (accessRef.current.lockEnabled) await lockRequest();
	}, [lockRequest]);

	useEffect(() => {
		accessRef.current = capabilities;
		return () => {
			accessRef.current = { deleteEnabled: false, editEnabled: false, lockEnabled: false, updateEnabled: false };
		};
	}, [capabilities]);

	//
	// F. Return context value

	const stateValue: RouteDetailContextState = useMemo(() => ({
		actions: {
			delete: handleDelete,
			lock: handleLock,
			update: handleUpdate,
		},
		capabilities,
		data: {
			id: routeId,
			line,
			route,
		},
		error: error || meError || lineError,
		form,
		isDirty,
		isLockedByLine,
		isValid,
		status: {
			isDeleting,
			isLoading,
			isLocked: !!route?.is_locked || isLockedByLine,
			isLocking,
			isUpdating,
		},
		unblock,
	}), [capabilities, handleDelete, handleLock, handleUpdate, line, route, routeId, lineError, error, meError, form, isDirty, isLockedByLine, isValid, isDeleting, isLoading, isLocking, isUpdating, unblock]);

	return (
		<RouteDetailContext.Provider value={stateValue}>
			{children}
		</RouteDetailContext.Provider>
	);
}
