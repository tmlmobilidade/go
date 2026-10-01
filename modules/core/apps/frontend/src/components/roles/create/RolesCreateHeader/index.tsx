'use client';

import { closeRolesCreateModal } from '@/components/roles/create/RolesCreate.modal';
import { CloseButton, CreateButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRolesCreateFormContext } from '../RolesCreateForm.context';

/* * */

export function RolesCreateHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { actions, capabilities, status } = useRolesCreateFormContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeRolesCreateModal} type="close" />
			<Tag label={t('default:roles.create.Header.NewRoleButton.label')} variant="secondary" />
			<Spacer />
			<CreateButton
				isDisabled={!capabilities.createEnabled}
				isLoading={status.isCreating}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
