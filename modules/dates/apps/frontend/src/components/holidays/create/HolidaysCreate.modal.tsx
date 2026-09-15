'use client';

import { HolidaysCreate } from '@/components/holidays/create/HolidaysCreate';
import { HolidaysCreateFormContextProvider } from '@/components/holidays/create/HolidaysCreateForm.context';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'holidays-create-modal';

/* * */

export const openHolidaysCreateModal = () => {
	openModal({
		children: (
			<HolidaysCreateFormContextProvider>
				<HolidaysCreate />
			</HolidaysCreateFormContextProvider>
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

export const closeHolidaysCreateModal = () => {
	closeModal(MODAL_ID);
};
