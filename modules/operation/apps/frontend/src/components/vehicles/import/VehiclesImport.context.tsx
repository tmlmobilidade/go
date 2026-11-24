'use client';

import { closeVehiclesImportModal } from '@/components/vehicles/import/VehiclesImport.modal';
import { type VehicleImportPreview } from '@/types/preview';
import { getVehicleImportPreview } from '@/utils/get-vehicle-import-preview';
import { parseTxtFile } from '@/utils/parseTxtFile';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type VehiclesListItem } from '@tmlmobilidade/go-operation-pckg-types';
import { type Vehicle } from '@tmlmobilidade/go-types-operation';
import { hasPermissionResource, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, useAgenciesData, useHandleAction, useMeData } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import { useVehiclesListData } from '../list/use-vehicles-list-data';

/* * */

interface VehiclesImportContextState {
	actions: {
		saveVehicles: () => Promise<void>
		setImportFile: (file: File | null) => Promise<void>
	}
	data: {
		counters: {
			created: number
		}
		importPreview: VehicleImportPreview[]
	}
	flags: {
		error: Error | null
		isLoading: boolean
		isSaving: boolean
	}
}

/* * */

const VehiclesImportContext = createContext<undefined | VehiclesImportContextState>(undefined);

export function useVehiclesImportContext() {
	const context = useContext(VehiclesImportContext);
	if (!context) throw new Error('useVehiclesImportContext must be used within VehiclesImportContextProvider');
	return context;
}

/* * */

export function VehiclesImportContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const [error, setError] = useState<Error | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [importPreview, setImportPreview] = useState<VehicleImportPreview[]>([]);

	const { data: meData } = useMeData();
	const { data: agenciesData, error: agenciesError, isLoading: agenciesLoading } = useAgenciesData();
	const { mutate: vehiclesListMutate } = useVehiclesListData();

	//
	// B. Handle actions

	const canCreateAgency = useCallback((agencyId: string) => {
		return hasPermissionResource(meData?.permissions ?? [], {
			requiredPermission: {
				action: PermissionCatalog.all.vehicles.actions.create,
				scope: PermissionCatalog.all.vehicles.scope,
			},
			requiredValue: agencyId,
			resourceKey: 'agency_ids',
		});
	}, [meData?.permissions]);

	const handleSetImportFile = useCallback(async (file: File | null) => {
		setImportPreview([]);
		setError(null);

		if (!file) {
			setError(new Error('Invalid or empty file'));
			return;
		}

		setIsLoading(true);

		try {
			if (agenciesLoading) throw new Error('Agencies are still loading. Try again shortly.');
			if (agenciesError) throw new Error(agenciesError);

			const vehiclesFromFile = await parseTxtFile(file);
			if (vehiclesFromFile.length === 0) throw new Error('Invalid or empty file');

			const existingResponse = await fetchApiData<VehiclesListItem[]>({
				body: { agency_ids: agenciesData?.map(agency => agency._id) ?? [] },
				method: 'POST',
				url: API_ROUTES.operation.VEHICLES_LIST,
			});

			if (existingResponse.error) throw new Error(existingResponse.error);
			if (!existingResponse.data) throw new Error('Unable to check existing vehicles');

			const preview = getVehicleImportPreview(vehiclesFromFile, existingResponse.data);
			const vehiclesToCreate = preview.filter(item => item.mode === 'CREATE');

			for (const { vehicle } of vehiclesToCreate) {
				for (const flag of vehicle.flags) {
					flag.agency_ids = flag.agency_ids.map((agencyCode) => {
						const agency = agenciesData.find(agency => agency.code === agencyCode);
						if (!agency) throw new Error(`Invalid agency ${agencyCode} for vehicle ${vehicle._id}`);
						if (!canCreateAgency(agency._id)) throw new Error(`No permission to create vehicles for agency ${agencyCode}`);
						return agency._id;
					});
				}
			}

			setImportPreview(preview);
		} catch (err) {
			setError(err as Error);
		} finally {
			setIsLoading(false);
		}
	}, [agenciesData, agenciesError, agenciesLoading, canCreateAgency]);

	const { action: handleSaveAll, isLoading: isSaving } = useHandleAction<Vehicle[]>({
		fetchFn: async () => {
			setError(null);

			const vehicles = importPreview.filter(item => item.mode === 'CREATE').map(item => item.vehicle);
			if (vehicles.length === 0) throw new Error('No new vehicles to create in this file');

			return fetchApiData<Vehicle[]>({
				body: vehicles,
				method: 'POST',
				url: API_ROUTES.operation.VEHICLES_CREATE,
			});
		},
		labels: {
			success_message: `${importPreview.filter(item => item.mode === 'CREATE').length} vehicles created`,
		},
		onError: setError,
		onSuccess: () => {
			vehiclesListMutate();
			closeVehiclesImportModal();
		},
	});

	//
	// C. Define context value

	const contextValue = useMemo((): VehiclesImportContextState => ({
		actions: {
			saveVehicles: handleSaveAll,
			setImportFile: handleSetImportFile,
		},
		data: {
			counters: {
				created: importPreview.filter(item => item.mode === 'CREATE').length,
			},
			importPreview,
		},
		flags: {
			error,
			isLoading,
			isSaving,
		},
	}), [error, handleSaveAll, handleSetImportFile, importPreview, isLoading, isSaving]);

	//
	// D. Render components

	return (
		<VehiclesImportContext.Provider value={contextValue}>
			{children}
		</VehiclesImportContext.Provider>
	);
}
