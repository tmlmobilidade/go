'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type UpdateYearPeriodDto, UpdateYearPeriodSchema, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useYearPeriodsListData } from '../list/use-year-periods-list-data';
import { useYearPeriodsDetailData } from './use-year-periods-detail-data';
import { useYearPeriodsDetailYearPeriodId } from './use-year-periods-detail-year-period-id';

/* * */

const YearPeriodsDetailFormContext = createContext<StandardFormContextValue<UpdateYearPeriodDto> | undefined>(undefined);

export function useYearPeriodsDetailFormContext() {
	const context = useContext(YearPeriodsDetailFormContext);
	if (!context) throw new Error('useYearPeriodsDetailFormContext must be used within a YearPeriodsDetailFormContextProvider');
	return context;
}

/* * */

export function YearPeriodsDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { yearPeriodId } = useYearPeriodsDetailYearPeriodId();

	const { data: meData } = useMeData();

	const { mutate: yearPeriodsListMutate } = useYearPeriodsListData();

	const { data: yearPeriodData, isLoading: yearPeriodDataLoading, mutate: yearPeriodsDetailMutate } = useYearPeriodsDetailData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<UpdateYearPeriodDto, typeof UpdateYearPeriodSchema>({
		apiData: yearPeriodData,
		schema: UpdateYearPeriodSchema,
	});

	//
	// C. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleAction({
		fetchFn: async () => await fetchApiData<YearPeriod>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.dates.YEAR_PERIODS_DETAIL(yearPeriodId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			yearPeriodsDetailMutate(response);
			yearPeriodsListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleAction({
		fetchFn: async () => await fetchApiData<YearPeriod>({ method: 'DELETE', url: API_ROUTES.dates.YEAR_PERIODS_DETAIL(yearPeriodId) }),
		onSuccess: () => {
			unblock();
			yearPeriodsListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.dates.YEAR_PERIODS_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleAction({
		fetchFn: async () => await fetchApiData<YearPeriod>({ url: API_ROUTES.dates.YEAR_PERIODS_DETAIL_LOCK(yearPeriodId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			yearPeriodsDetailMutate(response);
			yearPeriodsListMutate();
		},
	});

	//
	// D. Setup flags

	const { hasDeletePermission, hasLockPermission, hasUpdatePermission } = useMemo(() => {
		const hasPermissionForAllAgencies = (action: 'delete' | 'lock' | 'update') => PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.year_periods.actions[action],
			permissions: meData?.permissions ?? [],
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.year_periods.scope,
			value: yearPeriodData?.agency_ids ?? [],
		});
		return {
			hasDeletePermission: hasPermissionForAllAgencies('delete'),
			hasLockPermission: hasPermissionForAllAgencies('lock'),
			hasUpdatePermission: hasPermissionForAllAgencies('update'),
		};
	}, [yearPeriodData?.agency_ids, meData?.permissions]);

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
			isLoading: yearPeriodDataLoading,
		},
		locked: {
			hasPermission: hasLockPermission,
			isLocked: yearPeriodData?.is_locked ?? false,
			isLocking: isLocking,
		},
		update: {
			hasPermission: hasUpdatePermission,
			isUpdating: isUpdating,
		},
	});

	//
	// E. Return state

	const stateValue: StandardFormContextValue<UpdateYearPeriodDto> = useMemo(() => ({
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
			isLoading: yearPeriodDataLoading,
			isLocked: yearPeriodData?.is_locked,
			isLocking,
			isUpdating,
		},
		unblock,
	}), [yearPeriodData?.is_locked, yearPeriodDataLoading, deleteEnabled, editEnabled, form, handleDelete, handleLock, handleUpdate, isDeleting, isDirty, isLocking, isUpdating, isValid, lockEnabled, unblock, updateEnabled]);

	return (
		<YearPeriodsDetailFormContext.Provider value={stateValue}>
			{children}
		</YearPeriodsDetailFormContext.Provider>
	);
}
