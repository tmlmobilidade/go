'use client';

import { EventPeriodsProviders } from '@/components/events/shared/EventPeriodsProviders';
import { PeriodCreate } from '@/components/year-periods/create/PeriodCreate';
import { PeriodCreateContextProvider } from '@/components/year-periods/create/PeriodsCreate.context';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-period-modal';

/* * */

export const openCreatePeriodModal = () => {
	openModal({
		children: (
			<EventPeriodsProviders>
				<MeContextProvider>
					<PeriodCreateContextProvider>
						<PeriodCreate />
					</PeriodCreateContextProvider>
				</MeContextProvider>
			</EventPeriodsProviders>
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
