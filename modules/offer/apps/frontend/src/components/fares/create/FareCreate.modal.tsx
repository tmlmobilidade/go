'use client';

import { FareCreate } from '@/components/fares/create/FareCreate';
import { FaresCreateFormContextProvider } from '@/components/fares/create/FaresCreateForm.context';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-fare-modal';

/* * */

export const openCreateFareModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<FaresCreateFormContextProvider>
					<FareCreate />
				</FaresCreateFormContextProvider>
			</MeContextProvider>
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

export const closeCreateFareModal = () => {
	closeModal(MODAL_ID);
};
