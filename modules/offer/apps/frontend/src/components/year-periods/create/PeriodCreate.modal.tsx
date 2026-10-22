'use client';

import { PeriodCreate } from '@/components/year-periods/create/PeriodCreate';
import { PeriodsCreateFormContextProvider } from '@/components/year-periods/create/PeriodsCreateForm.context';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-period-modal';

/* * */

export const openCreatePeriodModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<PeriodsCreateFormContextProvider>
					<PeriodCreate />
				</PeriodsCreateFormContextProvider>
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

export const closeCreatePeriodModal = () => {
	closeModal(MODAL_ID);
};
