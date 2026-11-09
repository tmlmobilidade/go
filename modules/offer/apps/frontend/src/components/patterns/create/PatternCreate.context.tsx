'use client';

import { useLinesDetailData } from '@/components/lines/detail/use-lines-detail-data';
import { useLinesListData } from '@/components/lines/list/use-lines-list-data';
import { closeCreatePatternModal } from '@/components/patterns/create/PatternCreate.modal';
import { useRoutesDetailData } from '@/components/routes/detail/use-routes-detail-data';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreatePatternDto, CreatePatternSchema, type Pattern } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef } from 'react';

/* * */

const PatternCreateContext = createContext<StandardFormContextValue<CreatePatternDto> | undefined>(undefined);

export function usePatternCreateContext() {
	const context = useContext(PatternCreateContext);
	if (!context) throw new Error('usePatternCreateContext must be used within a PatternCreateContextProvider');
	return context;
}

/* * */

export function PatternCreateContextProvider({ children, lineId, routeId }: PropsWithChildren<{ lineId: string, routeId: string }>) {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { data: me, error: meError, isLoading: meLoading } = useMeData();
	const accessRef = useRef(false);
	const { mutate: listMutate } = useLinesListData();
	const { data: line, error: lineError, isLoading: lineLoading, mutate: lineMutate } = useLinesDetailData(lineId);
	const { data: route, error: routeError, isLoading: routeLoading, mutate: routeMutate } = useRoutesDetailData(routeId);

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<CreatePatternDto, typeof CreatePatternSchema>({
		defaultValues: { code: '', destination: '', headsign: '', line_id: lineId, origin: '', route_id: routeId },
		schema: CreatePatternSchema,
	});

	//
	// C. Handle requests

	const { action: createRequest, isLoading: isCreating } = useHandleAction({
		fetchFn: async () => await fetchApiData<Pattern>({ body: CreatePatternSchema.parse(form.getValues()), method: 'POST', url: API_ROUTES.offer.PATTERNS_CREATE }),
		onSuccess: ({ data }) => {
			form.reset();
			unblock();
			listMutate();
			lineMutate();
			routeMutate();
			closeCreatePatternModal();
			if (data?._id) router.push(keepUrlParams(PAGE_ROUTES.offer.PATTERN_DETAIL(lineId, data._id, routeId)));
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
	const isReady = !meLoading && !meError && !lineLoading && !lineError && !!line && !line.is_locked && !routeLoading && !routeError && !!route && route.line_id === lineId && !route.is_locked;
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

	const stateValue: StandardFormContextValue<CreatePatternDto> = useMemo(() => ({
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
		<PatternCreateContext.Provider value={stateValue}>
			{children}
		</PatternCreateContext.Provider>
	);
}
