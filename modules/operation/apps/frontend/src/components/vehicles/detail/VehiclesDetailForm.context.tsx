'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type UpdateVehicleDto, UpdateVehicleSchema, type Vehicle } from '@tmlmobilidade/go-types-operation';
import { hasPermission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useVehiclesListData } from '../list/use-vehicles-list-data';
import { useVehiclesDetailData } from './use-vehicles-detail-data';
import { useVehiclesDetailVehicleId } from './use-vehicles-detail-vehicle-id';

/* * */

const VehiclesDetailFormContext = createContext<StandardFormContextValue<UpdateVehicleDto> | undefined>(undefined);

export function useVehiclesDetailFormContext() {
	const context = useContext(VehiclesDetailFormContext);
	if (!context) throw new Error('useVehiclesDetailFormContext must be used within a VehiclesDetailFormContextProvider');
	return context;
}

/* * */

export function VehiclesDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { vehicleId } = useVehiclesDetailVehicleId();

	const { data: meData } = useMeData();

	const { mutate: vehiclesListMutate } = useVehiclesListData();

	const { data: vehicleData, isLoading: vehicleDataLoading, mutate: vehiclesDetailMutate } = useVehiclesDetailData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<UpdateVehicleDto, typeof UpdateVehicleSchema>({
		apiData: vehicleData,
		schema: UpdateVehicleSchema,
	});

	//
	// C. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleAction({
		fetchFn: async () => await fetchApiData<Vehicle>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.operation.VEHICLES_DETAIL(vehicleId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			vehiclesDetailMutate(response);
			vehiclesListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleAction({
		fetchFn: async () => await fetchApiData<Vehicle>({ method: 'DELETE', url: API_ROUTES.operation.VEHICLES_DETAIL(vehicleId) }),
		onSuccess: () => {
			vehiclesListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.operation.VEHICLES_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleAction({
		fetchFn: async () => await fetchApiData<Vehicle>({ method: 'GET', url: API_ROUTES.operation.VEHICLES_DETAIL_LOCK(vehicleId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			vehiclesDetailMutate(response);
			vehiclesListMutate();
		},
	});

	//
	// D. Setup flags

	const hasDeletePermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: PermissionCatalog.all.vehicles.actions.delete,
			scope: PermissionCatalog.all.vehicles.scope,
		});
	}, [meData?.permissions]);

	const hasUpdatePermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: PermissionCatalog.all.vehicles.actions.update,
			scope: PermissionCatalog.all.vehicles.scope,
		});
	}, [meData?.permissions]);

	const hasLockPermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: PermissionCatalog.all.vehicles.actions.lock,
			scope: PermissionCatalog.all.vehicles.scope,
		});
	}, [meData?.permissions]);

	const { deleteEnabled, editEnabled, lockEnabled, updateEnabled } = useStandardFormCapabilities({
		delete: {
			hasPermission: hasDeletePermission,
			isDeleting,
		},
		form: {
			isDirty,
			isValid,
		},
		loading: {
			isLoading: vehicleDataLoading,
		},
		locked: {
			hasPermission: hasLockPermission,
			isLocked: vehicleData?.is_locked ?? false,
			isLocking,
		},
		update: {
			hasPermission: hasUpdatePermission,
			isUpdating,
		},
	});

	//
	// E. Return state

	const stateValue: StandardFormContextValue<UpdateVehicleDto> = useMemo(() => ({
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
			isLoading: vehicleDataLoading,
			isLocked: vehicleData?.is_locked,
			isLocking,
			isUpdating,
		},
		unblock,
	}), [deleteEnabled, editEnabled, form, handleDelete, handleLock, handleUpdate, isDeleting, isDirty, isLocking, isUpdating, isValid, lockEnabled, unblock, updateEnabled, vehicleData?.is_locked, vehicleDataLoading]);

	return (
		<VehiclesDetailFormContext.Provider value={stateValue}>
			{children}
		</VehiclesDetailFormContext.Provider>
	);
}
