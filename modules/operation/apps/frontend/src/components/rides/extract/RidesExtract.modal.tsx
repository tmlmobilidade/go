'use client';

import { closeModal, openModal } from '@tmlmobilidade/ui';

import { RidesExtract } from './RidesExtract';

/* * */

const MODAL_ID = 'rides-extract-modal';

/* * */

export const openRidesExtractModal = () => {
	openModal({
		children: (
			<RidesExtract />
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

export const closeRidesExtractModal = () => {
	closeModal(MODAL_ID);
};
