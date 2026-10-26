'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateHolidayDto, CreateHolidaySchema, type Holiday } from '@tmlmobilidade/go-types-dates';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { getHolidaysPermissions } from '../shared/holidays-permissions';
import { useHolidaysData } from '../shared/use-holidays-data';
import { closeCreateHolidayModal } from './HolidayCreate.modal';

/* * */

const HolidaysCreateFormContext = createContext<StandardFormContextValue<CreateHolidayDto> | undefined>(undefined);

/* * */

export function useHolidaysCreateFormContext() {
	const context = useContext(HolidaysCreateFormContext);
	if (!context) throw new Error('useHolidaysCreateFormContext must be used within HolidaysCreateFormContextProvider');
	return context;
}

/* * */

export function HolidaysCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: me, error: meError, isLoading: meLoading } = useMeData();

	const { mutate: listMutate } = useHolidaysData();

	//
	// B. Setup form

	const { form, isDirty, unblock } = useStandardForm<CreateHolidayDto, typeof CreateHolidaySchema>({
		defaultValues: {
			agency_ids: [],
			dates: [],
			description: '',
			is_locked: false,
			title: '',
		},
		schema: CreateHolidaySchema,
	});
	const values = useStandardFormWatch({ control: form.control });
	// Check current values: the shared form hook only counts recorded errors.
	const isValid = CreateHolidaySchema.safeParse(values).success;

	//
	// C. Handle actions

	const { action: handleCreateRequest, isLoading: isCreating } = useHandleAction({
		fetchFn: async (data: CreateHolidayDto) => await fetchApiData<Holiday>({ body: data, method: 'POST', url: API_ROUTES.dates.HOLIDAYS_CREATE }),
		onSuccess: (response) => {
			form.reset();
			unblock();
			listMutate();
			closeCreateHolidayModal();
			if (response.data) router.push(keepUrlParams(PAGE_ROUTES.dates.HOLIDAYS_DETAIL(response.data._id)));
		},
	});

	//
	// D. Setup permissions

	const permissions = getHolidaysPermissions({
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

	const stateValue: StandardFormContextValue<CreateHolidayDto> = useMemo(() => ({
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
		<HolidaysCreateFormContext.Provider value={stateValue}>
			{children}
		</HolidaysCreateFormContext.Provider>
	);
}
