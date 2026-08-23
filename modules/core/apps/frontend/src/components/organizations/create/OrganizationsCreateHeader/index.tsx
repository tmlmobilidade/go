'use client';

import { closeOrganizationsCreateModal } from '@/components/organizations/create/OrganizationsCreate.modal';
import { CloseButton, CreateButton, Label, Spacer, Tag, Toolbar, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useOrganizationsCreateFormContext } from '../OrganizationsCreateForm.context';

/* * */

export function OrganizationsCreateHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { actions, capabilities, form, status } = useOrganizationsCreateFormContext();

	const longNameValue = useStandardFormWatch({ control: form.control, name: 'long_name' });

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeOrganizationsCreateModal} type="close" />
			<Tag label={t('default:organizations.create.Header.NewOrganizationButton.label')} variant="secondary" />
			<Label size="lg" singleLine>{longNameValue}</Label>
			<Spacer />
			<CreateButton
				disabled={!capabilities.createEnabled}
				loading={status.isCreating}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
