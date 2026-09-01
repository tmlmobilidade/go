'use client';

import { closeModal, openModal } from '@tmlmobilidade/ui';

import { StopsCreate } from './StopsCreate';
import { StopsCreateFormContextProvider } from './StopsCreateForm.context';

/* * */

const MODAL_ID = 'stops-create-modal';

/* * */

export const openStopsCreateModal = () => {
	openModal({
		children: (
			<StopsCreateFormContextProvider>
				<StopsCreate />
			</StopsCreateFormContextProvider>
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

export const closeStopsCreateModal = () => {
	closeModal(MODAL_ID);
};
