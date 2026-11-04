'use client';

import { EventCreate } from '@/components/events/create/EventCreate';
import { EventsCreateFormContextProvider } from '@/components/events/create/EventsCreateForm.context';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-event-modal';

/* * */

export const openCreateEventModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<EventsCreateFormContextProvider>
					<EventCreate />
				</EventsCreateFormContextProvider>
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

export const closeCreateEventModal = () => {
	closeModal(MODAL_ID);
};
