'use client';

import { closeModal, openModal } from '@tmlmobilidade/ui';

import { NodesExtract } from './NodesExtract';

/* * */

const MODAL_ID = 'nodes-extract-modal';

/* * */

export const openNodesExtractModal = () => {
	openModal({
		children: <NodesExtract />,
		closeOnClickOutside: false,
		closeOnEscape: false,
		modalId: MODAL_ID,
		padding: 0,
		size: 'xl',
		withCloseButton: false,
	});
};

/* * */

export const closeNodesExtractModal = () => {
	closeModal(MODAL_ID);
};
