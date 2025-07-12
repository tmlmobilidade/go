'use client';

/* * */

import { availablePermissions, useRoleDetailContext } from '@/contexts/RoleDetail.context';
import { IconCheck, IconChevronDown, IconChevronUp, IconX } from '@tabler/icons-react';
import { Collapsible, Section } from '@tmlmobilidade/ui';
import { Button, Checkbox, Grid, RenderTreeNodePayload, Tree, useTree } from '@tmlmobilidade/ui';
import { useEffect } from 'react';

import styles from './styles.module.css';

/* * */

export function RoleDetailPermissions() {
	//

	//
	// A. Setup variables

	const tree = useTree();
	const roleDetailContext = useRoleDetailContext();

	//
	// B. Transform data

	useEffect(() => {
		const permissions = roleDetailContext.data?.form.getValues().permissions ?? [];
		const initialCheckedState = permissions.map(permission => `${permission.scope}-${permission.action}`);
		tree.setCheckedState(initialCheckedState);
	}, [roleDetailContext.data?.form.getValues().permissions]);

	//
	// C. Render components

	return (
		<Collapsible
			description="As referências (Linhas, Paragens, Municípios, Etc...) afetadas deste alerta."
			title="Referências"
		>
			<Section gap="md">

				<Grid columns="abcd" gap="sm">
					<Button icon={<IconCheck />} label="Selecionar todos" onClick={() => roleDetailContext.actions.handlePermissionChange('*')} variant="secondary" />
					<Button icon={<IconX />} label="Desmarcar todos" onClick={() => roleDetailContext.actions.handlePermissionChange('!*')} variant="danger" />
					<Button icon={<IconChevronDown />} label="Expandir todos" onClick={() => tree.expandAllNodes()} variant="muted" />
					<Button icon={<IconChevronUp />} label="Colapsar todos" onClick={() => tree.collapseAllNodes()} variant="muted" />
				</Grid>
				<Tree
					className={styles.tree}
					data={availablePermissions}
					expandOnClick={false}
					renderNode={renderTreeNode}
					tree={tree}
				/>

			</Section>
		</Collapsible>
	);

	//
}

/* * */

function renderTreeNode({ elementProps, expanded, hasChildren, node, tree }: RenderTreeNodePayload) {
	//

	//
	// A. Setup variables

	const roleDetailContext = useRoleDetailContext();

	const checked = tree.isNodeChecked(node.value);
	const indeterminate = tree.isNodeIndeterminate(node.value);

	//
	// B. Render components

	return (
		<div {...elementProps} className={styles.treeNode}>
			<Checkbox
				checked={checked}
				indeterminate={indeterminate}
				onChange={() => roleDetailContext.actions.handlePermissionChange(node.value)}
			/>
			<div className={styles.treeNode} onClick={() => tree.toggleExpanded(node.value)}>
				<span>{node.label}</span>
				{hasChildren && (
					<IconChevronDown
						size={14}
						style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
					/>
				)}
			</div>
		</div>
	);

	//
};
