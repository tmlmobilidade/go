import { type VehicleImportPreview } from '@/types/preview';
import { type VehiclesListItem } from '@tmlmobilidade/go-operation-pckg-types';
import { type CreateVehicleDto } from '@tmlmobilidade/go-types-operation';

/* * */

export function getVehicleImportPreview(incoming: CreateVehicleDto[], existing: VehiclesListItem[]): VehicleImportPreview[] {
	//

	//
	// A. Setup variables

	const vehicleCodes = new Set(existing.map(vehicle => vehicle._id));
	const vehicleIds = new Set(existing.flatMap(vehicle => vehicle.flags?.map(flag => flag.vehicle_id) ?? []));

	//
	// B. Process the existing vehicles to get the vehicle codes and ids

	for (const vehicle of existing) {
		if ('vehicle_code' in vehicle && typeof vehicle.vehicle_code === 'string') {
			vehicleCodes.add(vehicle.vehicle_code);
		}
	}

	//
	// C. Process the incoming vehicles

	const preview: VehicleImportPreview[] = [];

	for (const vehicle of incoming) {
		if (vehicleCodes.has(vehicle._id) || vehicle.flags.some(flag => vehicleIds.has(flag.vehicle_id))) continue;

		preview.push({ mode: 'CREATE', vehicle });
		vehicleCodes.add(vehicle._id);
		for (const flag of vehicle.flags) vehicleIds.add(flag.vehicle_id);
	}

	//
	// D. Return the preview

	return preview;
}
