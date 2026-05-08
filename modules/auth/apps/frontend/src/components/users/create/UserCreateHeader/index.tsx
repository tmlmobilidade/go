'use client';

import { useUserCreateContext } from '@/components/users/create/UserCreate.context';
import { closeCreateUserModal } from '@/components/users/create/UserCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { Button, CloseButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function UserCreateHeader() {
	//

	//
	// A. Setup variables

	const userCreateContext = useUserCreateContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateUserModal} type="close" />
			<Tag label={t('default:users.create.Header.NewUserButton.label')} variant="secondary" />
			<Spacer />
			<Button
				disabled={!userCreateContext.data.form.isValid()}
				icon={<IconPlus size={28} />}
				label={t('default:users.create.Header.SaveButton.label')}
				loading={userCreateContext.flags.isSaving}
				onClick={userCreateContext.actions.saveUser}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
