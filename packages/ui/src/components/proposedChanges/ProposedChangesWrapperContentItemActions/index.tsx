/* * */

import { IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import { Permission, PermissionCatalog } from '@tmlmobilidade/types';

import { ButtonGroup, ButtonGroupProps } from '../../buttons/ButtonGroup';

/* * */

interface ProposedChangesWrapperContentItemActionsProps {
	approve?: () => void
	isNew: boolean
	permissions: Permission[]
	reject?: () => void
	status?: string
	submit: () => void
}

/* * */

export function ProposedChangesWrapperContentItemActions({ approve, isNew, permissions, reject, status, submit }: ProposedChangesWrapperContentItemActionsProps) {
	//

	//
	// A. Setup Variables

	const buttons: ButtonGroupProps['buttons'] = [
		{ action: PermissionCatalog.all.sams.actions.read, icon: <IconX size={16} />, onclick: reject ?? (() => console.log()), variant: 'danger' },
		{ action: PermissionCatalog.all.sams.actions.read, icon: <IconCheck size={16} />, onclick: approve ?? (() => console.log()), variant: 'secondary' },
		{ action: PermissionCatalog.all.sams.actions.read, icon: <IconPlus size={16} />, onclick: submit, variant: 'primary' },
	];

	//
	// B. Transform data

	const visibleButtons = isNew ? buttons.filter(btn => btn.action === 'create' && permissions.find(p => p.action === btn.action)) : buttons.filter(btn => permissions.find(p => p.action === btn.action && btn.action !== 'create'));
	const visibleButtonsStatus = status === 'pending' ? visibleButtons : visibleButtons.filter(btn => btn.action !== PermissionCatalog.all.sams.actions.read && btn.action !== PermissionCatalog.all.sams.actions.read);

	//
	// C. Render Components

	return <ButtonGroup buttons={visibleButtonsStatus} />;

	//
};
