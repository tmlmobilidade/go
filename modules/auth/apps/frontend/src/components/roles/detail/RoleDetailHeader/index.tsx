'use client';

/* * */

import { useRoleDetailContext } from '@/contexts/RoleDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { BackButton, Button, keepUrlParams, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function RoleDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const roleDetailContext = useRoleDetailContext();

	const { t } = useTranslation('auth', { keyPrefix: 'roles.detail.header' });

	//
	// B. Handle actions

	const handleClose = () => {
		const destUrl = keepUrlParams(PAGE_ROUTES.auth.ROLES_LIST, window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={handleClose} type="close" />
			<Tag label={roleDetailContext.data.id || t('new_role_button_label')} variant="secondary" />
			<Label size="lg" singleLine>{roleDetailContext.data.form.values.name}</Label>
			<Spacer />
			<Button
				disabled={!roleDetailContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label={t('save_button_label')}
				loading={roleDetailContext.flags.isSaving}
				onClick={roleDetailContext.actions.updateRole}
				variant="primary"
			/>
			<Button
				icon={<IconTrash size={28} />}
				label={t('delete_button_label')}
				onClick={roleDetailContext.actions.deleteRole}
				variant="danger"
			/>
		</Toolbar>
	);

	//
}
