import { closeImportVehicleModal } from '@/components/Vehicles/import/VehicleImport.modal';
import { VehicleImportPreview } from '@/types/preview';
import { parseTxtFile } from '@/utils/parseTxtFile';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type CreateVehicleDto, CreateVehicleSchema, PermissionCatalog, type Vehicle } from '@tmlmobilidade/types';
import { useAgenciesContext, type UseFormReturnType, useMeContext, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData, unauthenticatedSwrFetcher } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface VehicleImportContextState {
	actions: {
		createVehicle: () => Promise<void>
		setImportFile: (file: File | null) => Promise<void>
	}
	data: {
		counters: {
			created: number
			updated: number
		}
		form: UseFormReturnType<CreateVehicleDto>
		importPreview: VehicleImportPreview[]
	}
	flags: {
		error: Error | null
		isloading: boolean
		isSaving: boolean
	}
}

/* * */

export const VehicleImportContext = createContext<undefined | VehicleImportContextState>(undefined);

export function useVehicleImportContext() {
	const context = useContext(VehicleImportContext);
	if (!context)
		throw new Error('useVehicleImportContext must be used within VehicleImportContextProvider');
	return context;
}

const getVehicleAgencyHistory = (vehicle: CreateVehicleDto | Vehicle): CreateVehicleDto['agency_history'] => {
	if ((vehicle.agency_history ?? []).length > 0) {
		return vehicle.agency_history;
	}

	return [
		{
			agency_id: vehicle.agency_id,
			start_date: vehicle.start_date,
			vehicle_id: vehicle.vehicle_id,
		},
	];
};

const mergeVehicleAgencyHistory = (existing: Vehicle, incoming: CreateVehicleDto): CreateVehicleDto['agency_history'] => {
	const mergedHistory = [...getVehicleAgencyHistory(existing)];

	for (const incomingHistoryItem of getVehicleAgencyHistory(incoming)) {
		const alreadyExists = mergedHistory.some(existingHistoryItem => (
			existingHistoryItem.agency_id === incomingHistoryItem.agency_id
			&& existingHistoryItem.vehicle_id === incomingHistoryItem.vehicle_id
		));

		if (!alreadyExists) {
			mergedHistory.push(incomingHistoryItem);
		}
	}

	return mergedHistory;
};

const isSameImportValue = (a: unknown, b: unknown) => {
	if (Array.isArray(a) || Array.isArray(b)) {
		return JSON.stringify(a) === JSON.stringify(b);
	}

	return a === b;
};

/* * */

