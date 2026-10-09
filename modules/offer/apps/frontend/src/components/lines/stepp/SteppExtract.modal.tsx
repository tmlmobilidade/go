'use client';

import { closeModal, openModal } from '@tmlmobilidade/ui';

import { SteppExtract } from './SteppExtract';
import { SteppExtractFormContextProvider } from './SteppExtractForm.context';

/* * */

const MODAL_ID = 'stepp-extract-modal';

/* * */

export const openSteppExtractModal = () => {
	openModal({
		children: (
			<SteppExtractFormContextProvider>
				<SteppExtract />
			</SteppExtractFormContextProvider>
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

export const closeSteppExtractsModal = () => {
	closeModal(MODAL_ID);
};
