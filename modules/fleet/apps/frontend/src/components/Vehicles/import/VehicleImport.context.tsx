import { closeImportVehicleModal } from '@/components/Vehicles/import/VehicleImport.modal';
import { EMISSION_MAP, PROPULSION_MAP } from '@/lib/vehicleEnum';
import { API_ROUTES } from '@tmlmobilidade/consts';
import {
	type CreateVehicleDto,
	CreateVehicleSchema,
	type Vehicle,
} from '@tmlmobilidade/types';
import {
	type UseFormReturnType,
	useToast,
	useTypicalForm,
} from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import {
	createContext,
	PropsWithChildren,
	useContext,
	useMemo,
	useState,
} from 'react';
import useSWR from 'swr';

//
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

	// -----------------------------
	// Helper functions
	// -----------------------------
	const parseBoolean = (value?: string): boolean => value === '1';
	const parseNumber = (value?: string, fieldName?: string): number => {
		if (!value) return 0;
		const num = Number(value);
		if (Number.isNaN(num)) throw new Error(`Invalid number for ${fieldName}: ${value}`);
		return num;
	};

	//

	const parseMappedEnum = (value: string | undefined, map: Record<string, string>, fieldName: string): string => {
		if (!value) throw new Error(`Missing enum value for ${fieldName}`);
		const mapped = map[value];
		if (!mapped) throw new Error(`Invalid enum value for ${fieldName}: ${value}`);
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
			default: return 'no';
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
					_id: raw.vehicle_id || undefined,
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
					registration_date: raw.registration_date,
					wheelchair_acessible: parseWheelchairAccessibility(raw.wheelchair, raw.ramp),
				};
			}
			catch (error) {
				throw new Error(`Error parsing line ${lineIndex + 2}: ${(error as Error).message}`);
			}
		});
	};

	// -----------------------------
	// API: Create or Update
	// -----------------------------
	const createOrUpdateVehicle = async (vehicle: CreateVehicleDto, existing: Vehicle[]) => {
		const exists = existing.find(v => v._id === vehicle._id);
		if (!exists) return fetchData(API_ROUTES.fleet.VEHICLES_LIST, 'POST', vehicle);
		return fetchData(API_ROUTES.fleet.VEHICLES_DETAIL(vehicle._id), 'PUT', vehicle);
	};

	// -----------------------------
	// Handle file import (PREVIEW, ignore unchanged)
	// -----------------------------
	const handleSetImportFile = async (file: File | null) => {
		if (!file) return;
		setIsError(null);
		setIsloading(true);

		try {
			const vehiclesFromFile = await parseTxtFile(file);

			// Fetch existing vehicles
			const existingResponse = await fetchData<Vehicle[]>(API_ROUTES.fleet.VEHICLES_LIST, 'GET');
			if (!existingResponse.data) throw new Error('Failed to fetch existing vehicles');
			setExistingVehicles(existingResponse.data);

			const preview: VehicleImportPreview[] = [];
			let createCounter = 0;
			let updateCounter = 0;

			for (const vehicle of vehiclesFromFile) {
				const result = CreateVehicleSchema.safeParse(vehicle);
				if (!result.success) throw new Error(`Validation error for vehicle ${vehicle._id}`);

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
						updateCounter++;
						preview.push({ changes, mode: 'UPDATE', vehicle });
					}
				// Else: vehicle exists AND no changes → ignore completely
				}
			}

			setImportedVehicles(vehiclesFromFile);
			setImportPreview(preview);
			setCreatedCount(createCounter);
			setUpdatedCount(updateCounter);

			if (vehiclesFromFile.length > 0) form.setValues(vehiclesFromFile[0]);
			if (createCounter === 0 && updateCounter === 0) throw new Error('No vehicles to create or update');

			useToast.success({
				message: `${createCounter} to create · ${updateCounter} to update`,
				title: 'File imported',
			});

			setCanCreateorUpdate(preview.length > 0);
		}
		catch (error) {
			useToast.error({ message: (error as Error).message, title: 'Import error' });
			setIsError(error as Error);
		}
		finally {
			setIsloading(false);
		}
	};

	// -----------------------------
	// Persist CREATE / UPDATE
	// -----------------------------
	const handleCreateOrUpdateAll = async () => {
		setIsSaving(true);
		setIsError(null);

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
			useToast.error({ message: (error as Error).message, title: 'Save error' });
			setIsError(error as Error);
		}
		finally {
			setIsSaving(false);
		}
	};

	console.log('import', importPreview);

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
