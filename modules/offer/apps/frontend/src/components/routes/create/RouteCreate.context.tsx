'use client';

import { useLinesDetailData } from '@/components/lines/detail/use-lines-detail-data';
import { useLinesListData } from '@/components/lines/list/use-lines-list-data';
import { closeCreateRouteModal } from '@/components/routes/create/RouteCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateRouteDto, CreateRouteSchema, type Route } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef } from 'react';

/* * */

const RouteCreateContext = createContext<StandardFormContextValue<CreateRouteDto> | undefined>(undefined);

export function useRouteCreateContext() {
	const context = useContext(RouteCreateContext);
	if (!context) throw new Error('useRouteCreateContext must be used within a RouteCreateContextProvider');
	return context;
}

/* * */

export function RouteCreateContextProvider({ children, lineId }: PropsWithChildren<{ lineId: string }>) {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { data: me, error: meError, isLoading: meLoading } = useMeData();
	const accessRef = useRef(false);
	const { mutate: listMutate } = useLinesListData();
	const { data: line, error: lineError, isLoading: lineLoading, mutate: lineMutate } = useLinesDetailData(lineId);

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<CreateRouteDto, typeof CreateRouteSchema>({
		defaultValues: { code: '', line_id: lineId, name: '' },
		schema: CreateRouteSchema,
	});

	//
	// C. Handle requests

	const { action: createRequest, isLoading: isCreating } = useHandleAction({
		fetchFn: async () => await fetchApiData<Route>({ body: CreateRouteSchema.parse(form.getValues()), method: 'POST', url: API_ROUTES.offer.ROUTES_CREATE }),
		onSuccess: ({ data }) => {
			form.reset();
			unblock();
			listMutate();
			lineMutate();
			closeCreateRouteModal();
			if (data?._id) router.push(keepUrlParams(PAGE_ROUTES.offer.ROUTE_DETAIL(lineId, data._id)));
		},
	});

	//
	// D. Setup capabilities

	const agencyIds = line?.agency_id ? [line.agency_id] : [];
	const hasCreatePermission = agencyIds.length > 0 && PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.lines.actions.create,
		permissions: me?.permissions ?? [],
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.lines.scope,
		value: agencyIds,
	});
	const isReady = !meLoading && !meError && !lineLoading && !lineError && !!line && !line.is_locked;
	const standardCapabilities = useStandardFormCapabilities({
		create: { hasPermission: hasCreatePermission, isCreating },
		form: { isDirty, isValid },
		loading: { isLoading: !isReady },
	});
	const createEnabled = standardCapabilities.createEnabled;
	const editEnabled = standardCapabilities.editEnabled && hasCreatePermission;
	accessRef.current = createEnabled;

	const handleCreate = useCallback(async () => {
		if (!accessRef.current) return;
		await form.handleSubmit(async () => {
			if (accessRef.current) await createRequest();
		})();
	}, [createRequest, form]);

	useEffect(() => {
		accessRef.current = createEnabled;
		return () => {
			accessRef.current = false;
		};
	}, [createEnabled]);

	//
	// E. Return context value

	const stateValue: StandardFormContextValue<CreateRouteDto> = useMemo(() => ({
		actions: {
			create: handleCreate,
		},
		capabilities: {
			createEnabled,
			editEnabled,
		},
		form,
		isDirty,
		isValid,
		status: {
			isCreating,
		},
		unblock,
	}), [createEnabled, editEnabled, form, handleCreate, isCreating, isDirty, isValid, unblock]);

	return (
		<RouteCreateContext.Provider value={stateValue}>
			{children}
		</RouteCreateContext.Provider>
	);
}
