import { EMISSION_MAP, PROPULSION_MAP } from '@/lib/vehicleEnum';
import { CreateVehicleDto } from '@tmlmobilidade/types';

import { formatValidationDate } from './formatValidationDate';
import { parseBoolean } from './parseBoolean';
import { parseMappedEnum } from './parseMappedEnum';
import { parseNumber } from './parseNumber';
import { parseWheelchairAccessibility } from './parseWheelChairAceessibility';

export const parseVehicleLine = (raw: Record<string, string>): CreateVehicleDto => ({
	_id: raw.vehicle_id,
	agency_id: raw.agency_id,
	bikes_allowed: parseBoolean(raw.bicycles),
	capacity_seated: parseNumber(raw.available_seats, 'capacity_seated'),
	capacity_standing: parseNumber(raw.available_standing, 'capacity_standing'),
	contactless: parseBoolean(raw.new_seminew),
	created_by: raw.created_by,
	emission_class: parseMappedEnum(raw.emission, EMISSION_MAP, 'emission_class') || EMISSION_MAP[0],
	is_locked: false,
	license_plate: raw.license_plate?.replace(/-/g, '').toUpperCase(),
	make: raw.make,
	model: raw.model,
	owner: raw.owner,
	passenger_counting: parseBoolean(raw.passenger_counting) || false,
	propulsion: parseMappedEnum(raw.propulsion, PROPULSION_MAP, 'propulsion'),
	registration_date: formatValidationDate(raw.registration_date),
	wheelchair_acessible: parseWheelchairAccessibility(raw.wheelchair, raw.ramp),
});
