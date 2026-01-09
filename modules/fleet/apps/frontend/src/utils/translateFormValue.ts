import { useAgenciesContext } from '@/contexts/Agencies.context';
import { Translations } from '@/lib/translations';

import { formatDate } from './formatDate';

/* * */

/**
 * Translate values based on field key
 */
export function translateFormValue(field: string, value: unknown): string {
	if (value === undefined || value === null) return '-';

	const AgenciesContex = useAgenciesContext();

	const stringValue = String(value);

	switch (field) {
		// Agency
		case 'agency_id':
			return AgenciesContex.action.labelAgency(stringValue);

		// Boolean fields
		case 'bikes_allowed':
		case 'contactless':
		case 'passenger_counting':
			return (
				Translations.BOOLEANS[
					stringValue === 'true' ? 'yes' : 'no'
				] ?? stringValue
			);

		// Emission class
		case 'emission_class':
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
			return formatDate(stringValue);

		// Wheelchair accessibility
		case 'wheelchair_acessible':
			return (
				Translations.WHEELCHAIR[
					stringValue as keyof typeof Translations.WHEELCHAIR
				] ?? stringValue
			);

		default:
			return stringValue;
	}
}
