import { Translations } from '@/lib/translations';

import { formatDate } from './formatDate';

/* * */

interface TranslateFormAgency {
	_id: string
	name: string
}

export function translateFormValue(field: string, value: unknown, agencies: TranslateFormAgency[] = []): string {
	if (value === undefined || value === null) return '-';

	const stringValue = String(value);

	switch (field) {
		// Agency
		case 'agency_id':
			return agencies.find(agency => agency._id === stringValue)?.name ?? '-';

		// Boolean fields
		case 'bicycles':
		case 'climatization':
		case 'consumption_meter':
		case 'contactless':
		case 'corridor':
		case 'external_sound':
		case 'folding_system':
		case 'front_display':
		case 'internal_sound':
		case 'kneeling':
		case 'lowered_floor':
		case 'onboard_monitor':
		case 'passenger_counting':
		case 'ramp':
		case 'rear_display':
		case 'side_display':
		case 'static_information':
		case 'wheelchair':
			return (
				Translations.BOOLEANS[
					stringValue === 'true' ? 'yes' : 'no'
				] ?? stringValue
			);

		// Emission class
		case 'emission':
			return (
				Translations.EMISSION[
					stringValue as keyof typeof Translations.EMISSION
				] ?? stringValue
			);

		// Propulsion
		case 'propulsion':
			return (
				Translations.PROPUNSIONAL[
					stringValue as keyof typeof Translations.PROPUNSIONAL
				] ?? stringValue
			);

		// Date fields
		case 'registration_date':
		case 'start_date':
			return formatDate(stringValue);
		// Typology
		case 'typology':
			return (
				Translations.TYPOLOGY[
					stringValue as keyof typeof Translations.TYPOLOGY
				] ?? stringValue
			);

		default:
			return stringValue;
	}
}
