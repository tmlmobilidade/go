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
	return {
		// Description should be the agency code and the ID
		description: `[${agency.code}] [${agency._id}]`,
		// Keywords should be the ID, code, short name and name of the agency
		keywords: [agency._id, agency.code, agency.short_name, agency.name].filter(Boolean).join(' '),
		// Label should be the agency name
		label: agency.name,
		// Value should be the agency ID
		value: agency._id,
	};
}
