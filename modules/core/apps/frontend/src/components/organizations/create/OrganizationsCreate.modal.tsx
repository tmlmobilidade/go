'use client';

import { OrganizationsCreate } from '@/components/organizations/create/OrganizationsCreate';
import { OrganizationsCreateFormContextProvider } from '@/components/organizations/create/OrganizationsCreateForm.context';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'organizations-create-modal';

/* * */

export const openOrganizationsCreateModal = () => {
	openModal({
		children: (
			<OrganizationsCreateFormContextProvider>
				<OrganizationsCreate />
			</OrganizationsCreateFormContextProvider>
		),
		closeOnClickOutside: false,
		closeOnEscape: false,
		modalId: MODAL_ID,
		padding: 0,
		size: 'xl',
		withCloseButton: false,
	});
};

/* * */

export const closeOrganizationsCreateModal = () => {
	closeModal(MODAL_ID);
};
