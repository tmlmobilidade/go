'use client';

import { YearPeriodsCreate } from '@/components/year-periods/create/YearPeriodsCreate';
import { YearPeriodsCreateFormContextProvider } from '@/components/year-periods/create/YearPeriodsCreateForm.context';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'yearPeriods-create-modal';

/* * */

export const openYearPeriodsCreateModal = () => {
	openModal({
		children: (
			<YearPeriodsCreateFormContextProvider>
				<YearPeriodsCreate />
			</YearPeriodsCreateFormContextProvider>
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

export const closeYearPeriodsCreateModal = () => {
	closeModal(MODAL_ID);
};
