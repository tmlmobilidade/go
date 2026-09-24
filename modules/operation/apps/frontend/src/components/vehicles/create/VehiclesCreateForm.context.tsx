'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateVehicleDto, CreateVehicleSchema, type Vehicle } from '@tmlmobilidade/go-types-operation';
import { hasPermission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useVehiclesListData } from '../list/use-vehicles-list-data';
import { closeVehiclesCreateModal } from './VehiclesCreate.modal';

/* * */

const VehiclesCreateFormContext = createContext<StandardFormContextValue<CreateVehicleDto> | undefined>(undefined);

export function useVehiclesCreateFormContext() {
	const context = useContext(VehiclesCreateFormContext);
	if (!context) throw new Error('useVehiclesCreateFormContext must be used within a VehiclesCreateFormContextProvider');
	return context;
}

/* * */

export function VehiclesCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: meData } = useMeData();

	const { mutate } = useVehiclesListData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<CreateVehicleDto, typeof CreateVehicleSchema>({
		schema: CreateVehicleSchema,
	});

	//
	// C. Handle actions

	const { action: handleCreate, isLoading: isCreating } = useHandleAction({
		fetchFn: async () => await fetchApiData<Vehicle>({ body: form.getValues(), method: 'POST', url: API_ROUTES.operation.VEHICLES_CREATE }),
		onSuccess: ({ data }) => {
			closeVehiclesCreateModal();
			form.reset();
			unblock();
			mutate();
			if (!data?._id) return;
			router.push(keepUrlParams(PAGE_ROUTES.operation.VEHICLES_DETAIL(data._id)));
		},
	});

	//
	// D. Setup flags

	const hasCreatePermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: PermissionCatalog.all.vehicles.actions.create,
			scope: PermissionCatalog.all.vehicles.scope,
		});
	}, [meData?.permissions]);

	const { createEnabled, editEnabled } = useStandardFormCapabilities({
		create: {
			hasPermission: hasCreatePermission,
			isCreating,
		},
		form: {
			isDirty,
			isValid,
		},
	});

	//
	// E. Return context value

	const stateValue: StandardFormContextValue<CreateVehicleDto> = useMemo(() => ({
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
		<VehiclesCreateFormContext.Provider value={stateValue}>
			{children}
		</VehiclesCreateFormContext.Provider>
	);
}
