interface AgencyOptionSource {
	_id: string
	code?: string
	name?: string
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
	const label = agency.name || agency.code || agency._id;
	const description = label === agency._id ? undefined : `[${agency._id}]`;
	const keywords = agency.code && agency.code !== label && agency.code !== agency._id ? agency.code : undefined;
	return { description, label, value: agency._id, ...keywords && { keywords } };
}
