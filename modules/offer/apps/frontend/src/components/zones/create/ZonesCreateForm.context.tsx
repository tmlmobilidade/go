'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateZoneDto, CreateZoneSchema, type Zone } from '@tmlmobilidade/go-types-offer';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { useZonesData } from '../shared/use-zones-data';
import { getZonesPermissions } from '../shared/zones-permissions';
import { closeCreateZoneModal } from './ZoneCreate.modal';

/* * */

const ZonesCreateFormContext = createContext<StandardFormContextValue<CreateZoneDto> | undefined>(undefined);

/* * */

export function useZonesCreateFormContext() {
	const context = useContext(ZonesCreateFormContext);
	if (!context) throw new Error('useZonesCreateFormContext must be used within ZonesCreateFormContextProvider');
	return context;
}

/* * */

export function ZonesCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: me, error: meError, isLoading: meLoading } = useMeData();

	const { mutate: listMutate } = useZonesData();

	//
	// B. Setup form

	const { form, isDirty, unblock } = useStandardForm<CreateZoneDto, typeof CreateZoneSchema>({
		defaultValues: {
			agency_ids: [],
			code: '',
			name: '',
		},
		schema: CreateZoneSchema,
	});
	const values = useStandardFormWatch({ control: form.control });
	// Check current values: the shared form hook only counts recorded errors.
	const isValid = CreateZoneSchema.safeParse(values).success;

	//
	// C. Handle actions

	const { action: handleCreateRequest, isLoading: isCreating } = useHandleAction({
		fetchFn: async (data: CreateZoneDto) => await fetchApiData<Zone>({ body: data, method: 'POST', url: API_ROUTES.offer.ZONES_CREATE }),
		onSuccess: (response) => {
			form.reset();
			unblock();
			listMutate();
			closeCreateZoneModal();
			if (response.data) router.push(keepUrlParams(PAGE_ROUTES.offer.ZONES_DETAIL(response.data._id)));
		},
	});

	//
	// D. Setup permissions

	const permissions = getZonesPermissions({
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

	const stateValue: StandardFormContextValue<CreateZoneDto> = useMemo(() => ({
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
		<ZonesCreateFormContext.Provider value={stateValue}>
			{children}
		</ZonesCreateFormContext.Provider>
	);
}
