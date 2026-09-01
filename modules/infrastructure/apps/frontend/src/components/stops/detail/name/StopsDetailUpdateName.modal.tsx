'use client';

import { closeModal, openModal } from '@tmlmobilidade/ui';

import { StopsDetailUpdateNameFormContextProvider } from './StopsDetailUpdateNameForm.context';
import { StopsDetailUpdateNameModal } from './StopsDetailUpdateNameModal';

/* * */

const MODAL_ID = 'stops-detail-edit-name-modal';

/* * */

export const openStopsDetailUpdateNameModal = () => {
	openModal({
		children: (
			<StopsDetailUpdateNameFormContextProvider>
				<StopsDetailUpdateNameModal />
			</StopsDetailUpdateNameFormContextProvider>
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

export const closeStopsDetailUpdateNameModal = () => {
	closeModal(MODAL_ID);
};
