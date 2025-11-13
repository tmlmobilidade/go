/* * */

import { IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import { Permissions } from '@tmlmobilidade/consts';
import { Permission } from '@tmlmobilidade/types';

import { ButtonGroup, ButtonGroupProps } from '../../buttons/ButtonGroup';

/* * */

interface ProposedChangesWrapperContentItemActionsProps {
	approve?: () => void
	isNew: boolean
	permissions: Permission<unknown>[]
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
		{ action: Permissions.proposed_changes.actions.reject, icon: <IconX size={16} />, onclick: reject ?? (() => console.log()), variant: 'danger' },
		{ action: Permissions.proposed_changes.actions.approve, icon: <IconCheck size={16} />, onclick: approve ?? (() => console.log()), variant: 'secondary' },
		{ action: Permissions.proposed_changes.actions.create, icon: <IconPlus size={16} />, onclick: submit, variant: 'primary' },
	];

	//
	// B. Transform data

	const visibleButtons = isNew ? buttons.filter(btn => btn.action === 'create' && permissions.find(p => p.action === btn.action)) : buttons.filter(btn => permissions.find(p => p.action === btn.action && btn.action !== 'create'));
	const visibleButtonsStatus = status === 'pending' ? visibleButtons : visibleButtons.filter(btn => btn.action !== Permissions.proposed_changes.actions.approve && btn.action !== Permissions.proposed_changes.actions.reject);

	//
	// C. Render Components

	return <ButtonGroup buttons={visibleButtonsStatus} />;

	//
};
