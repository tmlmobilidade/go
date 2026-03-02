'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Annotation, PermissionCatalog, type UpdateAnnotationDto, UpdateAnnotationSchema } from '@tmlmobilidade/types';
import { DetailContextStateTemplate, keepUrlParams, useDetailState, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface AnnotationsDetailContextState {
	actions: DetailContextStateTemplate['actions']
	data: {
		annotation: Annotation | null
		form: UseFormReturnType<UpdateAnnotationDto>
		id: string
	}
	flags: DetailContextStateTemplate['flags']
}

/* * */

const AnnotationsDetailContext = createContext<AnnotationsDetailContextState | undefined>(undefined);

export function useAnnotationsDetailContext() {
	const context = useContext(AnnotationsDetailContext);
	if (!context) {
		throw new Error('useAnnotationsDetailContext must be used within a AnnotationsDetailContextProvider');
	}
	return context;
}

/* * */

export const AnnotationsDetailContextProvider = ({ annotationId, children }: PropsWithChildren<{ annotationId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	//
	// B. Fetch data

	const { mutate: annotationsListMutate } = useSWR<Annotation[]>(API_ROUTES.dates.ANNOTATIONS_LIST);
	const { data: annotationData, error: annotationError, isLoading: annotationLoading, mutate: annotationMutate } = useSWR<Annotation>(API_ROUTES.dates.ANNOTATIONS_DETAIL(annotationId));

	//
	// C. Setup form

	const { form } = useTypicalForm<UpdateAnnotationDto>(UpdateAnnotationSchema, annotationData);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Annotation>(API_ROUTES.dates.ANNOTATIONS_DETAIL(annotationId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			annotationMutate(updatedItem);
			annotationsListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Annotation>(API_ROUTES.dates.ANNOTATIONS_DETAIL(annotationId), 'DELETE', annotationData),
		onSuccess: () => {
			form.resetDirty();
			annotationsListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.dates.ANNOTATIONS_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Annotation>(API_ROUTES.dates.ANNOTATIONS_DETAIL_LOCK(annotationId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			annotationMutate(updatedItem);
			annotationsListMutate();
		},
	});

	//
	// E. Setup permissions

	// For read permission, user needs access to at least ONE agency (requireAll: false)
	const viewPermissions = meContext.actions.getScopePermissions({
		actions: PermissionCatalog.all.annotations.actions,
		resource: {
			key: 'agency_ids',
			requireAll: false,
			value: annotationData?.agency_ids ?? [],
		},
		scope: PermissionCatalog.all.annotations.scope,
	});

	// For update/delete/lock permissions, user needs access to ALL agencies (requireAll: true)
	const editPermissions = meContext.actions.getScopePermissions({
		actions: PermissionCatalog.all.annotations.actions,
		resource: {
			key: 'agency_ids',
			requireAll: true,
			value: annotationData?.agency_ids ?? [],
		},
		scope: PermissionCatalog.all.annotations.scope,
	});

	const permissions = useMemo(() => ({
		delete: editPermissions.delete,
		lock: editPermissions.lock,
		read: viewPermissions.read,
		update: editPermissions.update,
	}), [editPermissions, viewPermissions]);

	const { canDelete, canLock, canSave, isReadOnly } = useDetailState({
		hasError: !!annotationError,
		isDeleted: null,
		isDeleting,
		isDirty: form.isDirty(),
		isLoading: annotationLoading,
		isLocked: annotationData?.is_locked,
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

	const contextValue: AnnotationsDetailContextState = useMemo(() => ({
		actions: {
			delete: handleDelete,
			lock: handleLock,
			save: handleSave,
		},
		data: {
			annotation: annotationData,
			form,
			id: annotationId,
		},
		flags: {
			canDelete,
			canLock,
			canSave,
			error: annotationError,
			isDeleting,
			isLoading: annotationLoading,
			isLocking,
			isReadOnly,
			isSaving: isSaving,
		},
	}), [
		annotationData,
		annotationError,
		annotationLoading,
		annotationId,
		form,
		isSaving,
	]);

	//
	// G. Render components

	return (
		<AnnotationsDetailContext.Provider value={contextValue}>
			{children}
		</AnnotationsDetailContext.Provider>
	);

	//
};
