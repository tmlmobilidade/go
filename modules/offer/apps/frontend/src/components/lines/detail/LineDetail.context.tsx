'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Line, PermissionCatalog, type UpdateLineDto, UpdateLineSchema } from '@tmlmobilidade/types';
import { DetailContextStateTemplate, keepUrlParams, useDetailState, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext } from 'react';
import useSWR from 'swr';

/* * */

interface LineDetailContextState {
	actions: DetailContextStateTemplate['actions']
	data: {
		form: UseFormReturnType<UpdateLineDto>
		id: string
		line: Line | null
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

	const { mutate: linesListMutate } = useSWR<Line[]>(API_ROUTES.offer.LINES_LIST);
	const { data: lineData, error: lineError, isLoading: lineLoading, mutate: lineMutate } = useSWR<Line>(API_ROUTES.offer.LINES_DETAIL(lineId));

	//
	// C. Setup form

	const { formRef } = useTypicalForm<UpdateLineDto>(UpdateLineSchema, lineData);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Line>(API_ROUTES.offer.LINES_DETAIL(lineId), 'PUT', formRef.current.getValues()),
		onSuccess: (updatedItem) => {
			formRef.current.resetDirty();
			lineMutate(updatedItem);
			linesListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Line>(API_ROUTES.offer.LINES_DETAIL(lineId), 'DELETE', lineData),
		onSuccess: () => {
			formRef.current.resetDirty();
			linesListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.offer.LINES_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Line>(API_ROUTES.offer.LINES_DETAIL_LOCK(lineId)),
		onSuccess: (updatedItem) => {
			formRef.current.resetDirty();
			lineMutate(updatedItem);
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
			value: lineData?.agency_id ? [lineData.agency_id] : [],
		},
		scope: PermissionCatalog.all.lines.scope,
	});

	const { canDelete, canLock, canSave, isReadOnly } = useDetailState({
		hasError: !!lineError,
		isDeleted: null,
		isDeleting,
		isDirty: formRef.current.isDirty(),
		isLoading: lineLoading,
		isLocked: lineData?.is_locked,
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

	const contextValue: LineDetailContextState = {
		actions: {
			delete: handleDelete,
			lock: handleLock,
			save: handleSave,
		},
		data: {
			form: formRef.current,
			id: lineId,
			line: lineData,
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
	};

	//
	// G. Render components

	return (
		<LineDetailContext.Provider value={contextValue}>
			{children}
		</LineDetailContext.Provider>
	);

	//
};
