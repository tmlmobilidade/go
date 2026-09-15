'use client';

import { EventsCreate } from '@/components/events/create/EventsCreate';
import { EventsCreateFormContextProvider } from '@/components/events/create/EventsCreateForm.context';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'events-create-modal';

/* * */

export const openEventsCreateModal = () => {
	openModal({
		children: (
			<EventsCreateFormContextProvider>
				<EventsCreate />
			</EventsCreateFormContextProvider>
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

export const closeEventsCreateModal = () => {
	closeModal(MODAL_ID);
};
