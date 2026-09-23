'use client';

import { closeVehiclesImportModal } from '@/components/vehicles/import/VehiclesImport.modal';
import { type VehicleImportPreview } from '@/types/preview';
import { parseTxtFile } from '@/utils/parseTxtFile';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type CreateVehicleDto, type Vehicle } from '@tmlmobilidade/go-types-operation';
import { hasPermissionResource, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, useMeData, useToast } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import { useVehiclesListData } from '../list/use-vehicles-list-data';
import { useVehiclesAgenciesData } from '../shared/use-vehicles-agencies-data';

/* * */

interface VehiclesImportContextState {
	actions: {
		createVehicle: () => Promise<void>
		setImportFile: (file: File | null) => Promise<void>
	}
	data: {
		counters: {
			created: number
			updated: number
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
	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [importPreview, setImportPreview] = useState<VehicleImportPreview[]>([]);
	const [createdCount, setCreatedCount] = useState(0);
	const [updatedCount, setUpdatedCount] = useState(0);

	const { data: meData } = useMeData();
	const { data: agenciesData } = useVehiclesAgenciesData();
	const { mutate: vehiclesListMutate } = useVehiclesListData();

	//
	// B. Handle actions

	const canUpdateAgency = useCallback((agencyId: string) => {
		return hasPermissionResource(meData?.permissions ?? [], {
			requiredPermission: {
				action: PermissionCatalog.all.vehicles.actions.update,
				scope: PermissionCatalog.all.vehicles.scope,
			},
			requiredValue: agencyId,
			resourceKey: 'agency_ids',
		});
	}, [meData?.permissions]);

	const diffVehicle = useCallback((existing: Vehicle, incoming: CreateVehicleDto) => {
		const changes: VehicleImportPreview['changes'] = {};
		for (const key of Object.keys(incoming) as (keyof CreateVehicleDto)[]) {
			if (incoming[key] !== existing[key]) {
				changes[key] = {
					newValue: incoming[key],
					oldValue: existing[key],
				};
			}
		}
		return Object.keys(changes).length ? changes : undefined;
	}, []);

	const handleSetImportFile = useCallback(async (file: File | null) => {
		if (!file) {
			setError(new Error('Invalid or empty file'));
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const vehiclesFromFile = await parseTxtFile(file);
			const existingResponse = await fetchApiData<Vehicle[]>({ method: 'GET', url: API_ROUTES.operation.VEHICLES_LIST });

			if (vehiclesFromFile.length === 0) {
				setError(new Error('Invalid or empty file'));
			}

			const preview: VehicleImportPreview[] = [];
			let createCounter = 0;
			let updateCounter = 0;

			for (const vehicle of vehiclesFromFile) {
				if (!agenciesData?.some(agency => agency._id === vehicle.agency_id)) {
					setError(new Error(`Invalid agency for vehicle ${vehicle._id}`));
				}

				const existing = existingResponse.data?.find(item => item._id === vehicle._id);

				if (!existing) {
					if (!canUpdateAgency(vehicle.agency_id)) {
						setError(new Error(`No permission to create vehicle for agency ${vehicle.agency_id}`));
					}

					createCounter++;
					preview.push({ mode: 'CREATE', vehicle });
					continue;
				}

				if (existing.agency_id !== vehicle.agency_id) {
					setError(new Error(`Vehicle ${vehicle._id} belongs to another agency`));
				}

				if (!canUpdateAgency(vehicle.agency_id)) {
					setError(new Error(`No permission to update vehicle ${vehicle._id}`));
				}

				if (existing.is_locked) {
					setError(new Error(`vehicle ${vehicle._id} is locked to change`));
				}

				const changes = diffVehicle(existing, vehicle);
				if (changes) {
					updateCounter++;
					preview.push({
						changes,
						mode: 'UPDATE',
						vehicle,
					});
				}
			}

			setImportPreview(preview);
			setCreatedCount(createCounter);
			setUpdatedCount(updateCounter);

			if (createCounter === 0 && updateCounter === 0) {
				setError(new Error(`Don't have vehicles to create or update in your file`));
			}

			useToast.success({
				message: `${createCounter} to create · ${updateCounter} to update`,
				title: 'File imported',
			});
		} catch (err) {
			setError(err as Error);
		} finally {
			setIsLoading(false);
		}
	}, [agenciesData, canUpdateAgency, diffVehicle]);

	const handleCreateOrUpdateAll = useCallback(async () => {
		setIsSaving(true);
		setError(null);

		try {
			const vehiclesToCreate = importPreview
				.filter(item => item.mode === 'CREATE')
				.map(item => item.vehicle);

			const vehiclesToUpdate = importPreview
				.filter(item => item.mode === 'UPDATE')
				.map(item => item.vehicle);

			if (vehiclesToCreate.length > 0) {
				const response = await fetchApiData<Vehicle[]>({ body: vehiclesToCreate, method: 'POST', url: API_ROUTES.operation.VEHICLES_LIST });
				if (response.error) {
					setError(new Error(response.error));
					return;
				}
				vehiclesListMutate();
				useToast.success({
					message: `${vehiclesToCreate.length} created`,
					title: 'Success',
				});
			}

			if (vehiclesToUpdate.length > 0) {
				const vehicleIds = vehiclesToUpdate.map(vehicle => vehicle._id).join(',');
				const response = await fetchApiData<Vehicle[]>({ body: vehiclesToUpdate, method: 'PUT', url: API_ROUTES.operation.VEHICLES_DETAIL(vehicleIds) });
				if (response.error) {
					setError(new Error(response.error));
					return;
				}
				vehiclesListMutate();
				useToast.success({
					message: `${vehiclesToUpdate.length} updated`,
					title: 'Success',
				});
			}

			vehiclesListMutate();

			useToast.success({
				message: `${createdCount} created · ${updatedCount} updated`,
				title: 'Success',
			});

			closeVehiclesImportModal();
		} catch (err) {
			setError(err as Error);
		} finally {
			setIsSaving(false);
		}
	}, [createdCount, importPreview, updatedCount, vehiclesListMutate]);

	//
	// C. Define context value

	const contextValue = useMemo((): VehiclesImportContextState => ({
		actions: {
			createVehicle: handleCreateOrUpdateAll,
			setImportFile: handleSetImportFile,
		},
		data: {
			counters: {
				created: createdCount,
				updated: updatedCount,
			},
			importPreview,
		},
		flags: {
			error,
			isLoading,
			isSaving,
		},
	}), [createdCount, error, handleCreateOrUpdateAll, handleSetImportFile, importPreview, isLoading, isSaving, updatedCount]);

	//
	// D. Render components

	return (
		<VehiclesImportContext.Provider value={contextValue}>
			{children}
		</VehiclesImportContext.Provider>
	);
}
