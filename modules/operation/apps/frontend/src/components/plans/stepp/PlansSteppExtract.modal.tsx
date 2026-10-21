'use client';

import { closeModal, openModal } from '@tmlmobilidade/ui';

import { PlansSteppExtract } from './PlansSteppExtract';
import { PlansSteppExtractFormContextProvider } from './PlansSteppExtractForm.context';

/* * */

const MODAL_ID = 'plans-stepp-extract-modal';

/* * */

export const openPlansSteppExtractModal = () => {
	openModal({
		children: (
			<PlansSteppExtractFormContextProvider>
				<PlansSteppExtract />
			</PlansSteppExtractFormContextProvider>
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

export const closePlansSteppExtractModal = () => {
	closeModal(MODAL_ID);
};
