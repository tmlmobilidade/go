'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Annotation, type UpdateAnnotationDto, UpdateAnnotationSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useAnnotationsListData } from '../list/use-annotations-list-data';
import { useAnnotationsDetailAnnotationId } from './use-annotations-detail-annotation-id';
import { useAnnotationsDetailData } from './use-annotations-detail-data';

/* * */

const AnnotationsDetailFormContext = createContext<StandardFormContextValue<UpdateAnnotationDto> | undefined>(undefined);

export function useAnnotationsDetailFormContext() {
	const context = useContext(AnnotationsDetailFormContext);
	if (!context) throw new Error('useAnnotationsDetailFormContext must be used within a AnnotationsDetailFormContextProvider');
	return context;
}

/* * */

export function AnnotationsDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { annotationId } = useAnnotationsDetailAnnotationId();

	const { data: meData } = useMeData();

	const { mutate: annotationsListMutate } = useAnnotationsListData();

	const { data: annotationData, isLoading: annotationDataLoading, mutate: annotationsDetailMutate } = useAnnotationsDetailData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<UpdateAnnotationDto, typeof UpdateAnnotationSchema>({
		apiData: annotationData,
		schema: UpdateAnnotationSchema,
	});

	//
	// C. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleAction({
		fetchFn: async () => await fetchApiData<Annotation>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.dates.ANNOTATIONS_DETAIL(annotationId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			annotationsDetailMutate(response);
			annotationsListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleAction({
		fetchFn: async () => await fetchApiData<Annotation>({ method: 'DELETE', url: API_ROUTES.dates.ANNOTATIONS_DETAIL(annotationId) }),
		onSuccess: () => {
			unblock();
			annotationsListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.dates.ANNOTATIONS_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleAction({
		fetchFn: async () => await fetchApiData<Annotation>({ url: API_ROUTES.dates.ANNOTATIONS_DETAIL_LOCK(annotationId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			annotationsDetailMutate(response);
			annotationsListMutate();
		},
	});

	//
	// D. Setup flags

	const { hasDeletePermission, hasLockPermission, hasUpdatePermission } = useMemo(() => {
		const hasPermissionForAllAgencies = (action: 'delete' | 'lock' | 'update') => PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.annotations.actions[action],
			permissions: meData?.permissions ?? [],
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.annotations.scope,
			value: annotationData?.agency_ids ?? [],
		});
		return {
			hasDeletePermission: hasPermissionForAllAgencies('delete'),
			hasLockPermission: hasPermissionForAllAgencies('lock'),
			hasUpdatePermission: hasPermissionForAllAgencies('update'),
		};
	}, [annotationData?.agency_ids, meData?.permissions]);

	const { deleteEnabled, editEnabled, lockEnabled, updateEnabled } = useStandardFormCapabilities({
		delete: {
			hasPermission: hasDeletePermission,
			isDeleting: isDeleting,
		},
		form: {
			isDirty,
			isValid,
		},
		loading: {
			isLoading: annotationDataLoading,
		},
		locked: {
			hasPermission: hasLockPermission,
			isLocked: annotationData?.is_locked ?? false,
			isLocking: isLocking,
		},
		update: {
			hasPermission: hasUpdatePermission,
			isUpdating: isUpdating,
		},
	});

	//
	// E. Return state

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
			isLoading: annotationDataLoading,
			isLocked: annotationData?.is_locked,
			isLocking,
			isUpdating,
		},
		unblock,
	}), [annotationData?.is_locked, annotationDataLoading, deleteEnabled, editEnabled, form, handleDelete, handleLock, handleUpdate, isDeleting, isDirty, isLocking, isUpdating, isValid, lockEnabled, unblock, updateEnabled]);

	return (
		<AnnotationsDetailFormContext.Provider value={stateValue}>
			{children}
		</AnnotationsDetailFormContext.Provider>
	);
}
