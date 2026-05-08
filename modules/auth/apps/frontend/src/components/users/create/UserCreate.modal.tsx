'use client';

import { UserCreate } from '@/components/users/create/UserCreate';
import { UserCreateContextProvider } from '@/components/users/create/UserCreate.context';
import { DataProviders } from '@/providers/data-providers';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-user-modal';

/* * */

export const openCreateUserModal = () => {
	openModal({
		children: (
			<DataProviders>
				<UserCreateContextProvider>
					<UserCreate />
				</UserCreateContextProvider>
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

export const closeCreateUserModal = () => {
	closeModal(MODAL_ID);
};
