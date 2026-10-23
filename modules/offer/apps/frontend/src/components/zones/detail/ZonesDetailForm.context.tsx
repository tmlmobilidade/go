'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type UpdateZoneDto, UpdateZoneSchema, type Zone } from '@tmlmobilidade/go-types-offer';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { useZonesData } from '../shared/use-zones-data';
import { getZonesPermissions } from '../shared/zones-permissions';
import { useZonesDetailData } from './use-zones-detail-data';
import { useZonesDetailZoneId } from './use-zones-detail-zone-id';

/* * */

const ZonesDetailFormContext = createContext<StandardFormContextValue<UpdateZoneDto> | undefined>(undefined);

/* * */

export function useZonesDetailFormContext() {
	const context = useContext(ZonesDetailFormContext);
	if (!context) throw new Error('useZonesDetailFormContext must be used within ZonesDetailFormContextProvider');
	return context;
}

/* * */

export function ZonesDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: me, error: meError, isLoading: meLoading } = useMeData();

	const { mutate: listMutate } = useZonesData();
	const { zoneId } = useZonesDetailZoneId();
	const { data: zone, error, isLoading, mutate: detailMutate } = useZonesDetailData();

	//
	// B. Setup form

	const { form, isDirty, isValid: hasNoErrors, unblock } = useStandardForm<UpdateZoneDto, typeof UpdateZoneSchema>({
		apiData: zone,
		schema: UpdateZoneSchema,
	});
	const values = useStandardFormWatch({ control: form.control });
	// Check current values: the shared form hook only counts recorded errors.
	const isValid = hasNoErrors && UpdateZoneSchema.safeParse(values).success;

	//
	// C. Handle actions

	const { action: handleUpdateRequest, isLoading: isUpdating } = useHandleAction({
		fetchFn: async (data: UpdateZoneDto) => await fetchApiData<Zone>({ body: UpdateZoneSchema.parse(data), method: 'PUT', url: API_ROUTES.offer.ZONES_DETAIL(zoneId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			detailMutate(response, { revalidate: false });
			listMutate();
		},
	});
	const { action: handleLockRequest, isLoading: isLocking } = useHandleAction({
		fetchFn: async () => await fetchApiData<Zone>({ url: API_ROUTES.offer.ZONES_DETAIL_LOCK(zoneId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			detailMutate(response, { revalidate: false });
			listMutate();
		},
	});
	const { action: handleDeleteRequest, isLoading: isDeleting } = useHandleAction({
		fetchFn: async () => await fetchApiData<undefined>({ method: 'DELETE', url: API_ROUTES.offer.ZONES_DETAIL(zoneId) }),
		onSuccess: () => {
			form.reset();
			unblock();
			listMutate();
			router.push(keepUrlParams(PAGE_ROUTES.offer.ZONES_LIST));
		},
	});

	//
	// D. Setup permissions

	const permissions = getZonesPermissions({
		currentAgencyIds: zone?.agency_ids ?? [],
		selectedAgencyIds: values.agency_ids ?? [],
		userPermissions: me?.permissions,
	});

	//
	// E. Setup capabilities and handlers

	const busy = isUpdating || isLocking || isDeleting;
	const loading = isLoading || meLoading || !zone || !!error || !!meError;

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
			isLocked: zone?.is_locked,
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

	const stateValue: StandardFormContextValue<UpdateZoneDto> = useMemo(() => ({
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
			isLocked: zone?.is_locked,
			isLocking,
			isUpdating,
		},
		unblock,
	}), [handleDelete, handleLock, handleUpdate, deleteEnabled, editEnabled, lockEnabled, updateEnabled, form, isDirty, isValid, isDeleting, isLoading, zone?.is_locked, isLocking, isUpdating, unblock]);

	return (
		<ZonesDetailFormContext.Provider value={stateValue}>
			{children}
		</ZonesDetailFormContext.Provider>
	);
}
