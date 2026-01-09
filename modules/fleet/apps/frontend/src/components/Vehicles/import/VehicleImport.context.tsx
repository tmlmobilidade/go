import { closeImportVehicleModal } from '@/components/Vehicles/import/VehicleImport.modal';
import { useAgenciesContext } from '@/contexts/Agencies.context';
import { Translations } from '@/lib/translations';
import { EMISSION_MAP, PROPULSION_MAP } from '@/lib/vehicleEnum';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type CreateVehicleDto, CreateVehicleSchema, PermissionCatalog, type Vehicle } from '@tmlmobilidade/types';
import { type UseFormReturnType, useMeContext, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

// ============================================================
// Types
// ============================================================

interface VehicleImportPreview {
	changes?: Partial<Record<keyof CreateVehicleDto, { newValue: unknown, oldValue: unknown }>>
	mode: 'CREATE' | 'UPDATE'
	vehicle: CreateVehicleDto
}

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

// ============================================================
// Context
// ============================================================

export const VehicleImportContext = createContext<undefined | VehicleImportContextState>(undefined);

export function useVehicleImportContext() {
	const context = useContext(VehicleImportContext);
	if (!context)
		throw new Error('useVehicleImportContext must be used within VehicleImportContextProvider');
	return context;
}

// ============================================================
// Provider
// ============================================================

export const VehicleImportContextProvider = ({ children }: PropsWithChildren) => {
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

	// -----------------------------
	// Helper functions
	// -----------------------------

	const formatDate = (value: string): string => {
		if (!/^\d{8}$/.test(value)) return;

		if (value.length != 8) return;

		if (parseInt(value.slice(0, 4), 10) < 1990 || parseInt(value.slice(0, 4), 10) > 2026) return;
		if (parseInt(value.slice(4, 6), 10) < 1 || parseInt(value.slice(4, 6), 10) > 12) return;
		if (parseInt(value.slice(6, 8), 10) < 1 || parseInt(value.slice(6, 8), 10) > 31) return;

		return value;
	};

	//

	const diffVehicle = (existing: Vehicle, incoming: CreateVehicleDto) => {
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
	};

	//

	const hasUpdatePermission = (agencyId: string) =>
		meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.vehicles.actions.update,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.vehicles.scope,
			value: agencyId,
		});

	//

	const parseBoolean = (value?: string): boolean => value === '1';

	//

	const parseNumber = (value?: string, fieldName?: string): number => {
		const num = Number(value);
		if (Number.isNaN(num)) {
			setIsError(new Error(`Invalid number for ${fieldName}: ${value}`));
		}
		return num;
	};

	//

	const parseMappedEnum = (value: string | undefined, map: Record<string, string>, fieldName: string): string => {
		if (!value) {
			setIsError(new Error(`Missing enum value for ${Translations[fieldName]}`));
		}
		const mapped = map[value];
		if (!mapped) {
			setIsError(new Error(`Invalid enum value for ${Translations[fieldName]}: ${value}`));
		}
		return mapped;
	};

	//

	const parseWheelchairAccessibility = (wheelchair?: string, ramp?: string): string => {
		if (wheelchair === '0') return 'no';
		switch (ramp) {
			case '1': return 'manual_ramp';
			case '2': return 'electric_ramp';
			case '0':
			case '3':
			default: setIsError(new Error('Invalid wheelchair accessibility'));
				return;
		}
	};

	// ============================================================
	// Parse TXT
	// ============================================================

	const parseTxtFile = async (file: File): Promise<CreateVehicleDto[]> => {
		const text = await file.text();
		const lines = text.split('\n').filter(Boolean);
		const headers = lines[0].split(';').map(h => h.trim());

		return lines.slice(1).map((line, index) => {
			try {
				const values = line.split(';');
				const raw = headers.reduce((obj, header, i) => {
					obj[header] = values[i]?.trim() ?? '';
					return obj;
				}, {} as Record<string, string>);

				return {
					_id: raw.vehicle_id,
					agency_id: raw.agency_id,
					bikes_allowed: parseBoolean(raw.bicycles),
					capacity_seated: parseNumber(raw.available_seats, 'capacity_seated'),
					capacity_standing: parseNumber(raw.available_standing, 'capacity_standing'),
					contactless: parseBoolean(raw.new_seminew),
					emission_class: parseMappedEnum(raw.emission, EMISSION_MAP, 'emission_class'),
					is_locked: false,
					license_plate: raw.license_plate.replace(/-/g, '').toUpperCase(),
					make: raw.make,
					model: raw.model,
					owner: raw.owner,
					passenger_counting: parseBoolean(raw.passenger_counting),
					propulsion: parseMappedEnum(raw.propulsion, PROPULSION_MAP, 'propulsion'),
					registration_date: formatDate(raw.registration_date),
					wheelchair_acessible: parseWheelchairAccessibility(raw.wheelchair, raw.ramp),
				};
			}
			catch (error) {
				setIsError(new Error(`Error parsing line ${index + 2}: ${(error as Error).message}`));
			}
		});
	};

	// ============================================================
	// Import handler (PREVIEW)
	// ============================================================

	const handleSetImportFile = async (file: File | null) => {
		if (!file) {
			setIsError(new Error('Invalid or empty file'));
			return;
		}

		setIsloading(true);
		setIsError(null);

		try {
			const vehiclesFromFile = await parseTxtFile(file);
			const existingResponse = await fetchData<Vehicle[]>(API_ROUTES.fleet.VEHICLES_LIST, 'GET');

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

				const existing = existingResponse.data.find(v => v._id === vehicle._id);

				if (!existing) {
					// CREATE permission
					if (!hasUpdatePermission(vehicle.agency_id)) {
						setIsError(new Error(`No permission to create vehicle for agency ${vehicle.agency_id}`));
					}

					createCounter++;
					preview.push({ mode: 'CREATE', vehicle });
					continue;
				}

				// UPDATE validations
				if (existing.agency_id !== vehicle.agency_id) {
					setIsError(new Error(`Vehicle ${vehicle._id} belongs to another agency`));
				}

				if (!hasUpdatePermission(vehicle.agency_id)) {
					setIsError(new Error(`No permission to update vehicle ${vehicle._id}`));
				}

				if (existing.is_locked) {
					setIsError(new Error(`vehicle ${vehicle._id} is locked to change`));
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
			setExistingVehicles(existingResponse.data);

			if (createCounter === 0 && updateCounter === 0) setIsError(new Error(`Don't have vehicles to create or update in your file`));

			useToast.success({
				message: `${createCounter} to create · ${updateCounter} to update`,
				title: 'File imported',
			});
		}
		catch (err) {
			setIsError(err as Error);
		}
		finally {
			setIsloading(false);
		}
	};

	// ============================================================
	// Persist
	// ============================================================

	const handleCreateOrUpdateAll = async () => {
		setIsSaving(true);

		console.log(importPreview);

		try {
			for (const item of importPreview) {
				if (item.mode === 'CREATE') {
					await fetchData(
						API_ROUTES.fleet.VEHICLES_LIST,
						'POST',
						item.vehicle,
					);
				}
				else {
					await fetchData(
						API_ROUTES.fleet.VEHICLES_DETAIL(item.vehicle._id),
						'PUT',
						item,
					);
				}
			}

			allVehiclesMutate();

			useToast.success({
				message: `${createdCount} created · ${updatedCount} updated`,
				title: 'Success',
			});

			closeImportVehicleModal();
		}
		catch (err) {
			setIsError(err as Error);
		}
		finally {
			setIsSaving(false);
		}
	};

	// ============================================================
	// Context
	// ============================================================

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
			importPreview,
			createdCount,
			updatedCount,
			isError,
			isloading,
			isSaving,
			form,
		],
	);

	console.log(isError);

	return (
		<VehicleImportContext.Provider value={contextValue}>
			{children}
		</VehicleImportContext.Provider>
	);
};
