'use client';

import { closeModal, openModal } from '@tmlmobilidade/ui';

import { ZonesExtract } from './ZonesExtract';

/* * */

const MODAL_ID = 'zones-extract-modal';

/* * */

export const openZonesExtractModal = () => {
	openModal({
		children: <ZonesExtract />,
		closeOnClickOutside: false,
		closeOnEscape: false,
		modalId: MODAL_ID,
		padding: 0,
		size: 'xl',
		withCloseButton: false,
	});
};

/* * */

export const closeZonesExtractModal = () => {
	closeModal(MODAL_ID);
};
