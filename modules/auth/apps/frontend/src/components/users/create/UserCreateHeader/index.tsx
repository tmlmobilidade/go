'use client';

/* * */

import { useUserCreateContext } from '@/components/users/create/UserCreate.context';
import { closeCreateUserModal } from '@/components/users/create/UserCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { CloseButton, Button, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function UserCreateHeader() {
	//

	//
	// A. Setup variables

	const userCreateContext = useUserCreateContext();
	const { t } = useTranslation('auth', { keyPrefix: 'users.create.header' });

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateUserModal} type="close" />
			<Tag label={t('new_user_button_label')} variant="secondary" />
			<Spacer />
			<Button
				disabled={!userCreateContext.data.form.isValid()}
				icon={<IconPlus size={28} />}
				label={t('save_button_label')}
				loading={userCreateContext.flags.isSaving}
				onClick={userCreateContext.actions.saveUser}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
