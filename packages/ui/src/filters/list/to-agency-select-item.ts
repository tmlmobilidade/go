/* * */

interface AgencyOptionSource {
	_id: string
	code?: string
	name?: string
	short_name?: string
}

interface AgencySelectItem {
	description?: string
	keywords?: string
	label: string
	value: string
}

/**
 * Agency option shared by every picker.
 * The name is the label; references without a name fall back to their ID.
 * Codes and IDs appear in the detail and all agency identifiers stay searchable.
 */
export function toAgencySelectItem(agency: AgencyOptionSource): AgencySelectItem {
	const label = agency.name || agency._id;
	const identifiers = [agency.code, agency._id].filter(Boolean);
	const description = agency.code || label !== agency._id
		? identifiers.map(identifier => `[${identifier}]`).join(' ')
		: undefined;

	return {
		// Description includes the available agency code and ID.
		description,
		// Keywords include the ID, code, short name and name.
		keywords: [agency._id, agency.code, agency.short_name, agency.name].filter(Boolean).join(' '),
		// References without a name remain identifiable by ID.
		label,
		// The selected value remains the agency ID.
		value: agency._id,
	};
}
