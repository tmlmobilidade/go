'use client';

import { closeModal, MapContextProvider, openModal } from '@tmlmobilidade/ui';

import { StopsDetailUpdateCoordinatesFormContextProvider } from './StopsDetailUpdateCoordinatesForm.context';
import { StopsDetailUpdateCoordinatesModal } from './StopsDetailUpdateCoordinatesModal';

/* * */

const MODAL_ID = 'stops-detail-edit-name-modal';

/* * */

export const openStopsDetailUpdateCoordinatesModal = () => {
	openModal({
		children: (
			<MapContextProvider>
				<StopsDetailUpdateCoordinatesFormContextProvider>
					<StopsDetailUpdateCoordinatesModal />
				</StopsDetailUpdateCoordinatesFormContextProvider>
			</MapContextProvider>
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

export const closeStopsDetailUpdateCoordinatesModal = () => {
	closeModal(MODAL_ID);
};
