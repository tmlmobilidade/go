'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Holiday, type UpdateHolidayDto, UpdateHolidaySchema } from '@tmlmobilidade/go-types-dates';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { getHolidaysPermissions } from '../shared/holidays-permissions';
import { useHolidaysData } from '../shared/use-holidays-data';
import { useHolidaysDetailData } from './use-holidays-detail-data';
import { useHolidaysDetailHolidayId } from './use-holidays-detail-holiday-id';

/* * */

const HolidaysDetailFormContext = createContext<StandardFormContextValue<UpdateHolidayDto> | undefined>(undefined);

/* * */

export function useHolidaysDetailFormContext() {
	const context = useContext(HolidaysDetailFormContext);
	if (!context) throw new Error('useHolidaysDetailFormContext must be used within HolidaysDetailFormContextProvider');
	return context;
}

/* * */

export function HolidaysDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: me, error: meError, isLoading: meLoading } = useMeData();

	const { mutate: listMutate } = useHolidaysData();
	const { holidayId } = useHolidaysDetailHolidayId();
	const { data: holiday, error, isLoading, mutate: detailMutate } = useHolidaysDetailData();

	//
	// B. Setup form

	const { form, isDirty, unblock } = useStandardForm<UpdateHolidayDto, typeof UpdateHolidaySchema>({
		apiData: holiday,
		schema: UpdateHolidaySchema,
	});
	const values = useStandardFormWatch({ control: form.control });
	// Check current values: the shared form hook only counts recorded errors.
	const isValid = UpdateHolidaySchema.safeParse(values).success;

	//
	// C. Handle actions

	const { action: handleUpdateRequest, isLoading: isUpdating } = useHandleAction({
		fetchFn: async (data: UpdateHolidayDto) => await fetchApiData<Holiday>({ body: UpdateHolidaySchema.parse(data), method: 'PUT', url: API_ROUTES.dates.HOLIDAYS_DETAIL(holidayId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			detailMutate(response, { revalidate: false });
			listMutate();
		},
	});
	const { action: handleLockRequest, isLoading: isLocking } = useHandleAction({
		fetchFn: async () => await fetchApiData<Holiday>({ url: API_ROUTES.dates.HOLIDAYS_DETAIL_LOCK(holidayId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			detailMutate(response, { revalidate: false });
			listMutate();
		},
	});
	const { action: handleDeleteRequest, isLoading: isDeleting } = useHandleAction({
		fetchFn: async () => await fetchApiData<undefined>({ method: 'DELETE', url: API_ROUTES.dates.HOLIDAYS_DETAIL(holidayId) }),
		onSuccess: () => {
			form.reset();
			unblock();
			listMutate();
			router.push(keepUrlParams(PAGE_ROUTES.dates.HOLIDAYS_LIST));
		},
	});

	//
	// D. Setup permissions

	const permissions = getHolidaysPermissions({
		currentAgencyIds: holiday?.agency_ids ?? [],
		selectedAgencyIds: values.agency_ids ?? [],
		userPermissions: me?.permissions,
	});

	//
	// E. Setup capabilities and handlers

	const busy = isUpdating || isLocking || isDeleting;
	const loading = isLoading || meLoading || !holiday || !!error || !!meError;

	const standardCapabilities = useStandardFormCapabilities({
		delete: {
			hasPermission: permissions.delete,
			isDeleting,
		},
		form: {
			isDirty,
			isValid,
		},
		loading: {
			isLoading: loading,
		},
		locked: {
			hasPermission: permissions.lock,
			isLocked: holiday?.is_locked,
			isLocking,
		},
		update: {
			hasPermission: permissions.update,
			isUpdating,
		},
	});

	const deleteEnabled = standardCapabilities.deleteEnabled && !busy;
	const editEnabled = standardCapabilities.editEnabled && permissions.edit && !loading;
	const lockEnabled = standardCapabilities.lockEnabled && !busy;
	const updateEnabled = standardCapabilities.updateEnabled && !busy;

	const handleDelete = useCallback(() => {
		if (!deleteEnabled) return;
		void handleDeleteRequest();
	}, [deleteEnabled, handleDeleteRequest]);

	const handleLock = useCallback(() => {
		if (!lockEnabled) return;
		void handleLockRequest();
	}, [lockEnabled, handleLockRequest]);

	const handleUpdate = useCallback(async () => {
		if (!updateEnabled) return;
		await form.handleSubmit(handleUpdateRequest)();
	}, [updateEnabled, form, handleUpdateRequest]);

	//
	// F. Return context value

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
			isLoading,
			isLocked: holiday?.is_locked,
			isLocking,
			isUpdating,
		},
		unblock,
	}), [handleDelete, handleLock, handleUpdate, deleteEnabled, editEnabled, lockEnabled, updateEnabled, form, isDirty, isValid, isDeleting, isLoading, holiday?.is_locked, isLocking, isUpdating, unblock]);

	return (
		<HolidaysDetailFormContext.Provider value={stateValue}>
			{children}
		</HolidaysDetailFormContext.Provider>
	);
}
