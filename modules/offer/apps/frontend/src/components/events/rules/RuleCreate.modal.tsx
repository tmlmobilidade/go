'use client';

import { RuleCreate } from '@/components/events/rules/RuleCreate';
import { RuleCreateContextProvider } from '@/components/events/rules/RuleCreate.context';
import { EventPeriodsProviders } from '@/components/events/shared/EventPeriodsProviders';
import { type EventRule } from '@tmlmobilidade/go-types-offer';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-rule-modal';

/* * */

interface EventData {
	agency_ids: string[]
	dates: string[]
}

export const openCreateRuleModal = (eventData: EventData, initialValues?: EventRule, onSubmit?: (rule: EventRule) => void, onDelete?: () => void) => {
	openModal({
		children: (
			<MeContextProvider>
				<EventPeriodsProviders>
					<RuleCreateContextProvider
						eventData={eventData}
						initialValues={initialValues}
						onDelete={onDelete}
						onSubmit={onSubmit}
					>
						<RuleCreate />
					</RuleCreateContextProvider>
				</EventPeriodsProviders>
			</MeContextProvider>
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

export const closeCreateRuleModal = () => {
	closeModal(MODAL_ID);
};
