'use client';

import { RoleCreate } from '@/components/roles/create/RoleCreate';
import { RoleCreateContextProvider } from '@/components/roles/create/RoleCreate.context';
import { DataProviders } from '@/providers/data-providers';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-role-modal';

/* * */

export const openCreateRoleModal = () => {
	openModal({
		children: (
			<DataProviders>
				<RoleCreateContextProvider>
					<RoleCreate />
				</RoleCreateContextProvider>
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

export const closeCreateRoleModal = () => {
	closeModal(MODAL_ID);
};
