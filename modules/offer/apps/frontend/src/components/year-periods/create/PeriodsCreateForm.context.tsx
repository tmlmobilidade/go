'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateYearPeriodDto, CreateYearPeriodSchema, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { getPeriodsPermissions } from '../shared/periods-permissions';
import { usePeriodsData } from '../shared/use-periods-data';
import { closeCreatePeriodModal } from './PeriodCreate.modal';

/* * */

const PeriodsCreateFormContext = createContext<StandardFormContextValue<CreateYearPeriodDto> | undefined>(undefined);

/* * */

export function usePeriodsCreateFormContext() {
	const context = useContext(PeriodsCreateFormContext);
	if (!context) throw new Error('usePeriodsCreateFormContext must be used within PeriodsCreateFormContextProvider');
	return context;
}

/* * */

export function PeriodsCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: me, error: meError, isLoading: meLoading } = useMeData();

	const { mutate: listMutate } = usePeriodsData();

	//
	// B. Setup form

	const { form, isDirty, unblock } = useStandardForm<CreateYearPeriodDto, typeof CreateYearPeriodSchema>({
		defaultValues: {
			agency_ids: [],
			code: '',
			color: '',
			dates: [],
			is_locked: false,
			name: '',
		},
		schema: CreateYearPeriodSchema,
	});
	const values = useStandardFormWatch({ control: form.control });
	// Check current values: the shared form hook only counts recorded errors.
	const isValid = CreateYearPeriodSchema.safeParse(values).success;

	//
	// C. Handle actions

	const { action: handleCreateRequest, isLoading: isCreating } = useHandleAction({
		fetchFn: async (data: CreateYearPeriodDto) => await fetchApiData<YearPeriod>({ body: data, method: 'POST', url: API_ROUTES.offer.YEAR_PERIODS_CREATE }),
		onSuccess: (response) => {
			form.reset();
			unblock();
			listMutate();
			closeCreatePeriodModal();
			if (response.data) router.push(keepUrlParams(PAGE_ROUTES.offer.YEAR_PERIODS_DETAIL(response.data._id)));
		},
	});

	//
	// D. Setup permissions

	const permissions = getPeriodsPermissions({
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

	const stateValue: StandardFormContextValue<CreateYearPeriodDto> = useMemo(() => ({
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
		<PeriodsCreateFormContext.Provider value={stateValue}>
			{children}
		</PeriodsCreateFormContext.Provider>
	);
}
