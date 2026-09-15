'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Holiday, type UpdateHolidayDto, UpdateHolidaySchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useHolidaysListData } from '../list/use-holidays-list-data';
import { useHolidaysDetailData } from './use-holidays-detail-data';
import { useHolidaysDetailHolidayId } from './use-holidays-detail-holiday-id';

/* * */

const HolidaysDetailFormContext = createContext<StandardFormContextValue<UpdateHolidayDto> | undefined>(undefined);

export function useHolidaysDetailFormContext() {
	const context = useContext(HolidaysDetailFormContext);
	if (!context) throw new Error('useHolidaysDetailFormContext must be used within a HolidaysDetailFormContextProvider');
	return context;
}

/* * */

export function HolidaysDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { holidayId } = useHolidaysDetailHolidayId();

	const { data: meData } = useMeData();

	const { mutate: holidaysListMutate } = useHolidaysListData();

	const { data: holidayData, isLoading: holidayDataLoading, mutate: holidaysDetailMutate } = useHolidaysDetailData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<UpdateHolidayDto, typeof UpdateHolidaySchema>({
		apiData: holidayData,
		schema: UpdateHolidaySchema,
	});

	//
	// C. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleAction({
		fetchFn: async () => await fetchApiData<Holiday>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.dates.HOLIDAYS_DETAIL(holidayId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			holidaysDetailMutate(response);
			holidaysListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleAction({
		fetchFn: async () => await fetchApiData<Holiday>({ method: 'DELETE', url: API_ROUTES.dates.HOLIDAYS_DETAIL(holidayId) }),
		onSuccess: () => {
			unblock();
			holidaysListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.dates.HOLIDAYS_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleAction({
		fetchFn: async () => await fetchApiData<Holiday>({ url: API_ROUTES.dates.HOLIDAYS_DETAIL_LOCK(holidayId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			holidaysDetailMutate(response);
			holidaysListMutate();
		},
	});

	//
	// D. Setup flags

	const { hasDeletePermission, hasLockPermission, hasUpdatePermission } = useMemo(() => {
		const hasPermissionForAllAgencies = (action: 'delete' | 'lock' | 'update') => PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.holidays.actions[action],
			permissions: meData?.permissions ?? [],
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.holidays.scope,
			value: holidayData?.agency_ids ?? [],
		});
		return {
			hasDeletePermission: hasPermissionForAllAgencies('delete'),
			hasLockPermission: hasPermissionForAllAgencies('lock'),
			hasUpdatePermission: hasPermissionForAllAgencies('update'),
		};
	}, [holidayData?.agency_ids, meData?.permissions]);

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
			isLoading: holidayDataLoading,
		},
		locked: {
			hasPermission: hasLockPermission,
			isLocked: holidayData?.is_locked ?? false,
			isLocking: isLocking,
		},
		update: {
			hasPermission: hasUpdatePermission,
			isUpdating: isUpdating,
		},
	});

	//
	// E. Return state

	const stateValue: StandardFormContextValue<UpdateHolidayDto> = useMemo(() => ({
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
			isLoading: holidayDataLoading,
			isLocked: holidayData?.is_locked,
			isLocking,
			isUpdating,
		},
		unblock,
	}), [holidayData?.is_locked, holidayDataLoading, deleteEnabled, editEnabled, form, handleDelete, handleLock, handleUpdate, isDeleting, isDirty, isLocking, isUpdating, isValid, lockEnabled, unblock, updateEnabled]);

	return (
		<HolidaysDetailFormContext.Provider value={stateValue}>
			{children}
		</HolidaysDetailFormContext.Provider>
	);
}
