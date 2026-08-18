'use client';

/* * */

import { type RenderTreeNodePayload } from '@mantine/core';
import { IconChevronDown, IconUsers } from '@tabler/icons-react';
import { useMemo } from 'react';

import styles from './styles.module.css';

import { Checkbox } from '../../inputs/Checkbox';
import { Popover } from '../Popover';
import { getTreeExpandedState, Tree, useTree } from '../Tree';
import { DEFAULT_OPERATOR_SELECT_GROUPS } from './groups';
import { type OperatorSelectGroup, type OperatorSelectItem } from './types';
import { buildOperatorSelectTree, buildOperatorTreeNodes, filterLeafCheckedState, getOperatorDisplayName } from './utils';

/* * */

function renderCheckbox(checked: boolean, indeterminate = false) {
	return (
		<Checkbox
			aria-hidden="true"
			checked={checked}
			className={styles.checkbox}
			indeterminate={indeterminate}
			p={0}
			size="sm"
			tabIndex={-1}
			w={24}
			readOnly
		/>
	);
}

/* * */

export interface OperatorSelectProps {
	allLabel?: string
	allowEmpty?: boolean
	groups?: readonly OperatorSelectGroup[]
	hint?: string
	label: string
	onChange: (value: string[]) => void
	options: OperatorSelectItem[]
	selectedCountLabel?: (count: number) => string
	value: string[]
}

/* * */

export function OperatorSelect({
	allLabel = 'Todos',
	allowEmpty = false,
	groups = DEFAULT_OPERATOR_SELECT_GROUPS,
	hint,
	label,
	onChange,
	options,
	selectedCountLabel = count => `${count} selecionados`,
	value,
}: OperatorSelectProps) {
	//

	//
	// A. Transform data

	const allIds = options.map(item => item.id);
	const optionById = useMemo(() => new Map(options.map(item => [item.id, item])), [options]);
	const treeNodes = useMemo(
		() => buildOperatorTreeNodes(buildOperatorSelectTree(options, groups)),
		[groups, options],
	);
	const expandedState = useMemo(() => getTreeExpandedState(treeNodes, '*'), [treeNodes]);
	const allSelected = options.length > 0 && value.length === options.length;
	const partiallySelected = value.length > 0 && !allSelected;

	const valueLabel = allSelected
		? allLabel
		: value.length === 1
			? getOperatorDisplayName(optionById.get(value[0]) ?? { id: value[0] })
			: selectedCountLabel(value.length);

	//
	// B. Setup tree

	const tree = useTree({
		checkedState: value,
		expandedState,
		onCheckedStateChange: (checkedState) => {
			const next = filterLeafCheckedState(checkedState, allIds);
			if (next.length === 0 && !allowEmpty) return;
			onChange(next);
		},
	});

	//
	// C. Handle actions

	const handleSelectAllChange = () => {
		if (!allSelected) {
			onChange(allIds);
			return;
		}
		if (allowEmpty) onChange([]);
	};

	const renderTreeNode = ({ elementProps, hasChildren, level, node, tree: treeController }: RenderTreeNodePayload) => {
		const checked = treeController.isNodeChecked(node.value);
		const indeterminate = treeController.isNodeIndeterminate(node.value);
		const option = optionById.get(node.value);

		const toggleChecked = () => {
			if (checked) treeController.uncheckNode(node.value);
			else treeController.checkNode(node.value);
		};

		return (
			<div
				{...elementProps}
				className={`${elementProps.className} ${styles.option}`}
				data-checked={checked}
				data-group={hasChildren}
				data-level={level}
				onClick={(event) => {
					elementProps.onClick(event);
					toggleChecked();
				}}
			>
				{renderCheckbox(checked, indeterminate)}
				<span className={styles.optionLabel}>
					<span>{node.label}</span>
					{option && <span className={styles.optionId}>({option.id})</span>}
				</span>
			</div>
		);
	};

	//
	// D. Render components

	return (
		<Popover offset={6} position="bottom-start" shadow="md" width={320}>
			<Popover.Target>
				<button aria-label={`${label}: ${valueLabel}`} className={styles.trigger} type="button">
					<IconUsers aria-hidden="true" size={19} stroke={1.8} />
					<span>{label}</span>
					<strong>{valueLabel}</strong>
					<IconChevronDown aria-hidden="true" className={styles.chevron} size={16} />
				</button>
			</Popover.Target>

			<Popover.Dropdown className={styles.dropdown}>
				{hint && <p className={styles.hint}>{hint}</p>}
				<div className={styles.options}>
					<button
						aria-checked={partiallySelected ? 'mixed' : allSelected}
						className={styles.selectAll}
						onClick={handleSelectAllChange}
						role="checkbox"
						type="button"
					>
						{renderCheckbox(allSelected, partiallySelected)}
						<span>{allLabel}</span>
					</button>

					<Tree
						classNames={{ root: styles.treeRoot }}
						data={treeNodes}
						expandOnClick={false}
						levelOffset={18}
						renderNode={renderTreeNode}
						tree={tree}
						checkOnSpace
						withLines
					/>
				</div>
			</Popover.Dropdown>
		</Popover>
	);

	//
}

/* * */

export { DEFAULT_OPERATOR_SELECT_GROUPS } from './groups';
export type { OperatorSelectGroup, OperatorSelectItem, OperatorSelectTree, OperatorSelectTreeGroup } from './types';
export { buildOperatorSelectTree, buildOperatorTreeNodes, filterLeafCheckedState, getOperatorDisplayName } from './utils';
