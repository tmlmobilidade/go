'use client';

import { UsersCreate } from '@/components/users/create/UsersCreate';
import { UsersCreateFormContextProvider } from '@/components/users/create/UsersCreateForm.context';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'users-create-modal';

/* * */

export const openUsersCreateModal = () => {
	openModal({
		children: (
			<UsersCreateFormContextProvider>
				<UsersCreate />
			</UsersCreateFormContextProvider>
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

export const closeUsersCreateModal = () => {
	closeModal(MODAL_ID);
};
