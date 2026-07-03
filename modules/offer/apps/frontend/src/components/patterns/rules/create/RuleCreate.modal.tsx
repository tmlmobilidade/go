'use client';

import { RuleCreate } from '@/components/patterns/rules/create/RuleCreate';
import { RuleCreateContextProvider } from '@/components/patterns/rules/create/RuleCreate.context';
import { DataProviders } from '@/providers/data-providers';
import { type ManualRule } from '@tmlmobilidade/types';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-rule-modal';

/* * */

export const openCreateRuleModal = (agencyId: string, onSubmit: (rule: ManualRule) => void, initialValues?: ManualRule, onDelete?: () => void, onDuplicate?: (rule: ManualRule) => void) => {
	openModal({
		children: (
			<MeContextProvider>
				<DataProviders agency_id={agencyId}>
					<RuleCreateContextProvider
						initialValues={initialValues}
						onDelete={onDelete}
						onDuplicate={onDuplicate}
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
