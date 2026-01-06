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

/* ============================================================
 * Context Types
 * ============================================================ */

interface VehicleImportContextState {
	actions: {
		createVehicle: () => Promise<void>
		setImportFile: (file: File | null) => Promise<void>
	}
	data: {
		form: UseFormReturnType<CreateVehicleDto>
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

export const VehicleImportContext
	= createContext<undefined | VehicleImportContextState>(undefined);

export function useVehicleImportContext() {
	const context = useContext(VehicleImportContext);
	if (!context) {
		throw new Error(
			'useVehicleImportContext must be used within a VehicleImportContextProvider',
		);
	}
	return context;
}

/* ============================================================
 * Provider
 * ============================================================ */

export const VehicleImportContextProvider = ({
	children,
}: PropsWithChildren) => {
	/* ------------------------------------------------------------
	 * A. Setup Variables
	 * ------------------------------------------------------------ */

	const [isError, setIsError] = useState<Error | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isloading, setIsloading] = useState(false);
	const [canCreateorUpdate, setCanCreateorUpdate] = useState(false);

	// Vehicles loaded from TXT (not persisted yet)
	const [importedVehicles, setImportedVehicles] = useState<CreateVehicleDto[]>([]);

	// Vehicles already existing in database
	const [existingVehicles, setExistingVehicles] = useState<Vehicle[]>([]);

	/* ------------------------------------------------------------
	 * B. External hooks
	 * ------------------------------------------------------------ */

	const { mutate: allVehiclesMutate } = useSWR<Vehicle[]>(
		API_ROUTES.fleet.VEHICLES_LIST,
	);

	const { form } = useTypicalForm<CreateVehicleDto>(CreateVehicleSchema);

	/* ============================================================
	 * C. Helper parsing functions
	 * ============================================================ */

	/** Converts "1" → true, anything else → false */
	const parseBoolean = (value?: string): boolean => value === '1';

	/** Parses numeric fields safely */
	const parseNumber = (value?: string, fieldName?: string): number => {
		if (!value) return 0;
		const num = Number(value);
		if (Number.isNaN(num)) {
			throw new Error(`Invalid number for ${fieldName}: ${value}`);
		}
		return num;
	};

	/** Maps numeric GTFS enums to backend string enums */
	const parseMappedEnum = (
		value: string | undefined,
		map: Record<string, string>,
		fieldName: string,
	): string => {
		if (!value) {
			throw new Error(`Missing enum value for ${fieldName}`);
		}

		const mapped = map[value];
		if (!mapped) {
			throw new Error(`Invalid enum value for ${fieldName}: ${value}`);
		}

		return mapped;
	};

	/**
	 * Wheelchair accessibility logic
	 *
	 * wheelchair = 0 → no accessibility
	 * wheelchair = 1 → depends on ramp value
	 *
	 * ramp:
	 * 0 = no
	 * 1 = manual ramp
	 * 2 = electric ramp
	 * 3 = not applicable
	 */
	const parseWheelchairAccessibility = (
		wheelchair?: string,
		ramp?: string,
	): string => {
		// No wheelchair preparation
		if (wheelchair === '0') {
			return 'no';
		}

		switch (ramp) {
			case '1':
				return 'manual_ramp';
			case '2':
				return 'electric_ramp';
			case '0':
			case '3':
			default:
				return 'no';
		}
	};

	/* ============================================================
	 * D. TXT parsing
	 * ============================================================ */

	const parseTxtFile = async (file: File): Promise<CreateVehicleDto[]> => {
		const text = await file.text();
		const lines = text.split('\n').filter(Boolean);

		const headers = lines[0].split(';').map(h => h.trim());

		return lines.slice(1).map((line, lineIndex) => {
			const values = line.split(';');

			// Build raw object from header/value pairs
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
					capacity_standing: parseNumber(
						raw.available_standing,
						'capacity_standing',
					),
					contactless: parseBoolean(raw.new_seminew),
					emission_class: parseMappedEnum(
						raw.emission,
						EMISSION_MAP,
						'emission_class',
					),
					is_locked: false,
					license_plate: raw.license_plate.replace(/-/g, ''),
					make: raw.make,
					model: raw.model,
					owner: raw.owner,
					passenger_counting: parseBoolean(raw.passenger_counting),
					propulsion: parseMappedEnum(
						raw.propulsion,
						PROPULSION_MAP,
						'propulsion',
					),
					registration_date: raw.registration_date,
					wheelchair_acessible: parseWheelchairAccessibility(
						raw.wheelchair,
						raw.ramp,
					),
				};
			}
			catch (error) {
				throw new Error(
					`Error parsing line ${lineIndex + 2}: ${(error as Error).message}`,
				);
			}
		});
	};

	/* ============================================================
	 * E. Create or Update logic
	 * ============================================================ */

	const createOrUpdateVehicle = async (
		vehicle: CreateVehicleDto,
		existing: Vehicle[],
	) => {
		const exists = existing.find(v => v._id === vehicle._id);

		// CREATE
		if (!exists) {
			return fetchData(API_ROUTES.fleet.VEHICLES_LIST, 'POST', vehicle);
		}

		// UPDATE
		return fetchData(
			API_ROUTES.fleet.VEHICLES_DETAIL(vehicle._id),
			'PUT',
			vehicle,
		);
	};

	/* ============================================================
	 * F. File import (NO DB interaction)
	 * ============================================================ */

	const handleSetImportFile = async (file: File | null) => {
		if (!file) return;

		setIsError(null);
		setIsloading(true);

		try {
			const vehiclesFromFile = await parseTxtFile(file);

			// Validate all vehicles before allowing persistence
			for (const vehicle of vehiclesFromFile) {
				const result = CreateVehicleSchema.safeParse(vehicle);
				if (!result.success) {
					throw new Error(`Validation error for vehicle ${vehicle._id}`);
				}
			}

			setImportedVehicles(vehiclesFromFile);
			form.setValues(vehiclesFromFile[0]);

			useToast.success({
				message: `${vehiclesFromFile.length} vehicles loaded`,
				title: 'File imported',
			});

			setCanCreateorUpdate(true);
		}
		catch (error) {
			useToast.error({
				message: (error as Error).message,
				title: 'Import error',
			});
			setIsError(error as Error);
		}
		finally {
			setIsloading(false);
		}
	};

	/* ============================================================
	 * G. Persist data (CREATE / UPDATE)
	 * ============================================================ */

	const handleCreateOrUpdateAll = async () => {
		setIsSaving(true);
		setIsError(null);

		try {
			for (const vehicle of importedVehicles) {
				await createOrUpdateVehicle(vehicle, existingVehicles);
			}

			allVehiclesMutate();

			useToast.success({
				message: 'Vehicles created / updated successfully',
				title: 'Success',
			});

			setImportedVehicles([]);
			setExistingVehicles([]);
			setCanCreateorUpdate(false);

			closeImportVehicleModal();
		}
		catch (error) {
			useToast.error({
				message: (error as Error).message,
				title: 'Save error',
			});
			setIsError(error as Error);
		}
		finally {
			setIsSaving(false);
		}
	};

	/* ============================================================
	 * H. Context value
	 * ============================================================ */

	const contextValue: VehicleImportContextState = useMemo(
		() => ({
			actions: {
				createVehicle: handleCreateOrUpdateAll,
				setImportFile: handleSetImportFile,
			},
			data: {
				form,
			},
			flags: {
				canCreateorUpdate,
				error: isError,
				isloading,
				isSaving,
			},
		}),
		[form, isError, isSaving, isloading, canCreateorUpdate],
	);

	/* ============================================================
	 * I. Render components
	 * ============================================================ */

	return (
		<VehicleImportContext.Provider value={contextValue}>
			{children}
		</VehicleImportContext.Provider>
	);
};
