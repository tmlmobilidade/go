'use client';

import { LineCreate } from '@/components/lines/create/LineCreate';
import { LineCreateContextProvider } from '@/components/lines/create/LineCreate.context';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-line-modal';

/* * */

export const openCreateLineModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<LineCreateContextProvider>
					<LineCreate />
				</LineCreateContextProvider>
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

export const closeCreateLineModal = () => {
	closeModal(MODAL_ID);
};
