'use client';

/* * */

import { availablePermissions, useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { IconCheck, IconChevronDown, IconChevronUp, IconX } from '@tabler/icons-react';
import { Button, Checkbox, Grid, RenderTreeNodePayload, Section, Surface, Tree, useTree } from '@tmlmobilidade/ui';
import { useEffect } from 'react';

import styles from './styles.module.css';

/* * */

export function UsersDetailPermissions() {
	//

	//
	// A. Setup variables

	const tree = useTree();
	const usersDetailContext = useUsersDetailContext();

	//
	// B. Transform data

	useEffect(() => {
		const permissions = usersDetailContext.data?.form.getValues().permissions ?? [];
		const initialCheckedState = permissions.map(permission => `${permission.scope}-${permission.action}`);
		tree.setCheckedState(initialCheckedState);
	}, [usersDetailContext.data?.form.getValues().permissions]);

	//
	// C. Render components

	return (
		<Section
			description="As ações que o utilizador pode realizar no sistema."
			title="Permissões"
		>
			<Surface gap="md" padding="sm">
				<Grid columns="abcd" gap="sm">
					<Button icon={<IconCheck />} label="Selecionar todos" onClick={() => usersDetailContext.actions.handlePermissionChange('*')} variant="secondary" />
					<Button icon={<IconX />} label="Desmarcar todos" onClick={() => usersDetailContext.actions.handlePermissionChange('!*')} variant="danger" />
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
			</Surface>
		</Section>
	);

	//
}

/* * */

function renderTreeNode({ elementProps, expanded, hasChildren, node, tree }: RenderTreeNodePayload) {
	//

	//
	// A. Setup variables

	const { actions } = useUsersDetailContext();
	const checked = tree.isNodeChecked(node.value);
	const indeterminate = tree.isNodeIndeterminate(node.value);

	//
	// B. Render components

	return (
		<div {...elementProps} className={styles.treeNode}>
			<Checkbox checked={checked} indeterminate={indeterminate} onChange={() => actions.handlePermissionChange(node.value)} />
			<div className={styles.treeNode} onClick={() => tree.toggleExpanded(node.value)}>
				<span>{node.label}</span>
				{hasChildren && <IconChevronDown size={14}style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />}
			</div>
		</div>
	);

	//
};
