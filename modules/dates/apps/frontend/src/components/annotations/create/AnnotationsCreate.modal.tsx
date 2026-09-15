'use client';

import { AnnotationsCreate } from '@/components/annotations/create/AnnotationsCreate';
import { AnnotationsCreateFormContextProvider } from '@/components/annotations/create/AnnotationsCreateForm.context';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'annotations-create-modal';

/* * */

export const openAnnotationsCreateModal = () => {
	openModal({
		children: (
			<AnnotationsCreateFormContextProvider>
				<AnnotationsCreate />
			</AnnotationsCreateFormContextProvider>
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

export const closeAnnotationsCreateModal = () => {
	closeModal(MODAL_ID);
};
