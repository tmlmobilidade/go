'use client';

import { closeModal, openModal } from '@tmlmobilidade/ui';

import { SteppExtract } from './SteppExtract';

/* * */

const MODAL_ID = 'stepp-extract-modal';

/* * */

export const openSteppExtractModal = () => {
	openModal({
		children: (
			<SteppExtract />
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
