'use client';

import { closeModal, openModal } from '@tmlmobilidade/ui';

import { StopsDetailEditCoordinatesFormContextProvider } from './StopsDetailEditCoordinatesForm.context';
import { StopsDetailEditCoordinatesModal } from './StopsDetailEditCoordinatesModal';

/* * */

const MODAL_ID = 'stops-detail-section-general-edit-name-modal';

/* * */

export const openStopsDetailEditCoordinatesModal = () => {
	openModal({
		children: (
			<StopsDetailEditCoordinatesFormContextProvider>
				<StopsDetailEditCoordinatesModal />
			</StopsDetailEditCoordinatesFormContextProvider>
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

export const closeStopsDetailEditCoordinatesModal = () => {
	closeModal(MODAL_ID);
};
