import { z } from 'zod';

import { type LocationItem } from '../location/index.js';

/* * */

export const LocationGroupDefinitionSchema = z.object({
	abbreviation: z.string().min(1),
	id: z.string().min(1),
	members: z.array(z.object({ admin_level: z.string(), code: z.string().min(1) })).min(1),
	name: z.string().min(1),
	parent_osm_id: z.number().int().positive(),
});

export type LocationGroupDefinition = z.infer<typeof LocationGroupDefinitionSchema>;
export type LocationGroupsOption = boolean | string[];

/** Geographic groups are data, independent of any module or picker implementation. */
export const LOCATION_GROUPS: LocationGroupDefinition[] = [LocationGroupDefinitionSchema.parse({
	abbreviation: 'AML',
	id: 'aml',
	members: ['1105', '1106', '1107', '1109', '1110', '1111', '1114', '1115', '1116', '1502', '1503', '1504', '1506', '1507', '1508', '1510', '1511', '1512'].map(code => ({ admin_level: '7', code })),
	name: 'Área Metropolitana de Lisboa',
	parent_osm_id: 295480,
})];

export function getLocationGroupDefinitions(groups: LocationGroupsOption = false): LocationGroupDefinition[] {
	return groups === true ? LOCATION_GROUPS : Array.isArray(groups) ? LOCATION_GROUPS.filter(group => groups.includes(group.id)) : [];
}

/** Resolve a complete group against canonical locations; partial groups never collapse. */
export function resolveLocationGroups(locations: LocationItem[], definitions: LocationGroupDefinition[]) {
	const byCode = new Map(locations.map(location => [`${location.admin_level}:${location.code}`, location]));
	return definitions.flatMap((definition) => {
		const members = definition.members.flatMap((member) => {
			const location = byCode.get(`${member.admin_level}:${member.code}`);
			return location ? [location] : [];
		});
		return members.length === definition.members.length ? [{ ...definition, locations: members }] : [];
	});
}

/** Shared summary for tags, search and other read-only location displays. */
export function summarizeLocations(locations: LocationItem[], groups: LocationGroupsOption = false) {
	const used = new Set<number>();
	const summaries: { key: string, label: string, locations: LocationItem[], name: string }[] = [];
	const resolved = resolveLocationGroups(locations, getLocationGroupDefinitions(groups)).sort((a, b) => b.locations.length - a.locations.length);
	for (const group of resolved) {
		if (group.locations.some(location => used.has(location.osm_id))) continue;
		group.locations.forEach(location => used.add(location.osm_id));
		summaries.push({ key: group.id, label: group.abbreviation, locations: group.locations, name: group.name });
	}
	for (const location of locations) {
		if (used.has(location.osm_id)) continue;
		used.add(location.osm_id);
		summaries.push({ key: String(location.osm_id), label: location.name, locations: [location], name: location.name });
	}
	return summaries;
}
