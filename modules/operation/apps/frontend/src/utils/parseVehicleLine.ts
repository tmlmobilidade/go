import { type CreateVehicleDto, CreateVehicleSchema } from '@tmlmobilidade/go-types-operation';

/* * */

const parseRequiredNumber = (value: string | undefined): number => value?.trim() ? Number(value) : NaN;

/* * */

export const parseVehicleLine = (raw: Record<string, string>): CreateVehicleDto => {
	//

	//
	// A. Setup variables

	const vehicleId = raw.vehicle_id?.trim();
	const vehicleCode = raw.vehicle_code?.trim();
	const agencyId = raw.agency_id?.trim();

	if (!vehicleId) throw new Error('Missing vehicle_id');
	if (!vehicleCode) throw new Error('Missing vehicle_code');
	if (!agencyId) throw new Error('Missing agency_id');

	//

	return CreateVehicleSchema.parse({
		_id: vehicleCode,
		bicycles_capacity: parseRequiredNumber(raw.bicycles_capacity),
		car_capacity: raw.car_capacity ? Number(raw.car_capacity) : null,
		created_by: '',
		emission: raw.emission,
		flags: [{ agency_ids: [agencyId], vehicle_id: vehicleId }],
		is_locked: false,
		make: raw.make,
		model: raw.model,
		propulsion: raw.propulsion,
		registration_date: raw.registration_date,
		total_capacity: parseRequiredNumber(raw.total_capacity),
		vehicle_type: raw.vehicle_type,
		wheelchair_accessible: parseRequiredNumber(raw.wheelchair_accessible),
	});
};
