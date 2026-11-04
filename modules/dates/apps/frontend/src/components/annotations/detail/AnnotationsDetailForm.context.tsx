'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Annotation, type UpdateAnnotationDto, UpdateAnnotationSchema } from '@tmlmobilidade/go-types-dates';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { getAnnotationsPermissions } from '../shared/annotations-permissions';
import { useAnnotationsData } from '../shared/use-annotations-data';
import { useAnnotationsDetailAnnotationId } from './use-annotations-detail-annotation-id';
import { useAnnotationsDetailData } from './use-annotations-detail-data';

/* * */

const AnnotationsDetailFormContext = createContext<StandardFormContextValue<UpdateAnnotationDto> | undefined>(undefined);

/* * */

export function useAnnotationsDetailFormContext() {
	const context = useContext(AnnotationsDetailFormContext);
	if (!context) throw new Error('useAnnotationsDetailFormContext must be used within AnnotationsDetailFormContextProvider');
	return context;
}

/* * */

export function AnnotationsDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: me, error: meError, isLoading: meLoading } = useMeData();

	const { mutate: listMutate } = useAnnotationsData();
	const { annotationId } = useAnnotationsDetailAnnotationId();
	const { data: annotation, error, isLoading, mutate: detailMutate } = useAnnotationsDetailData();

	//
	// B. Setup form

	const { form, isDirty, unblock } = useStandardForm<UpdateAnnotationDto, typeof UpdateAnnotationSchema>({
		apiData: annotation,
		schema: UpdateAnnotationSchema,
	});
	const values = useStandardFormWatch({ control: form.control });
	// Check current values: the shared form hook only counts recorded errors.
	const isValid = UpdateAnnotationSchema.safeParse(values).success;

	//
	// C. Handle actions

	const { action: handleUpdateRequest, isLoading: isUpdating } = useHandleAction({
		fetchFn: async (data: UpdateAnnotationDto) => await fetchApiData<Annotation>({ body: UpdateAnnotationSchema.parse(data), method: 'PUT', url: API_ROUTES.dates.ANNOTATIONS_DETAIL(annotationId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			detailMutate(response, { revalidate: false });
			listMutate();
		},
	});
	const { action: handleLockRequest, isLoading: isLocking } = useHandleAction({
		fetchFn: async () => await fetchApiData<Annotation>({ url: API_ROUTES.dates.ANNOTATIONS_DETAIL_LOCK(annotationId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			detailMutate(response, { revalidate: false });
			listMutate();
		},
	});
	const { action: handleDeleteRequest, isLoading: isDeleting } = useHandleAction({
		fetchFn: async () => await fetchApiData<undefined>({ method: 'DELETE', url: API_ROUTES.dates.ANNOTATIONS_DETAIL(annotationId) }),
		onSuccess: () => {
			form.reset();
			unblock();
			listMutate();
			router.push(keepUrlParams(PAGE_ROUTES.dates.ANNOTATIONS_LIST));
		},
	});

	//
	// D. Setup permissions

	const permissions = getAnnotationsPermissions({
		currentAgencyIds: annotation?.agency_ids ?? [],
		selectedAgencyIds: values.agency_ids ?? [],
		userPermissions: me?.permissions,
	});

	//
	// E. Setup capabilities and handlers

	const busy = isUpdating || isLocking || isDeleting;
	const loading = isLoading || meLoading || !annotation || !!error || !!meError;

	const standardCapabilities = useStandardFormCapabilities({
		delete: {
			hasPermission: permissions.delete,
			isDeleting,
		},
		form: {
			isDirty,
			isValid,
		},
		loading: {
			isLoading: loading,
		},
		locked: {
			hasPermission: permissions.lock,
			isLocked: annotation?.is_locked,
			isLocking,
		},
		update: {
			hasPermission: permissions.update,
			isUpdating,
		},
	});

	const deleteEnabled = standardCapabilities.deleteEnabled && !busy;
	const editEnabled = standardCapabilities.editEnabled && permissions.edit && !loading;
	const lockEnabled = standardCapabilities.lockEnabled && !busy;
	const updateEnabled = standardCapabilities.updateEnabled && !busy;

	const handleDelete = useCallback(() => {
		if (!deleteEnabled) return;
		void handleDeleteRequest();
	}, [deleteEnabled, handleDeleteRequest]);

	const handleLock = useCallback(() => {
		if (!lockEnabled) return;
		void handleLockRequest();
	}, [lockEnabled, handleLockRequest]);

	const handleUpdate = useCallback(async () => {
		if (!updateEnabled) return;
		await form.handleSubmit(handleUpdateRequest)();
	}, [updateEnabled, form, handleUpdateRequest]);

	//
	// F. Return context value

	const stateValue: StandardFormContextValue<UpdateAnnotationDto> = useMemo(() => ({
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
		isDirty,
		isValid,
		status: {
			isDeleting,
			isLoading,
			isLocked: annotation?.is_locked,
			isLocking,
			isUpdating,
		},
		unblock,
	}), [handleDelete, handleLock, handleUpdate, deleteEnabled, editEnabled, lockEnabled, updateEnabled, form, isDirty, isValid, isDeleting, isLoading, annotation?.is_locked, isLocking, isUpdating, unblock]);

	return (
		<AnnotationsDetailFormContext.Provider value={stateValue}>
			{children}
		</AnnotationsDetailFormContext.Provider>
	);
}
