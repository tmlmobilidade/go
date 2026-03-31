import { EMISSION_MAP, PROPULSION_MAP, TYPOLOGY_MAP } from '@/lib/vehicleEnum';
import { CreateVehicleDto, type OperationalDate, validateOperationalDate } from '@tmlmobilidade/types';

import { formatValidationDate } from './formatValidationDate';
import { parseBoolean } from './parseBoolean';
import { parseMappedEnum } from './parseMappedEnum';
import { parseNumber } from './parseNumber';

const parseRequiredDate = (value: string | undefined, fieldName: string): OperationalDate => {
	const parsed = formatValidationDate(value);
	if (!parsed) {
		throw new Error(`Invalid date for ${fieldName}: ${value}`);
	}
	return validateOperationalDate(parsed);
};

const parseNullableNumber = (value: string | undefined, fieldName: string): null | number => {
	if (!value) {
		return null;
	}
	return parseNumber(value, fieldName);
};

const parseNullableMappedEnum = <T extends string>(
	value: string | undefined,
	map: Record<string, T>,
	fieldName: string,
): null | T => {
	if (!value) {
		return null;
	}
	return parseMappedEnum(value, map as Record<string, string>, fieldName) as T;
};

export const parseVehicleLine = (raw: Record<string, string>): CreateVehicleDto => {
	const vehicleId = `${raw.agency_id}-${raw.vehicle_id?.trim()}`;
	if (!vehicleId) {
		throw new Error('Missing vehicle_id');
	}

	return {
		_id: vehicleId,
		agency_id: raw.agency_id,
		available_seats: parseNullableNumber(raw.available_seats, 'available_seats'),
		available_standing: parseNullableNumber(raw.available_standing, 'available_standing'),
		bicycles: parseBoolean(raw.bicycles),
		climatization: parseBoolean(raw.climatization),
		consumption_meter: parseBoolean(raw.consumption_meter),
		contactless: parseBoolean(raw.new_seminew),
		corridor: parseBoolean(raw.corridor),
		created_by: null,
		emission: parseNullableMappedEnum(raw.emission, EMISSION_MAP, 'emission'),
		external_sound: parseBoolean(raw.external_sound),
		folding_system: parseBoolean(raw.folding_system),
		front_display: parseBoolean(raw.front_display),
		internal_sound: parseBoolean(raw.internal_sound),
		is_locked: false,
		kneeling: parseBoolean(raw.kneeling),
		license_plate: raw.license_plate?.replace(/-/g, '').toUpperCase(),
		lowered_floor: parseBoolean(raw.lowered_floor),
		make: raw.make,
		model: raw.model,
		onboard_monitor: parseBoolean(raw.onboard_monitor),
		owner: raw.owner,
		passenger_counting: parseBoolean(raw.passenger_counting),
		propulsion: parseNullableMappedEnum(raw.propulsion, PROPULSION_MAP, 'propulsion'),
		ramp: parseBoolean(raw.ramp),
		rear_display: parseBoolean(raw.rear_display),
		registration_date: parseRequiredDate(raw.registration_date, 'registration_date'),
		side_display: parseBoolean(raw.side_display),
		start_date: parseRequiredDate(raw.start_date, 'start_date'),
		static_information: parseBoolean(raw.static_information),
		typology: parseNullableMappedEnum(raw.typology, TYPOLOGY_MAP, 'typology'),
		vehicle_id: vehicleId,
		wheelchair: parseBoolean(raw.wheelchair),
	};
};
