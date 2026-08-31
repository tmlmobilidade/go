'use client';

import { closeModal, openModal } from '@tmlmobilidade/ui';

import { StopsDetailEditNameFormContextProvider } from './StopsDetailEditNameForm.context';
import { StopsDetailEditNameModal } from './StopsDetailEditNameModal';

/* * */

const MODAL_ID = 'stops-detail-edit-name-modal';

/* * */

export const openStopsDetailEditNameModal = () => {
	openModal({
		children: (
			<StopsDetailEditNameFormContextProvider>
				<StopsDetailEditNameModal />
			</StopsDetailEditNameFormContextProvider>
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

export const closeStopsDetailEditNameModal = () => {
	closeModal(MODAL_ID);
};
