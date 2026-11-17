import { type VehicleImportPreview } from '@/types/preview';
import { type VehiclesListItem } from '@tmlmobilidade/go-operation-pckg-types';
import { type CreateVehicleDto } from '@tmlmobilidade/go-types-operation';

/* * */

export function getVehicleImportPreview(incoming: CreateVehicleDto[], existing: VehiclesListItem[]): VehicleImportPreview[] {
	//

	//
	// A. Index existing vehicle identifiers

	const existingCodes = new Set(existing.map(vehicle => vehicle._id));
	const existingIds = new Set(existing.flatMap(vehicle => vehicle.flags?.map(flag => flag.vehicle_id) ?? []));

	for (const vehicle of existing) {
		if ('vehicle_code' in vehicle && typeof vehicle.vehicle_code === 'string') {
			existingCodes.add(vehicle.vehicle_code);
		}
	}

	//
	// B. Classify new, existing and repeated rows

	const importedCodes = new Set<string>();
	const importedIds = new Set<string>();

	return incoming.map((vehicle) => {
		let mode: VehicleImportPreview['mode'] = 'CREATE';

		if (existingCodes.has(vehicle._id) || vehicle.flags.some(flag => existingIds.has(flag.vehicle_id))) {
			mode = 'EXISTS';
		} else if (importedCodes.has(vehicle._id) || vehicle.flags.some(flag => importedIds.has(flag.vehicle_id))) {
			mode = 'DUPLICATE';
		}

		importedCodes.add(vehicle._id);
		for (const flag of vehicle.flags) importedIds.add(flag.vehicle_id);

		return { mode, vehicle };
	});
}
