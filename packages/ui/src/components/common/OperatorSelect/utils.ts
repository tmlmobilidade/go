/* * */

import { type TreeNodeData } from '@mantine/core';

import { DEFAULT_OPERATOR_SELECT_GROUPS } from './groups';
import { type OperatorSelectGroup, type OperatorSelectItem, type OperatorSelectTree } from './types';

/* * */

const DEFAULT_GROUP_LABELS = new Set(DEFAULT_OPERATOR_SELECT_GROUPS.map(group => group.label));

/* * */

export function getOperatorDisplayName(item: OperatorSelectItem, groupLabel?: string): string {
	const isDefaultGroup = item.public_name && DEFAULT_GROUP_LABELS.has(item.public_name);
	const sharedGroupLabel = groupLabel ?? (isDefaultGroup ? item.public_name : undefined);

	if (sharedGroupLabel && item.public_name === sharedGroupLabel) {
		return item.name || item.short_name || item.code || item.id;
	}

	return item.public_name || item.name || item.short_name || item.code || item.id;
}

/* * */

function matchesGroup(item: OperatorSelectItem, group: OperatorSelectGroup): boolean {
	if (group.ids?.includes(item.id)) return true;
	if (item.short_name && group.short_names?.includes(item.short_name)) return true;
	if (item.code && group.codes?.includes(item.code)) return true;
	if (item.public_name && group.public_names?.includes(item.public_name)) return true;
	return false;
}

/* * */

function memberSortIndex(item: OperatorSelectItem, group: OperatorSelectGroup): number {
	const shortNameIndex = item.short_name ? group.short_names?.indexOf(item.short_name) ?? -1 : -1;
	if (shortNameIndex >= 0) return shortNameIndex;

	const codeIndex = item.code ? group.codes?.indexOf(item.code) ?? -1 : -1;
	if (codeIndex >= 0) return codeIndex;

	const idIndex = group.ids?.indexOf(item.id) ?? -1;
	if (idIndex >= 0) return idIndex;

	return Number.MAX_SAFE_INTEGER;
}

/* * */

export function buildOperatorSelectTree(
	options: OperatorSelectItem[],
	groups: readonly OperatorSelectGroup[],
): OperatorSelectTree {
	const assignedIds = new Set<string>();
	const treeGroups = groups.flatMap((group) => {
		const members = options
			.filter(item => matchesGroup(item, group))
			.sort((a, b) => {
				const byGroupOrder = memberSortIndex(a, group) - memberSortIndex(b, group);
				if (byGroupOrder !== 0) return byGroupOrder;
				return getOperatorDisplayName(a, group.label).localeCompare(getOperatorDisplayName(b, group.label), 'pt-PT');
			});

		if (members.length === 0) return [];

		for (const member of members) assignedIds.add(member.id);

		return [{
			id: group.id,
			label: group.label,
			members,
		}];
	});

	const ungrouped = options
		.filter(item => !assignedIds.has(item.id))
		.sort((a, b) => getOperatorDisplayName(a).localeCompare(getOperatorDisplayName(b), 'pt-PT'));

	return { groups: treeGroups, ungrouped };
}

/* * */

export function buildOperatorTreeNodes(tree: OperatorSelectTree): TreeNodeData[] {
	return [
		...tree.groups.map(group => ({
			children: group.members.map(item => ({
				label: getOperatorDisplayName(item, group.label),
				value: item.id,
			})),
			label: group.label,
			value: group.id,
		})),
		...tree.ungrouped.map(item => ({
			label: getOperatorDisplayName(item),
			value: item.id,
		})),
	];
}

/* * */

export function filterLeafCheckedState(checkedState: string[], leafIds: readonly string[]): string[] {
	const leafSet = new Set(leafIds);
	return checkedState.filter(id => leafSet.has(id));
}
