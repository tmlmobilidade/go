'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Annotation, type CreateAnnotationDto, CreateAnnotationSchema } from '@tmlmobilidade/go-types-dates';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { getAnnotationsPermissions } from '../shared/annotations-permissions';
import { useAnnotationsData } from '../shared/use-annotations-data';
import { closeCreateAnnotationModal } from './AnnotationCreate.modal';

/* * */

const AnnotationsCreateFormContext = createContext<StandardFormContextValue<CreateAnnotationDto> | undefined>(undefined);

/* * */

export function useAnnotationsCreateFormContext() {
	const context = useContext(AnnotationsCreateFormContext);
	if (!context) throw new Error('useAnnotationsCreateFormContext must be used within AnnotationsCreateFormContextProvider');
	return context;
}

/* * */

export function AnnotationsCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: me, error: meError, isLoading: meLoading } = useMeData();

	const { mutate: listMutate } = useAnnotationsData();

	//
	// B. Setup form

	const { form, isDirty, unblock } = useStandardForm<CreateAnnotationDto, typeof CreateAnnotationSchema>({
		defaultValues: {
			agency_ids: [],
			dates: [],
			description: '',
			is_locked: false,
			title: '',
		},
		schema: CreateAnnotationSchema,
	});
	const values = useStandardFormWatch({ control: form.control });
	// Check current values: the shared form hook only counts recorded errors.
	const isValid = CreateAnnotationSchema.safeParse(values).success;

	//
	// C. Handle actions

	const { action: handleCreateRequest, isLoading: isCreating } = useHandleAction({
		fetchFn: async (data: CreateAnnotationDto) => await fetchApiData<Annotation>({ body: data, method: 'POST', url: API_ROUTES.dates.ANNOTATIONS_CREATE }),
		onSuccess: (response) => {
			form.reset();
			unblock();
			listMutate();
			closeCreateAnnotationModal();
			if (response.data) router.push(keepUrlParams(PAGE_ROUTES.dates.ANNOTATIONS_DETAIL(response.data._id)));
		},
	});

	//
	// D. Setup permissions

	const permissions = getAnnotationsPermissions({
		selectedAgencyIds: values.agency_ids ?? [],
		userPermissions: me?.permissions,
	});

	//
	// E. Setup capabilities and handlers

	const { createEnabled, editEnabled: formEditEnabled } = useStandardFormCapabilities({
		create: {
			hasPermission: permissions.create && !meError,
			isCreating: isCreating || meLoading,
		},
		form: {
			isDirty,
			isValid,
		},
	});

	const editEnabled = formEditEnabled && permissions.create && !meLoading && !meError;

	const handleCreate = useCallback(async () => {
		if (!createEnabled) return;
		await form.handleSubmit(handleCreateRequest)();
	}, [createEnabled, form, handleCreateRequest]);

	//
	// F. Return context value

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
	}), [createEnabled, editEnabled, form, handleCreate, isCreating, unblock, isDirty, isValid]);

	return (
		<AnnotationsCreateFormContext.Provider value={stateValue}>
			{children}
		</AnnotationsCreateFormContext.Provider>
	);
}
