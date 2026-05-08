'use client';

import { HolidayCreate } from '@/components/holidays/create/HolidayCreate';
import { HolidayCreateContextProvider } from '@/components/holidays/create/HolidayCreate.context';
import { DataProviders } from '@/providers/data-providers';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-holiday-modal';

/* * */

export const openCreateHolidayModal = () => {
	openModal({
		children: (
			<DataProviders>
				<MeContextProvider>
					<HolidayCreateContextProvider>
						<HolidayCreate />
					</HolidayCreateContextProvider>
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

export const closeCreateHolidayModal = () => {
	closeModal(MODAL_ID);
};
