'use client';

import { closeModal, openModal } from '@tmlmobilidade/ui';

import { AnnotationsListExportFormContextProvider } from './AnnotationsListExportForm.context';
import { AnnotationsListExport } from './index';

/* * */

const MODAL_ID = 'annotations-list-export';

export function openAnnotationsListExportModal() {
	openModal({ children: <AnnotationsListExportFormContextProvider><AnnotationsListExport /></AnnotationsListExportFormContextProvider>, closeOnClickOutside: false, closeOnEscape: false, modalId: MODAL_ID, padding: 0, size: 'xl', withCloseButton: false });
}

export function closeAnnotationsListExportModal() {
	closeModal(MODAL_ID);
}
