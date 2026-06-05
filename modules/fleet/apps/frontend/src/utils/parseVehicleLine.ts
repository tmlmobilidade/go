import { CreateVehicleDto, type OperationalDate, validateOperationalDate } from '@tmlmobilidade/types';

import { formatValidationDate } from './formatValidationDate';
import { parseBoolean } from './parseBoolean';
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

const parseNullableCode = <T extends string>(
	value: string | undefined,
	allowedValues: readonly T[],
	fieldName: string,
): null | T => {
	if (!value) {
		return null;
	}

	const normalizedValue = value.trim();
	if (!allowedValues.includes(normalizedValue as T)) {
		throw new Error(`Invalid enum value for ${fieldName}: ${value}`);
	}

	return normalizedValue as T;
};

export const parseVehicleLine = (raw: Record<string, string>): CreateVehicleDto => {
	if (!raw.license_plate) {
		throw new Error('Missing license_plate');
	}

	const licensePlate = raw.license_plate.replace(/-/g, '').toUpperCase();
	const agencyId = raw.agency_id;
	const agencyVehicleId = raw.vehicle_id?.trim();
	if (!raw.agency_id || !agencyVehicleId) {
		throw new Error('Missing agency_id or vehicle_id');
	}

	const startDate = parseRequiredDate(raw.start_date, 'start_date');

	return {
		_id: licensePlate,
		agency_history: [
			{
				agency_id: agencyId,
				start_date: startDate,
				vehicle_id: agencyVehicleId,
			},
		],
		agency_id: agencyId,
		available_seats: parseNullableNumber(raw.available_seats, 'available_seats'),
		available_standing: parseNullableNumber(raw.available_standing, 'available_standing'),
		bicycles: parseBoolean(raw.bicycles),
		climatization: parseBoolean(raw.climatization),
		consumption_meter: parseBoolean(raw.consumption_meter),
		contactless: parseBoolean(raw.contactless || raw.new_seminew),
		corridor: parseBoolean(raw.corridor),
		created_by: null,
		emission: parseNullableCode(raw.emission, ['1', '2', '3', '4', '5', '6'], 'emission'),
		external_sound: parseBoolean(raw.external_sound),
		folding_system: parseBoolean(raw.folding_system),
		front_display: parseBoolean(raw.front_display),
		internal_sound: parseBoolean(raw.internal_sound),
		is_locked: parseBoolean(raw.is_locked),
		kneeling: parseBoolean(raw.kneeling),
		license_plate: licensePlate,
		lowered_floor: parseBoolean(raw.lowered_floor),
		make: raw.make,
		model: raw.model,
		onboard_monitor: parseBoolean(raw.onboard_monitor),
		owner: raw.owner,
		passenger_counting: parseBoolean(raw.passenger_counting),
		propulsion: parseNullableCode(raw.propulsion, ['1', '2', '3', '4', '5', '6', '7', '8'], 'propulsion'),
		ramp: parseBoolean(raw.ramp),
		rear_display: parseBoolean(raw.rear_display),
		registration_date: parseRequiredDate(raw.registration_date, 'registration_date'),
		side_display: parseBoolean(raw.side_display),
		start_date: startDate,
		static_information: parseBoolean(raw.static_information),
		typology: parseNullableCode(raw.typology, ['1', '2', '3', '4', '5', '6'], 'typology'),
		vehicle_id: agencyVehicleId,
		wheelchair: parseBoolean(raw.wheelchair),
	};
};
