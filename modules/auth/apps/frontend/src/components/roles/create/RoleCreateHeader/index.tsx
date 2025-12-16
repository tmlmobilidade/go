'use client';

/* * */

import { useRoleCreateContext } from '@/contexts/RoleCreate.context';
import { IconUpload } from '@tabler/icons-react';
import { BackButton, Button, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface RoleCreateHeaderProps {
	onClose?: () => void
}

export function RoleCreateHeader({ onClose }: RoleCreateHeaderProps) {
	//

	//
	// A. Setup variables

	const roleCreateContext = useRoleCreateContext();

	const { t } = useTranslation('auth', { keyPrefix: 'roles.create.header' });

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={onClose} type="close" />
			<Tag label={t('new_role_button_label')} variant="secondary" />
			<Label size="lg" singleLine>{roleCreateContext.data.form.values.name}</Label>
			<Spacer />
			<Button
				disabled={!roleCreateContext.data.form.values.name}
				icon={<IconUpload size={28} />}
				label={t('save_button_label')}
				loading={roleCreateContext.flags.isSaving}
				onClick={roleCreateContext.actions.saveRole}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
