'use client';

import { OrganizationCreate } from '@/components/organizations/create/OrganizationCreate';
import { OrganizationCreateContextProvider } from '@/components/organizations/create/OrganizationCreate.context';
import { DataProviders } from '@/providers/data-providers';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-organization-modal';

/* * */

export const openCreateOrganizationModal = () => {
	openModal({
		children: (
			<DataProviders>
				<OrganizationCreateContextProvider>
					<OrganizationCreate />
				</OrganizationCreateContextProvider>
			</DataProviders>
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

export const closeCreateOrganizationModal = () => {
	closeModal(MODAL_ID);
};
