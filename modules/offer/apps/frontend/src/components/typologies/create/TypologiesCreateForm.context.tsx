'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateTypologyDto, CreateTypologySchema, type Typology } from '@tmlmobilidade/go-types-offer';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { getTypologiesPermissions } from '../shared/typologies-permissions';
import { useTypologiesData } from '../shared/use-typologies-data';
import { closeCreateTypologyModal } from './TypologyCreate.modal';

/* * */

const TypologiesCreateFormContext = createContext<StandardFormContextValue<CreateTypologyDto> | undefined>(undefined);

/* * */

export function useTypologiesCreateFormContext() {
	const context = useContext(TypologiesCreateFormContext);
	if (!context) throw new Error('useTypologiesCreateFormContext must be used within TypologiesCreateFormContextProvider');
	return context;
}

/* * */

export function TypologiesCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: me, error: meError, isLoading: meLoading } = useMeData();

	const { mutate: listMutate } = useTypologiesData();

	//
	// B. Setup form

	const { form, isDirty, unblock } = useStandardForm<CreateTypologyDto, typeof CreateTypologySchema>({
		defaultValues: {
			agency_ids: [],
			code: '',
			name: '',
		},
		schema: CreateTypologySchema,
	});
	const values = useStandardFormWatch({ control: form.control });
	// Check current values: the shared form hook only counts recorded errors.
	const isValid = CreateTypologySchema.safeParse(values).success;

	//
	// C. Handle actions

	const { action: handleCreateRequest, isLoading: isCreating } = useHandleAction({
		fetchFn: async (data: CreateTypologyDto) => await fetchApiData<Typology>({ body: data, method: 'POST', url: API_ROUTES.offer.TYPOLOGIES_CREATE }),
		onSuccess: (response) => {
			form.reset();
			unblock();
			listMutate();
			closeCreateTypologyModal();
			if (response.data) router.push(keepUrlParams(PAGE_ROUTES.offer.TYPOLOGIES_DETAIL(response.data._id)));
		},
	});

	//
	// D. Setup permissions

	const permissions = getTypologiesPermissions({
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

	const stateValue: StandardFormContextValue<CreateTypologyDto> = useMemo(() => ({
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
		<TypologiesCreateFormContext.Provider value={stateValue}>
			{children}
		</TypologiesCreateFormContext.Provider>
	);
}
