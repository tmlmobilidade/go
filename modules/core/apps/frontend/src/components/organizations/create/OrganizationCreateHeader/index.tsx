'use client';

import { useOrganizationCreateContext } from '@/components/organizations/create/OrganizationCreate.context';
import { closeCreateOrganizationModal } from '@/components/organizations/create/OrganizationCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function OrganizationCreateHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const organizationCreateContext = useOrganizationCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateOrganizationModal} type="close" />
			<Tag label={t('default:organizations.create.Header.title')} variant="muted" />
			<Label size="lg" singleLine>{organizationCreateContext.data.form.values.long_name}</Label>
			<Spacer />
			<Button
				disabled={!organizationCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label={t('default:organizations.create.Header.PublishButton.label')}
				loading={organizationCreateContext.flags.isSaving}
				onClick={organizationCreateContext.actions.saveOrganization}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
