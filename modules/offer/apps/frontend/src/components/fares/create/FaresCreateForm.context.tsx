'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateFareDto, CreateFareSchema, type Fare } from '@tmlmobilidade/go-types-offer';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { getFaresPermissions } from '../shared/fares-permissions';
import { useFaresData } from '../shared/use-fares-data';
import { closeCreateFareModal } from './FareCreate.modal';

/* * */

const FaresCreateFormContext = createContext<StandardFormContextValue<CreateFareDto> | undefined>(undefined);

/* * */

export function useFaresCreateFormContext() {
	const context = useContext(FaresCreateFormContext);
	if (!context) throw new Error('useFaresCreateFormContext must be used within FaresCreateFormContextProvider');
	return context;
}

/* * */

export function FaresCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: me, error: meError, isLoading: meLoading } = useMeData();

	const { mutate: listMutate } = useFaresData();

	//
	// B. Setup form

	const { form, isDirty, unblock } = useStandardForm<CreateFareDto, typeof CreateFareSchema>({
		defaultValues: {
			agency_ids: [],
			code: '',
			name: '',
		},
		schema: CreateFareSchema,
	});
	const values = useStandardFormWatch({ control: form.control });
	// Check current values: the shared form hook only counts recorded errors.
	const isValid = CreateFareSchema.safeParse(values).success;

	//
	// C. Handle actions

	const { action: handleCreateRequest, isLoading: isCreating } = useHandleAction({
		fetchFn: async (data: CreateFareDto) => await fetchApiData<Fare>({ body: data, method: 'POST', url: API_ROUTES.offer.FARES_CREATE }),
		onSuccess: (response) => {
			form.reset();
			unblock();
			listMutate();
			closeCreateFareModal();
			if (response.data) router.push(keepUrlParams(PAGE_ROUTES.offer.FARES_DETAIL(response.data._id)));
		},
	});

	//
	// D. Setup permissions

	const permissions = getFaresPermissions({
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

	const stateValue: StandardFormContextValue<CreateFareDto> = useMemo(() => ({
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
		<FaresCreateFormContext.Provider value={stateValue}>
			{children}
		</FaresCreateFormContext.Provider>
	);
}
