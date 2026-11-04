'use client';

import { HolidayCreate } from '@/components/holidays/create/HolidayCreate';
import { HolidaysCreateFormContextProvider } from '@/components/holidays/create/HolidaysCreateForm.context';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-holiday-modal';

/* * */

export const openCreateHolidayModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<HolidaysCreateFormContextProvider>
					<HolidayCreate />
				</HolidaysCreateFormContextProvider>
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

export const closeCreateHolidayModal = () => {
	closeModal(MODAL_ID);
};
