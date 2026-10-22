'use client';

import { closeModal, openModal } from '@tmlmobilidade/ui';

import { AlertsExtract } from './AlertsExtract';

/* * */

const MODAL_ID = 'alerts-extract-modal';

/* * */

export const openAlertsExtractModal = () => {
	openModal({
		children: <AlertsExtract />,
		closeOnClickOutside: false,
		closeOnEscape: false,
		modalId: MODAL_ID,
		padding: 0,
		size: 'xl',
		withCloseButton: false,
	});
};

/* * */

export const closeAlertsExtractModal = () => {
	closeModal(MODAL_ID);
};
