'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type LineNormalized, type UpdateLineDto, UpdateLineSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { DetailContextStateTemplate, fetchApiData, keepUrlParams, useDetailState, type UseFormReturnType, useHandleAction, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface LineDetailContextState {
	actions: DetailContextStateTemplate['actions']
	data: {
		form: UseFormReturnType<UpdateLineDto>
		id: string
		line: LineNormalized | null
	}
	flags: DetailContextStateTemplate['flags']
}

/* * */

const LineDetailContext = createContext<LineDetailContextState | undefined>(undefined);

export function useLineDetailContext() {
	const context = useContext(LineDetailContext);
	if (!context) {
		throw new Error('useLineDetailContext must be used within a LineDetailContextProvider');
	}
	return context;
}

/* * */

export const LineDetailContextProvider = ({ children, lineId }: PropsWithChildren<{ lineId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	//
	// B. Fetch data

	const { mutate: linesListMutate } = useSWR<LineNormalized[]>(API_ROUTES.offer.LINES_LIST);
	const { data: lineData, error: lineError, isLoading: lineLoading, mutate: lineMutate } = useSWR<ApiResponse<LineNormalized>>(API_ROUTES.offer.LINES_DETAIL(lineId), {
		fetcher: async url => await fetchApiData<LineNormalized>({ url }),
	});

	//
	// C. Setup form

	const { form } = useTypicalForm<UpdateLineDto>(UpdateLineSchema, lineData?.data);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleAction({
		fetchFn: async () => await fetchApiData<LineNormalized>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.offer.LINES_DETAIL(lineId) }),
		onSuccess: (data) => {
			form.resetDirty();
			lineMutate(data);
			linesListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleAction({
		fetchFn: async () => await fetchApiData<undefined>({ body: lineData, method: 'DELETE', url: API_ROUTES.offer.LINES_DETAIL(lineId) }),
		onSuccess: () => {
			form.resetDirty();
			linesListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.offer.LINES_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleAction({
		fetchFn: async () => await fetchApiData<LineNormalized>({ url: API_ROUTES.offer.LINES_DETAIL_LOCK(lineId) }),
		onSuccess: (data) => {
			form.resetDirty();
			lineMutate(data);
			linesListMutate();
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
		hasError: !!lineError,
		isDeleted: null,
		isDeleting,
		isDirty: form.isDirty(),
		isLoading: lineLoading,
		isLocked: lineData?.data?.is_locked,
		isLocking,
		isSaving: isSaving,
		isValid: form.isValid(),
		permissions: {
			delete: permissions.delete,
			lock: permissions.lock,
			read: permissions.read,
			update: permissions.update,
		},
	});

	//
	// F. Define context value

	const contextValue: LineDetailContextState = useMemo(() => ({
		actions: {
			delete: handleDelete,
			lock: handleLock,
			save: handleSave,
		},
		data: {
			form,
			id: lineId,
			line: lineData?.data,
		},
		flags: {
			canDelete,
			canLock,
			canSave,
			error: lineError,
			isDeleting,
			isLoading: lineLoading,
			isLocking,
			isReadOnly,
			isSaving: isSaving,
		},
	}), [handleDelete, handleLock, handleSave, form, lineId, lineData, canDelete, canLock, canSave, lineError, isDeleting, lineLoading, isLocking, isReadOnly, isSaving]);

	//
	// G. Render components

	return (
		<LineDetailContext.Provider value={contextValue}>
			{children}
		</LineDetailContext.Provider>
	);

	//
};
