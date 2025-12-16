'use client';

/* * */

import { ScheduledAlertCreate } from '@/components/scheduled/create/ScheduledAlertCreate';
import { ScheduledAlertCreateContextProvider } from '@/components/scheduled/create/ScheduledAlertCreate.context';
import { DataProviders } from '@/providers/data-providers';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-scheduled-alert-modal';

/* * */

export const openCreateScheduledAlertModal = () => {
	openModal({

		children: (
			<DataProviders>
				<ScheduledAlertCreateContextProvider>
					<ScheduledAlertCreate />
				</ScheduledAlertCreateContextProvider>
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

export const closeCreateScheduledAlertModal = () => {
	closeModal(MODAL_ID);
};
