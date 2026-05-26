'use client';

import { AnnotationCreate } from '@/components/annotations/create/AnnotationCreate';
import { AnnotationCreateContextProvider } from '@/components/annotations/create/AnnotationCreate.context';
import { DataProviders } from '@/providers/data-providers';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-annotation-modal';

/* * */

export const openCreateAnnotationModal = () => {
	openModal({
		children: (
			<DataProviders>
				<MeContextProvider>
					<AnnotationCreateContextProvider>
						<AnnotationCreate />
					</AnnotationCreateContextProvider>
				</MeContextProvider>
			</DataProviders>
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
