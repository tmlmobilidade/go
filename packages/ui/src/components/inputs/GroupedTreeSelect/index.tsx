'use client';

import { Pill } from '@mantine/core';
import { useMemo } from 'react';

import { TreeSelect, type TreeSelectDataItem, type TreeSelectProps } from '../TreeSelect';
import { expandTreeSelectGroups, type TreeSelectSelectionGroup } from './selection-groups';

export { expandTreeSelectGroups, type TreeSelectSelectionGroup } from './selection-groups';

/* * */

export interface GroupedTreeSelectProps extends Omit<TreeSelectProps<'checkbox'>, 'checkedStrategy' | 'checkStrictly' | 'defaultValue' | 'maxDisplayedValues' | 'maxValues' | 'mode' | 'onChange' | 'onRemove' | 'renderPill' | 'value'> {
	groups: TreeSelectSelectionGroup[]
	onChange: (value: string[]) => void
	value: string[]
}

/* * */

/** Adds reusable named selections while preserving the regular tree and canonical node IDs. */
export function GroupedTreeSelect({ data, groups, onChange, value, ...props }: GroupedTreeSelectProps) {
	//
	// A. Transform data

	const activeGroups = groups.filter(group => group.values.length > 0 && group.values.every(id => value.includes(id)));
	const groupedValues = [...value, ...activeGroups.map(group => group.value)];
	const hiddenMembers = new Set(activeGroups.flatMap(group => group.values));
	const options = useMemo(() => {
		const insertGroups = (nodes: TreeSelectDataItem[]): TreeSelectDataItem[] => nodes.map(node => ({
			...node,
			children: [
				...groups.filter(group => group.parentValue === node.value).map(group => ({ label: group.label, value: group.value })),
				...insertGroups(node.children ?? []),
			],
		}));
		return [
			...groups.filter(group => !group.parentValue).map(group => ({ label: group.label, value: group.value })),
			...insertGroups(data),
		];
	}, [data, groups]);

	//
	// B. Render components

	return (
		<TreeSelect
			{...props}
			checkedStrategy="all"
			data={options}
			mode="checkbox"
			onChange={next => onChange(expandTreeSelectGroups(next, value, groups))}
			value={groupedValues}
			renderPill={({ disabled, node, onRemove, readOnly, value: id }) => {
				if (hiddenMembers.has(id)) return null;
				const group = groups.find(group => group.value === id);
				return (
					<Pill disabled={disabled} onRemove={onRemove} withRemoveButton={!disabled && !readOnly}>
						{group?.selectionLabel ?? node.label}
					</Pill>
				);
			}}
			checkStrictly
		/>
	);
}
