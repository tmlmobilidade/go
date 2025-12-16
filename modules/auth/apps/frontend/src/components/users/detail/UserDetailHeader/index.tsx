'use client';

/* * */

import { useUserDetailContext } from '@/contexts/UserDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams, Label } from '@tmlmobilidade/ui';
import { BackButton, Button, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function UserDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const userDetailContext = useUserDetailContext();

	const { t: tGlobal } = useTranslation('global', { keyPrefix: 'operations' });
	const { t: tAuth } = useTranslation('auth', { keyPrefix: 'users.detail.header' });

	//
	// B. Handle actions

	const handleClose = () => {
		const destUrl = keepUrlParams(PAGE_ROUTES.auth.USERS_LIST, window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={handleClose} type="close" />
			<Tag label={userDetailContext.data.id || tAuth('new_user_button_label')} variant="muted" />
			<Label size="lg" singleLine>{userDetailContext.data.form.values.email}</Label>
			<Spacer />
			<Button
				disabled={!userDetailContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label={tGlobal('save')}
				loading={userDetailContext.flags.isSaving}
				onClick={userDetailContext.actions.saveUser}
				variant="primary"
			/>
			<Button
				icon={<IconTrash size={28} />}
				label={tGlobal('delete')}
				onClick={userDetailContext.actions.deleteUser}
				variant="danger"
			/>
		</Toolbar>
	);

	//
}
