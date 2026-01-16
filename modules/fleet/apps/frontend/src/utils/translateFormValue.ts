import { Translations } from '@/lib/translations';
import { useAgenciesContext } from '@tmlmobilidade/ui';

import { formatDate } from './formatDate';

/* * */

export function translateFormValue(field: string, value: unknown): string {
	if (value === undefined || value === null) return '-';

	const AgenciesContext = useAgenciesContext();

	const stringValue = String(value);

	switch (field) {
		// Agency
		case 'agency_id':
			return AgenciesContext.data.raw.find(agency => agency._id === stringValue)?.name ?? '-';

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
