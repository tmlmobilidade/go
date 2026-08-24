'use client';

import { RolesCreate } from '@/components/roles/create/RolesCreate';
import { RolesCreateFormContextProvider } from '@/components/roles/create/RolesCreateForm.context';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'roles-create-modal';

/* * */

export const openRolesCreateModal = () => {
	openModal({
		children: (
			<RolesCreateFormContextProvider>
				<RolesCreate />
			</RolesCreateFormContextProvider>
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

export const closeRolesCreateModal = () => {
	closeModal(MODAL_ID);
};
