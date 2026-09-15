'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateYearPeriodDto, CreateYearPeriodSchema, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useYearPeriodsListData } from '../list/use-year-periods-list-data';
import { closeYearPeriodsCreateModal } from './YearPeriodsCreate.modal';

/* * */

const YearPeriodsCreateFormContext = createContext<StandardFormContextValue<CreateYearPeriodDto> | undefined>(undefined);

export function useYearPeriodsCreateFormContext() {
	const context = useContext(YearPeriodsCreateFormContext);
	if (!context) throw new Error('useYearPeriodsCreateFormContext must be used within a YearPeriodsCreateFormContextProvider');
	return context;
}

/* * */

export function YearPeriodsCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: meData } = useMeData();

	const { mutate: yearPeriodsListMutate } = useYearPeriodsListData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<CreateYearPeriodDto, typeof CreateYearPeriodSchema>({
		schema: CreateYearPeriodSchema,
	});

	//
	// C. Handle actions

	const { action: handleCreate, isLoading: isCreating } = useHandleAction({
		fetchFn: async () => await fetchApiData<YearPeriod>({ body: form.getValues(), method: 'POST', url: API_ROUTES.dates.YEAR_PERIODS_LIST }),
		onSuccess: ({ data }) => {
			closeYearPeriodsCreateModal();
			form.reset();
			unblock();
			yearPeriodsListMutate();
			if (!data?._id) return;
			router.push(keepUrlParams(PAGE_ROUTES.dates.YEAR_PERIODS_DETAIL(data._id)));
		},
	});

	//
	// D. Setup flags

	const hasCreatePermission = useMemo(() => {
		return PermissionCatalog.hasPermission(meData?.permissions ?? [], PermissionCatalog.all.year_periods.scope, PermissionCatalog.all.year_periods.actions.create);
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
	}), [createEnabled, editEnabled, form, handleCreate, isCreating, isDirty, isValid, unblock]);

	return (
		<YearPeriodsCreateFormContext.Provider value={stateValue}>
			{children}
		</YearPeriodsCreateFormContext.Provider>
	);
}
