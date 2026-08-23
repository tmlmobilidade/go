'use client';

import { closeUsersCreateModal } from '@/components/users/create/UsersCreate.modal';
import { CloseButton, CreateButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useUsersCreateFormContext } from '../UsersCreateForm.context';

/* * */

export function UsersCreateHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { actions, capabilities, status } = useUsersCreateFormContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeUsersCreateModal} type="close" />
			<Tag label={t('default:users.create.Header.NewUserButton.label')} variant="secondary" />
			<Spacer />
			<CreateButton
				disabled={!capabilities.createEnabled}
				loading={status.isCreating}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
