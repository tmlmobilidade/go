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
 * The name is the label and the id is the detail. The code stays searchable.
 */
export function toAgencySelectItem(agency: AgencyOptionSource): AgencySelectItem {
	// Prefer agency short name if available
	const label = agency.short_name || agency.name;
	// Description should be the agency code and the ID
	const description = `[${agency.code}] [${agency._id}]`;
	// Keywords should be the ID, code, short name and name of the agency
	const keywords = [agency._id, agency.code, agency.short_name, agency.name].filter(Boolean).join(' ');
	// Return the item
	return {
		description,
		keywords,
		label,
		value: agency._id,
	};
}
