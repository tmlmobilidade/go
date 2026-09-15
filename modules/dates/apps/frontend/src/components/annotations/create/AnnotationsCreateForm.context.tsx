'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Annotation, type CreateAnnotationDto, CreateAnnotationSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useAnnotationsListData } from '../list/use-annotations-list-data';
import { closeAnnotationsCreateModal } from './AnnotationsCreate.modal';

/* * */

const AnnotationsCreateFormContext = createContext<StandardFormContextValue<CreateAnnotationDto> | undefined>(undefined);

export function useAnnotationsCreateFormContext() {
	const context = useContext(AnnotationsCreateFormContext);
	if (!context) throw new Error('useAnnotationsCreateFormContext must be used within a AnnotationsCreateFormContextProvider');
	return context;
}

/* * */

export function AnnotationsCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: meData } = useMeData();

	const { mutate: annotationsListMutate } = useAnnotationsListData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<CreateAnnotationDto, typeof CreateAnnotationSchema>({
		schema: CreateAnnotationSchema,
	});

	//
	// C. Handle actions

	const { action: handleCreate, isLoading: isCreating } = useHandleAction({
		fetchFn: async () => await fetchApiData<Annotation>({ body: form.getValues(), method: 'POST', url: API_ROUTES.dates.ANNOTATIONS_LIST }),
		onSuccess: ({ data }) => {
			closeAnnotationsCreateModal();
			form.reset();
			unblock();
			annotationsListMutate();
			if (!data?._id) return;
			router.push(keepUrlParams(PAGE_ROUTES.dates.ANNOTATIONS_DETAIL(data._id)));
		},
	});

	//
	// D. Setup flags

	const hasCreatePermission = useMemo(() => {
		return PermissionCatalog.hasPermission(meData?.permissions ?? [], PermissionCatalog.all.annotations.scope, PermissionCatalog.all.annotations.actions.create);
	}, [meData?.permissions]);

	const { createEnabled, editEnabled } = useStandardFormCapabilities({
		create: {
			hasPermission: hasCreatePermission,
			isCreating: isCreating,
		},
		form: {
			isDirty,
			isValid,
		},
	});

	//
	// E. Return state

	const stateValue: StandardFormContextValue<CreateAnnotationDto> = useMemo(() => ({
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
		<AnnotationsCreateFormContext.Provider value={stateValue}>
			{children}
		</AnnotationsCreateFormContext.Provider>
	);
}
