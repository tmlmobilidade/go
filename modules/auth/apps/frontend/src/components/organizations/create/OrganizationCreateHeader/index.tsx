'use client';

/* * */

import { useOrganizationCreateContext } from '@/contexts/OrganizationCreate.context';
import { IconUpload } from '@tabler/icons-react';
import { BackButton, Button, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface OrganizationCreateHeaderProps {
	onClose?: () => void
}

export function OrganizationCreateHeader({ onClose }: OrganizationCreateHeaderProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('auth', { keyPrefix: 'organizations.create.header' });

	const organizationCreateContext = useOrganizationCreateContext();

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={onClose} type="close" />
			<Tag label={t('title')} variant="muted" />
			<Label size="lg" singleLine>{organizationCreateContext.data.form.values.long_name}</Label>
			<Spacer />
			<Button
				disabled={!organizationCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label={t('publish_button_label')}
				loading={organizationCreateContext.flags.isSaving}
				onClick={organizationCreateContext.actions.saveOrganization}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
