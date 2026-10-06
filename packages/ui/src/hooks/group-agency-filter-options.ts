import { type AgencyOrganization } from '@tmlmobilidade/go-types-core';

import { type SelectDataItem } from '../components/inputs/Select';

/* * */

/**
 * Sorts agencies by name rather than the ID or code in their display label.
 */
export function sortAgencyFilterOptions(options: SelectDataItem[]): SelectDataItem[] {
	return [...options].sort((a, b) => (a.sortLabel ?? a.label).localeCompare(b.sortLabel ?? b.label, 'pt', { numeric: true, sensitivity: 'base' }));
}

/* * */

/**
 * Groups only the supplied agency options, preserving their permission scope.
 * An agency can appear in multiple organizations with the same selection value.
 */
export function groupAgencyFilterOptions(options: SelectDataItem[], organizations: AgencyOrganization[], unassignedLabel: string): SelectDataItem[] {
	const compare = (a: string, b: string) => a.localeCompare(b, 'pt', { numeric: true, sensitivity: 'base' });
	const sortedOptions = sortAgencyFilterOptions(options);
	const assignedIds = new Set<string>();
	const result: SelectDataItem[] = [];

	for (const organization of [...organizations].sort((a, b) => compare(a.long_name, b.long_name) || compare(a._id, b._id))) {
		const agencyIds = new Set(organization.agency_ids);
		for (const option of sortedOptions) {
			if (!agencyIds.has(option.value)) continue;
			assignedIds.add(option.value);
			result.push({ ...option, group: `${organization.long_name} (${organization.short_name})` });
		}
	}

	for (const option of sortedOptions) {
		if (!assignedIds.has(option.value)) result.push({ ...option, group: unassignedLabel });
	}

	return result;
}
