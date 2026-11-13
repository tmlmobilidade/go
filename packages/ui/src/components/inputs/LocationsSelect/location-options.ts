import { getLocationGroupDefinitions, type LocationGroupsOption, type LocationItem, type LocationTreeNode, resolveLocationGroups } from '@tmlmobilidade/go-types-locations';

import { type TreeSelectSelectionGroup } from '../GroupedTreeSelect';
import { type TreeSelectDataItem } from '../TreeSelect';

/* * */

/** Flat canonical locations used to resolve group membership and saved selections. */
export function flattenLocationTree(nodes: LocationTreeNode[]): LocationItem[] {
	return nodes.flatMap(node => [
		{ admin_level: node.admin_level, code: node.code, name: node.name, osm_id: Number(node.id) },
		...flattenLocationTree(node.children),
	]);
}

/** Preserve the hierarchy while showing each option's full administrative path. */
export function createLocationTreeOptions(nodes: LocationTreeNode[], ancestors: string[] = []): TreeSelectDataItem[] {
	return nodes.map((node) => {
		const path = [...ancestors, node.name];
		return {
			children: node.children.length ? createLocationTreeOptions(node.children, path) : undefined,
			label: path.join(' / '),
			value: node.id,
		};
	});
}

/** Only offer complete groups whose parent exists in the available hierarchy. */
export function createLocationSelectionGroups(locations: LocationItem[], groups: LocationGroupsOption): TreeSelectSelectionGroup[] {
	const availableIds = new Set(locations.map(location => location.osm_id));
	const definitions = getLocationGroupDefinitions(groups);
	const resolvedGroups = resolveLocationGroups(locations, definitions);

	return resolvedGroups
		.filter(group => availableIds.has(group.parent_osm_id))
		.map(group => ({
			label: `${group.abbreviation} — ${group.name}`,
			parentValue: String(group.parent_osm_id),
			selectionLabel: group.abbreviation,
			value: `__location_group_${group.id}__`,
			values: group.locations.map(location => String(location.osm_id)),
		}));
}
