'use client';

/* * */

import { RuleCreate } from '@/components/patterns/rules/create/RuleCreate';
import { RuleCreateContextProvider } from '@/components/patterns/rules/create/RuleCreate.context';
import { PeriodsContextProvider } from '@/contexts/Periods.context';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-rule-modal';

/* * */

export const openCreateRuleModal = (agencyId: string) => {
	openModal({
		children: (
			<PeriodsContextProvider agencyId={agencyId}>
				<RuleCreateContextProvider>
					<RuleCreate />
				</RuleCreateContextProvider>
			</PeriodsContextProvider>
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