export const VehicleImportContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const [isError, setIsError] = useState<Error | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isloading, setIsloading] = useState(false);

	const [importPreview, setImportPreview] = useState<VehicleImportPreview[]>([]);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [existingVehicles, setExistingVehicles] = useState<Vehicle[]>([]);
	const [createdCount, setCreatedCount] = useState(0);
	const [updatedCount, setUpdatedCount] = useState(0);

	const { mutate: allVehiclesMutate } = useSWR<Vehicle[]>(API_ROUTES.fleet.VEHICLES_LIST);

	const { form } = useTypicalForm<CreateVehicleDto>(CreateVehicleSchema);
	const agencies = useAgenciesContext();
	const meContext = useMeContext();

	//
	// B. Fetch data

	const hasUpdatePermission = useCallback((agencyId: string) => meContext.actions.hasPermissionResource({
		action: PermissionCatalog.all.vehicles.actions.update,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.vehicles.scope,
		value: agencyId,
	}), [meContext.actions]);

	//
	// c. Handle actions

	const diffVehicle = useCallback((existing: Vehicle, incoming: CreateVehicleDto) => {
		const changes: VehicleImportPreview['changes'] = {};
		for (const key of Object.keys(incoming) as (keyof CreateVehicleDto)[]) {
			if (!isSameImportValue(incoming[key], existing[key])) {
				changes[key] = {
					newValue: incoming[key],
					oldValue: existing[key],
				};
			}
		}
		return Object.keys(changes).length ? changes : undefined;
	}, []);

	//

	const handleSetImportFile = useCallback(async (file: File | null) => {
		if (!file) {
			setIsError(new Error('Invalid or empty file'));
			return;
		}

		setIsloading(true);
		setIsError(null);

		try {
			const vehiclesFromFile = await parseTxtFile(file);
			const existingVehiclesData = await unauthenticatedSwrFetcher<Vehicle[]>(API_ROUTES.fleet.VEHICLES_LIST);
			if (!Array.isArray(existingVehiclesData)) {
				throw new Error('Invalid vehicles response');
			}

			if (vehiclesFromFile.length === 0) {
				setIsError(new Error('Invalid or empty file'));
			}

			const preview: VehicleImportPreview[] = [];
			let createCounter = 0;
			let updateCounter = 0;

			for (const vehicle of vehiclesFromFile) {
				// Agency exists
				if (!agencies.data.raw.some(v => v._id === vehicle.agency_id)) {
					setIsError(new Error(`Invalid agency for vehicle ${vehicle._id}`));
				}

				const existing = existingVehiclesData.find(v => v._id === vehicle._id);

				if (!existing) {
					// CREATE permission
					if (!hasUpdatePermission(vehicle.agency_id)) {
						setIsError(new Error(`No permission to create vehicle for agency ${vehicle.agency_id}`));
					}

					createCounter++;
					preview.push({ mode: 'CREATE', vehicle });
					continue;
				}

				if (!hasUpdatePermission(vehicle.agency_id)) {
					setIsError(new Error(`No permission to update vehicle ${vehicle._id}`));
				}

				if (existing.is_locked) {
					setIsError(new Error(`vehicle ${vehicle._id} is locked to change`));
				}

				const vehicleWithAgencyHistory = {
					...vehicle,
					agency_history: mergeVehicleAgencyHistory(existing, vehicle),
				};

				const changes = diffVehicle(existing, vehicleWithAgencyHistory);
				if (changes) {
					updateCounter++;
					preview.push({
						changes,
						mode: 'UPDATE',
						vehicle: vehicleWithAgencyHistory,
					});
				}
			}

			setImportPreview(preview);
			setCreatedCount(createCounter);
			setUpdatedCount(updateCounter);
			setExistingVehicles(existingVehiclesData);

			if (createCounter === 0 && updateCounter === 0) setIsError(new Error(`Don't have vehicles to create or update in your file`));

			useToast.success({
				message: `${createCounter} to create · ${updateCounter} to update`,
				title: 'File imported',
			});
		} catch (err) {
			setIsError(err as Error);
		} finally {
			setIsloading(false);
		}
	}, [agencies.data.raw, diffVehicle, hasUpdatePermission]);

	//

	const handleCreateOrUpdateAll = useCallback(async () => {
		setIsSaving(true);
		setIsError(null);

		try {
			const vehiclesToCreate = importPreview
				.filter(item => item.mode === 'CREATE')
				.map(item => item.vehicle);

			const vehiclesToUpdate = importPreview
				.filter(item => item.mode === 'UPDATE')
				.map(item => item.vehicle);

			if (vehiclesToCreate.length > 0) {
				const response = await fetchData<Vehicle[]>(API_ROUTES.fleet.VEHICLES_LIST, 'POST', vehiclesToCreate);
				if (response.error) {
					setIsError(new Error(response.error));
					return;
				}
				allVehiclesMutate();
				useToast.success({
					message: `${vehiclesToCreate.length} created`,
					title: 'Success',
				});
			}

			if (vehiclesToUpdate.length > 0) {
				const vehicleIds = vehiclesToUpdate.map(vehicle => vehicle._id).join(',');
				const response = await fetchData<Vehicle[]>(API_ROUTES.fleet.VEHICLES_DETAIL(vehicleIds), 'PUT', vehiclesToUpdate);
				if (response.error) {
					setIsError(new Error(response.error));
					return;
				}
				allVehiclesMutate();
				useToast.success({
					message: `${vehiclesToUpdate.length} updated`,
					title: 'Success',
				});
			}

			allVehiclesMutate();

			useToast.success({
				message: `${createdCount} created · ${updatedCount} updated`,
				title: 'Success',
			});

			closeImportVehicleModal();
		} catch (err) {
			setIsError(err as Error);
		} finally {
			setIsSaving(false);
		}
	}, [allVehiclesMutate, createdCount, importPreview, updatedCount]);

	//
	// D. Define context value

	const contextValue = useMemo(
		() => ({
			actions: {
				createVehicle: handleCreateOrUpdateAll,
				setImportFile: handleSetImportFile,
			},
			data: {
				counters: {
					created: createdCount,
					updated: updatedCount,
				},
				form,
				importPreview,
			},
			flags: {
				error: isError,
				isloading,
				isSaving,
			},
		}),
		[
			createdCount,
			updatedCount,
			form,
			importPreview,
			isError,
			isloading,
			isSaving,
			handleCreateOrUpdateAll,
			handleSetImportFile,
		],
	);

	//
	// E. Render components

	return (
		<VehicleImportContext.Provider value={contextValue}>
			{children}
		</VehicleImportContext.Provider>
	);
};
