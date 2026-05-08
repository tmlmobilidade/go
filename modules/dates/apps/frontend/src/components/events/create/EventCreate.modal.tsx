'use client';

import { EventCreate } from '@/components/events/create/EventCreate';
import { EventCreateContextProvider } from '@/components/events/create/EventCreate.context';
import { DataProviders } from '@/providers/data-providers';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-event-modal';

/* * */

export const openCreateEventModal = () => {
	openModal({
		children: (
			<DataProviders>
				<EventCreateContextProvider>
					<EventCreate />
				</EventCreateContextProvider>
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

export const closeCreateEventModal = () => {
	closeModal(MODAL_ID);
};
