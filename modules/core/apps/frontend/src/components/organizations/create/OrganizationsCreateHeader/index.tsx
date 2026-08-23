'use client';

import { closeOrganizationsCreateModal } from '@/components/organizations/create/OrganizationsCreate.modal';
import { CloseButton, CreateButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useOrganizationsCreateFormContext } from '../OrganizationsCreateForm.context';

/* * */

export function OrganizationsCreateHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { actions, capabilities, status } = useOrganizationsCreateFormContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeOrganizationsCreateModal} type="close" />
			<Tag label={t('default:organizations.create.Header.NewOrganizationButton.label')} variant="secondary" />
			<Spacer />
			<CreateButton
				isDisabled={!capabilities.createEnabled}
				isLoading={status.isCreating}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
