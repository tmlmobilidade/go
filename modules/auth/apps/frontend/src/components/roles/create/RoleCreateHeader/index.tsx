'use client';

import { useRoleCreateContext } from '@/components/roles/create/RoleCreate.context';
import { closeCreateRoleModal } from '@/components/roles/create/RoleCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RoleCreateHeader() {
	//

	//
	// A. Setup variables

	const roleCreateContext = useRoleCreateContext();

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateRoleModal} type="close" />
			<Tag label={t('default:roles.create.Header.NewRoleButton.label')} variant="secondary" />
			<Label size="lg" singleLine>{roleCreateContext.data.form.values.name}</Label>
			<Spacer />
			<Button
				disabled={!roleCreateContext.data.form.values.name}
				icon={<IconUpload size={28} />}
				label={t('default:roles.create.Header.SaveButton.label')}
				loading={roleCreateContext.flags.isSaving}
				onClick={roleCreateContext.actions.saveRole}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
