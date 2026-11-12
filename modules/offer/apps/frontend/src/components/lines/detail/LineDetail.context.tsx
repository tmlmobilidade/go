'use client';

import { useLinesListData } from '@/components/lines/list/use-lines-list-data';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type PopulatedLine } from '@tmlmobilidade/go-offer-pckg-types';
import { type UpdateLineDto, UpdateLineSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef } from 'react';

import { useLinesDetailData } from './use-lines-detail-data';

/* * */

interface LineDetailContextState extends StandardFormContextValue<UpdateLineDto> {
	actions: StandardFormContextValue<UpdateLineDto>['actions'] & {
		applyChanges: (changes: Partial<UpdateLineDto>) => void
	}
	data: {
		id: string
		line: PopulatedLine | undefined
	}
	error: null | string
}

/* * */

const LineDetailContext = createContext<LineDetailContextState | undefined>(undefined);

export function useLineDetailContext() {
	const context = useContext(LineDetailContext);
	if (!context) throw new Error('useLineDetailContext must be used within a LineDetailContextProvider');
	return context;
}

/* * */

export function LineDetailContextProvider({ children, lineId }: PropsWithChildren<{ lineId: string }>) {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { data: me, error: meError, isLoading: meLoading } = useMeData();
	const { mutate: listMutate } = useLinesListData();
	const { data: line, error, isLoading: dataLoading, mutate } = useLinesDetailData(lineId);
	const accessRef = useRef({ deleteEnabled: false, editEnabled: false, lockEnabled: false, updateEnabled: false });

	//
	// B. Setup form

	const apiData = useMemo(() => line ? UpdateLineSchema.parse(line) : undefined, [line]);
	const { form, isDirty, isValid, unblock } = useStandardForm<UpdateLineDto, typeof UpdateLineSchema>({
		apiData,
		schema: UpdateLineSchema,
	});
	const values = useStandardFormWatch({ control: form.control });

	//
	// C. Handle requests

	const { action: updateRequest, isLoading: isUpdating } = useHandleAction({
		fetchFn: async () => await fetchApiData<PopulatedLine>({ body: UpdateLineSchema.parse(form.getValues()), method: 'PUT', url: API_ROUTES.offer.LINES_DETAIL(lineId) }),
		onSuccess: (response) => {
			form.reset(UpdateLineSchema.parse(response.data));
			mutate(response);
			listMutate();
		},
	});

	const { action: deleteRequest, isLoading: isDeleting } = useHandleAction({
		fetchFn: async () => await fetchApiData<undefined>({ method: 'DELETE', url: API_ROUTES.offer.LINES_DETAIL(lineId) }),
		onSuccess: () => {
			form.reset();
			unblock();
			listMutate();
			router.push(keepUrlParams(PAGE_ROUTES.offer.LINES_LIST));
		},
	});

	const { action: lockRequest, isLoading: isLocking } = useHandleAction({
		fetchFn: async () => await fetchApiData<PopulatedLine>({ url: API_ROUTES.offer.LINES_DETAIL_LOCK(lineId) }),
		onSuccess: (response) => {
			mutate(response);
			listMutate();
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
	const hasData = !!line;
	const isLoading = dataLoading || meLoading;
	const hasError = !!(error || meError);
	const canUpdateAgency = !!values.agency_id && PermissionCatalog.hasPermissionResourceAll({ action: PermissionCatalog.all.lines.actions.update, permissions: me?.permissions ?? [], resource_key: 'agency_ids', scope: PermissionCatalog.all.lines.scope, value: [values.agency_id] });
	const standardCapabilities = useStandardFormCapabilities({
		delete: { hasPermission: permissions.delete, isDeleting },
		form: { isDirty, isValid },
		loading: { isLoading: isLoading || hasError || !hasData || isUpdating || isDeleting || isLocking },
		locked: { hasPermission: permissions.lock, isLocked: !!line?.is_locked, isLocking },
		update: { hasPermission: permissions.update && permissions.read && canUpdateAgency, isUpdating },
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

	const applyChanges = useCallback((changes: Partial<UpdateLineDto>) => {
		if (!accessRef.current.editEnabled) return;
		form.reset({ ...form.getValues(), ...changes }, { keepDefaultValues: true });
	}, [form]);

	useEffect(() => {
		accessRef.current = capabilities;
		return () => {
			accessRef.current = { deleteEnabled: false, editEnabled: false, lockEnabled: false, updateEnabled: false };
		};
	}, [capabilities]);

	//
	// F. Return context value

	const stateValue: LineDetailContextState = useMemo(() => ({
		actions: {
			applyChanges,
			delete: handleDelete,
			lock: handleLock,
			update: handleUpdate,
		},
		capabilities,
		data: {
			id: lineId,
			line,
		},
		error: error || meError,
		form,
		isDirty,
		isValid,
		status: {
			isDeleting,
			isLoading,
			isLocked: !!line?.is_locked,
			isLocking,
			isUpdating,
		},
		unblock,
	}), [applyChanges, capabilities, handleDelete, handleLock, handleUpdate, line, lineId, error, meError, form, isDirty, isValid, isDeleting, isLoading, isLocking, isUpdating, unblock]);

	return (
		<LineDetailContext.Provider value={stateValue}>
			{children}
		</LineDetailContext.Provider>
	);
}
