'use client';

import { closeOrganizationsCreateModal } from '@/components/organizations/create/OrganizationsCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useOrganizationsCreateFormContext } from '../OrganizationsCreateForm.context';

/* * */

export function OrganizationsCreateHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { actions, capabilities, form, status } = useOrganizationsCreateFormContext();

	const nameValue = useStandardFormWatch({ control: form.control, name: 'name' });

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeOrganizationsCreateModal} type="close" />
			<Tag label={t('default:organizations.create.Header.NewOrganizationButton.label')} variant="secondary" />
			<Label size="lg" singleLine>{nameValue}</Label>
			<Spacer />
			<Button
				disabled={!capabilities.createEnabled}
				icon={<IconUpload size={28} />}
				label={t('default:organizations.create.Header.UpdateButton.label')}
				loading={status.isCreating}
				onClick={actions.create}
				variant="primary"
			/>
		</Toolbar>
	);
}
