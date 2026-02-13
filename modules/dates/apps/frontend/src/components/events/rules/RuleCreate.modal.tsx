'use client';

/* * */

import { RuleCreate } from '@/components/events/rules/RuleCreate';
import { RuleCreateContextProvider } from '@/components/events/rules/RuleCreate.context';
import { DataProviders } from '@/providers/data-providers';
import { type EventRule } from '@tmlmobilidade/types';
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
				<DataProviders>
					<RuleCreateContextProvider
						eventData={eventData}
						initialValues={initialValues}
						onDelete={onDelete}
						onSubmit={onSubmit}
					>
						<RuleCreate />
					</RuleCreateContextProvider>
				</DataProviders>
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
