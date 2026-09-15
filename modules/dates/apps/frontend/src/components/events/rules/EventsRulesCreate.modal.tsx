'use client';

import { EventsRulesCreate } from '@/components/events/rules/EventsRulesCreate';
import { type EventsRulesCreateEventData, EventsRulesCreateFormContextProvider } from '@/components/events/rules/EventsRulesCreateForm.context';
import { type EventRule } from '@tmlmobilidade/go-types-offer';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'events-rules-create-modal';

/* * */

interface OpenEventsRulesCreateModalArgs {
	eventData: EventsRulesCreateEventData
	initialValues?: EventRule
	onDelete?: () => void
	onSubmit: (rule: EventRule) => void
}

/* * */

export const openEventsRulesCreateModal = ({ eventData, initialValues, onDelete, onSubmit }: OpenEventsRulesCreateModalArgs) => {
	openModal({
		children: (
			<EventsRulesCreateFormContextProvider
				eventData={eventData}
				initialValues={initialValues}
				onDelete={onDelete}
				onSubmit={onSubmit}
			>
				<EventsRulesCreate />
			</EventsRulesCreateFormContextProvider>
		),
		closeOnClickOutside: false,
		closeOnEscape: false,
		modalId: MODAL_ID,
		padding: 0,
		size: '80%',
		styles: {
			body: {
				height: '100%',
			},
			content: {
				height: '85vh',
			},
		},
		withCloseButton: false,
	});
};

/* * */

export const closeEventsRulesCreateModal = () => {
	closeModal(MODAL_ID);
};
