import { closeImportVehicleModal } from '@/components/Vehicles/import/VehicleImport.modal';
import { Translations } from '@/lib/translations';
import { EMISSION_MAP, PROPULSION_MAP } from '@/lib/vehicleEnum';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type CreateVehicleDto, CreateVehicleSchema, PermissionCatalog, type Vehicle } from '@tmlmobilidade/types';
import { type UseFormReturnType, useMeContext, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

//

import { useAgenciesContext } from '@/contexts/Agencies.context';

//

// Types

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
		canCreateorUpdate: boolean
		error: Error | null
		isloading: boolean
		isSaving: boolean
	}
}

/* ============================================================
 * Context Setup
 * ============================================================ */

export const VehicleImportContext = createContext<undefined | VehicleImportContextState>(undefined);

export function useVehicleImportContext() {
	const context = useContext(VehicleImportContext);
	if (!context) throw new Error('useVehicleImportContext must be used within a VehicleImportContextProvider');
	return context;
}

/* ============================================================
 * Provider
 * ============================================================ */

export const VehicleImportContextProvider = ({ children }: PropsWithChildren) => {
	const [isError, setIsError] = useState<Error | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isloading, setIsloading] = useState(false);
	const [canCreateorUpdate, setCanCreateorUpdate] = useState(false);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [importedVehicles, setImportedVehicles] = useState<CreateVehicleDto[]>([]);
	const [importPreview, setImportPreview] = useState<VehicleImportPreview[]>([]);
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

	const parseBoolean = (value?: string): boolean => value === '1';
	const parseNumber = (value?: string, fieldName?: string): number => {
		if (!value) return 0;
		const num = Number(value);
		if (Number.isNaN(num)) setIsError(new Error(`Invalid number for ${fieldName}: ${value}`));
		return num;
	};

	//

	const parseMappedEnum = (value: string | undefined, map: Record<string, string>, fieldName: string): string => {
		if (!value) setIsError(new Error(`Missing enum value for ${Translations[fieldName]}`));
		const mapped = map[value];
		if (!mapped) setIsError(new Error(`Invalid enum value for ${Translations[fieldName]}: ${value}`));
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

	//

	const diffVehicle = (existing: Vehicle, incoming: CreateVehicleDto) => {
		const changes: VehicleImportPreview['changes'] = {};
		for (const key of Object.keys(incoming) as (keyof CreateVehicleDto)[]) {
			if (incoming[key] !== existing[key]) {
				changes[key] = { newValue: incoming[key], oldValue: existing[key] };
			}
		}
		return Object.keys(changes).length > 0 ? changes : undefined;
	};

	// -----------------------------
	// Parse TXT file
	// -----------------------------
	const parseTxtFile = async (file: File): Promise<CreateVehicleDto[]> => {
		const text = await file.text();
		const lines = text.split('\n').filter(Boolean);
		const headers = lines[0].split(';').map(h => h.trim());
		return lines.slice(1).map((line, lineIndex) => {
			const values = line.split(';');
			const raw = headers.reduce((obj, header, index) => {
				obj[header] = values[index]?.trim() ?? '';
				return obj;
			}, {} as Record<string, string>);

			try {
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
				setIsError(new Error(`Error parsing line ${lineIndex + 2}: ${(error as Error).message}`));
				setCanCreateorUpdate(false);
			}
		});
	};

	// -----------------------------
	// API: Create or Update
	// -----------------------------
	const createOrUpdateVehicle = async (vehicle: CreateVehicleDto, existing: Vehicle[]) => {
		const exists = existing.find(v => v._id === vehicle._id || v.license_plate === vehicle.license_plate);
		if (!exists) return fetchData(API_ROUTES.fleet.VEHICLES_LIST, 'POST', vehicle);
		return fetchData(API_ROUTES.fleet.VEHICLES_DETAIL(vehicle._id), 'PUT', vehicle);
	};

	// -----------------------------
	// Handle file import (PREVIEW, ignore unchanged)
	// -----------------------------
	const handleSetImportFile = async (file: File | null) => {
		if (!file) setIsError(new Error('Invalid or Empty file'));
		setIsloading(true);

		const vehiclesFromFile = await parseTxtFile(file);

		if (vehiclesFromFile.length === 0) {
			setIsError(new Error('Invalid or Empty file'));
			setCanCreateorUpdate(false);
			setIsloading(false);
			return;
		}

		// Fetch existing vehicles
		const existingResponse = await fetchData<Vehicle[]>(API_ROUTES.fleet.VEHICLES_LIST, 'GET');
		if (!existingResponse.data) setIsError(new Error('Failed to fetch existing vehicles'));
		setExistingVehicles(existingResponse.data);

		const preview: VehicleImportPreview[] = [];

		setCanCreateorUpdate(true);

		let createCounter = 0;
		let updateCounter = 0;

		for (const vehicle of vehiclesFromFile) {
			if (!agencies.data.raw.some(v => v._id === vehicle.agency_id)) {
				setCanCreateorUpdate(false);
				setIsError(new Error(`vehicle ID ${vehicle._id} have not a valid agency`));
			};

			const result = CreateVehicleSchema.safeParse(vehicle);
			if (!result.success) setIsError(new Error(`Validation error for vehicle ID ${vehicle._id}`));

			const existing = existingResponse.data.find(v => v._id === vehicle._id);

			if (!existing) {
				// Vehicle does not exist → CREATE
				createCounter++;
				preview.push({ mode: 'CREATE', vehicle });
			}
			else {
				// Vehicle exists → check for actual changes
				const changes = diffVehicle(existing, vehicle);
				if (changes) {
					if (!vehicle.is_locked) {
						updateCounter++;
						preview.push({ changes, mode: 'UPDATE', vehicle });
					}
					else {
						setIsError(new Error(`Vehicle ID ${vehicle._id} is locked to changes`));
						setCanCreateorUpdate(false);
					}
				}
				// Else: vehicle exists AND no changes → ignore completely
			}
		}

		setImportedVehicles(vehiclesFromFile);
		setImportPreview(preview);
		setCreatedCount(createCounter);
		setUpdatedCount(updateCounter);
		setIsloading(false);

		if (vehiclesFromFile.length > 0) form.setValues(vehiclesFromFile[0]);
		else setIsError(new Error('Invalid or Empty file'));

		if (createCounter === 0 && updateCounter === 0) {
			setCanCreateorUpdate(false);
			setIsError(new Error('No vehicles to create or update'));
		};

		if (updateCounter > 0) {
			const hasPermission = meContext.actions.hasPermissionResource({
				action: PermissionCatalog.all.vehicles.actions.update,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.vehicles.scope,
				value: meContext.data.user.organization_id,
			});

			if (!hasPermission) {
				setCanCreateorUpdate(false);
				setIsError(new Error(`You don't have permission to update vehicles`));

				console.log(meContext.data.user.organization_id);
				console.log(agencies);
			}
		}

		useToast.success({
			message: `${createCounter} to create · ${updateCounter} to update`,
			title: 'File imported',
		});
	};

	// -----------------------------
	// Persist CREATE / UPDATE
	// -----------------------------
	const handleCreateOrUpdateAll = async () => {
		setIsSaving(true);

		let created = 0;
		let updated = 0;

		try {
			for (const item of importPreview) {
				await createOrUpdateVehicle(item.vehicle, existingVehicles);
				if (item.mode === 'CREATE') created++;
				if (item.mode === 'UPDATE') updated++;
			}

			allVehiclesMutate();

			useToast.success({
				message: `${created} created · ${updated} updated`,
				title: 'Success',
			});

			setImportedVehicles([]);
			setImportPreview([]);
			setExistingVehicles([]);
			setCreatedCount(0);
			setUpdatedCount(0);
			setCanCreateorUpdate(false);

			closeImportVehicleModal();
		}
		catch (error) {
			setIsError(error as Error);
			setCanCreateorUpdate(false);
		}
		finally {
			setIsSaving(false);
		}
	};

	//

	//
	// Flags

	// -----------------------------
	// Context value
	// -----------------------------
	const contextValue: VehicleImportContextState = useMemo(
		() => ({
			actions: { createVehicle: handleCreateOrUpdateAll, setImportFile: handleSetImportFile },
			data: {
				counters: { created: createdCount, updated: updatedCount },
				form,
				importPreview,
			},
			flags: { canCreateorUpdate, error: isError, isloading, isSaving },
		}),
		[form, importPreview, createdCount, updatedCount, isError, isSaving, isloading, canCreateorUpdate],
	);

	// -----------------------------
	// Render
	// -----------------------------
	return (
		<VehicleImportContext.Provider value={contextValue}>
			{children}
		</VehicleImportContext.Provider>
	);
};
