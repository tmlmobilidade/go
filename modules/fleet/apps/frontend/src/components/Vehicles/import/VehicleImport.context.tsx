import { closeCreateVehicleModal } from '@/components/Vehicles/create/VehicleCreate.modal';
import { EMISSION_MAP, PROPULSION_MAP } from '@/lib/vehicleEnum';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateVehicleDto, CreateVehicleSchema, type Vehicle } from '@tmlmobilidade/types';
import { keepUrlParams, type UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

//

interface VehicleImportContextState {
	actions: {
		createVehicle: () => Promise<void>
		setImportFile: (file: File | null) => Promise<void>
	}
	data: {
		form: UseFormReturnType<CreateVehicleDto>
	}
	flags: {
		error: Error | null
		isloading: boolean
		isSaving: boolean
	}
}

//

export const VehicleImportContext = createContext<undefined | VehicleImportContextState>(undefined);

export function useVehicleImportContext() {
	const context = useContext(VehicleImportContext);
	if (!context) {
		throw new Error('useVehicleImportContext must be used within a VehicleImportContextProvider');
	}
	return context;
}

//

export const VehicleImportContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const [isError, setIsError] = useState<Error | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isloading, setIsloading] = useState(false);

	//

	const { mutate: allVehiclesMutate } = useSWR<Vehicle[]>(API_ROUTES.fleet.VEHICLES_LIST);

	//

	const { form } = useTypicalForm<CreateVehicleDto>(CreateVehicleSchema);

	//

	// -----------------------------
	// Funções auxiliares
	// -----------------------------

	//

	const parseBoolean = (value?: string): boolean => value === '1';

	//

	const parseNumber = (value?: string, fieldName?: string): number => {
		if (!value) return 0;
		const num = Number(value);
		if (Number.isNaN(num)) throw new Error(`Invalid number for ${fieldName}: ${value}`);
		return num;
	};

	//

	const parseMappedEnum = (
		value: string | undefined,
		map: Record<string, string>,
		fieldName: string,
	): string => {
		if (!value) throw new Error(`Missing enum value for ${fieldName}`);

		const mapped = map[value];

		if (!mapped) {
			throw new Error(`Invalid enum value for ${fieldName}: ${value}`);
		}

		return mapped;
	};

	//

	const parseWheelchairAccessibility = (
		wheelchair?: string,
		ramp?: string,
	): string => {
	// Sem preparação wheelchair
		if (wheelchair === '0') {
			return 'no';
		}

		// Com preparação wheelchair → depende da rampa
		switch (ramp) {
			case '0':
				return 'no';
			case '1':
				return 'manual_ramp';
			case '2':
				return 'electric_ramp';
			case '3':
				return 'not application';
			default:
				return 'no';
		}
	};

	//

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
					_id: raw.vehicle_id ?? undefined,
					agency_id: raw.agency_id,
					bikes_allowed: parseBoolean(raw.bicycles),
					capacity_seated: parseNumber(raw.available_seats, 'capacity_seated'),
					capacity_standing: parseNumber(raw.available_standing, 'capacity_standing'),
					contactless: parseBoolean(raw.new_seminew),
					emission_class: parseMappedEnum(raw.emission, EMISSION_MAP,	'emission_class'),
					is_locked: false,
					license_plate: raw.license_plate.replace(/-/g, ''),
					make: raw.make,
					model: raw.model,
					owner: raw.owner,
					passenger_counting: parseBoolean(raw.passenger_counting),
					propulsion: parseMappedEnum(raw.propulsion, PROPULSION_MAP,	'propulsion'),
					registration_date: raw.registration_date,
					wheelchair_acessible: parseWheelchairAccessibility(raw.wheelchair, 'wheelchair_acessible'),
				};
			}
			catch (error) {
				throw new Error(`Error parsing line ${lineIndex + 2}: ${(error as Error).message}`);
			}
		});
	};

	// -----------------------------
	// Criação ou atualização de veículo
	// -----------------------------
	const createOrUpdateVehicle = async (vehicle: CreateVehicleDto, existingVehicles: Vehicle[]) => {
		const existing = existingVehicles.find(v => v._id === vehicle._id);

		if (!existing) {
			// CREATE
			return fetchData<Vehicle>(API_ROUTES.fleet.VEHICLES_LIST, 'POST', vehicle);
		}

		// UPDATE se houver alterações
		const hasChanges = Object.keys(vehicle).some(
			key => vehicle[key as keyof CreateVehicleDto] !== existing[key as keyof Vehicle],
		);

		if (!hasChanges) return null;

		return fetchData<Vehicle>(API_ROUTES.fleet.VEHICLES_DETAIL(vehicle._id), 'PUT', vehicle);
	};

	// -----------------------------
	// Handle import file
	// -----------------------------
	const handleSetImportFile = async (file: File | null) => {
		if (!file) return;

		setIsError(null);
		setIsloading(true);

		try {
			const vehiclesFromFile = await parseTxtFile(file);
			console.log('Parsed vehicles:', vehiclesFromFile);

			const existingVehiclesResponse = await fetchData<Vehicle[]>(API_ROUTES.fleet.VEHICLES_LIST, 'GET');

			if (existingVehiclesResponse.error || !existingVehiclesResponse.data) {
				throw new Error('Error fetching existing vehicles');
			}

			for (const vehicle of vehiclesFromFile) {
				await createOrUpdateVehicle(vehicle, existingVehiclesResponse.data);
			}

			allVehiclesMutate();

			useToast.success({ message: 'Import completed successfully', title: 'Success' });
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
	// Create vehicle manually
	// -----------------------------
	const handleCreateVehicle = async () => {
		setIsError(null);
		setIsSaving(true);
		setIsloading(true);

		const response = await fetchData<Vehicle>(API_ROUTES.fleet.VEHICLES_LIST, 'POST', form.getValues());

		if (response.error) {
			useToast.error({ message: typeof response.error === 'string' ? response.error : 'Validation error', title: 'Error creating vehicle' });
			setIsError(new Error(String(response.error)));
			setIsSaving(false);
			setIsloading(false);
			return;
		}

		form.reset();
		allVehiclesMutate();
		setIsSaving(false);
		setIsloading(false);
		closeCreateVehicleModal();

		useToast.success({ message: 'Vehicle created successfully', title: 'Success' });

		if (response.data?._id) {
			router.push(keepUrlParams(PAGE_ROUTES.fleet.VEHICLES_DETAIL(response.data._id)));
		}
	};

	// -----------------------------
	// Context value
	// -----------------------------
	const contextValue: VehicleImportContextState = useMemo(() => ({
		actions: {
			createVehicle: handleCreateVehicle,
			setImportFile: handleSetImportFile,
		},
		data: { form },
		flags: { error: isError, isloading, isSaving },
	}), [form, isError, isSaving, isloading]);

	return (
		<VehicleImportContext.Provider value={contextValue}>
			{children}
		</VehicleImportContext.Provider>
	);
};
