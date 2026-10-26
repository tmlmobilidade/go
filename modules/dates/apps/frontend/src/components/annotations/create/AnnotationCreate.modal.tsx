'use client';

import { AnnotationCreate } from '@/components/annotations/create/AnnotationCreate';
import { AnnotationsCreateFormContextProvider } from '@/components/annotations/create/AnnotationsCreateForm.context';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-annotation-modal';

/* * */

export const openCreateAnnotationModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<AnnotationsCreateFormContextProvider>
					<AnnotationCreate />
				</AnnotationsCreateFormContextProvider>
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

export const closeCreateAnnotationModal = () => {
	closeModal(MODAL_ID);
};
