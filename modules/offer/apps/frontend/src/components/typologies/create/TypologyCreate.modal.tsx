'use client';

import { TypologiesCreateFormContextProvider } from '@/components/typologies/create/TypologiesCreateForm.context';
import { TypologyCreate } from '@/components/typologies/create/TypologyCreate';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-typology-modal';

/* * */

export const openCreateTypologyModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<TypologiesCreateFormContextProvider>
					<TypologyCreate />
				</TypologiesCreateFormContextProvider>
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

export const closeCreateTypologyModal = () => {
	closeModal(MODAL_ID);
};
