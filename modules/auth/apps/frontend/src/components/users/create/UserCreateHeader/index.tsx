'use client';

/* * */

import { useUserCreateContext } from '@/contexts/UserCreate.context';
import { IconPlus } from '@tabler/icons-react';
import { BackButton, Button, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface UserCreateHeaderProps {
	onClose?: () => void
}

/* * */

export function UserCreateHeader({ onClose }: UserCreateHeaderProps) {
	//

	//
	// A. Setup variables

	const userCreateContext = useUserCreateContext();
	const { t } = useTranslation('auth', { keyPrefix: 'users.create.header' });

	//
	// B. Render components

	return (
		<Toolbar>
			<BackButton onClick={onClose} type="close" />
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
