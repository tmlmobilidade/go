'use client';

/* * */

import { RuleCreate } from '@/components/patterns/rules/create/RuleCreate';
import { RuleCreateContextProvider } from '@/components/patterns/rules/create/RuleCreate.context';
import { PeriodsContextProvider } from '@/contexts/Periods.context';
import { type ScheduleRule } from '@tmlmobilidade/types';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-rule-modal';

/* * */

export const openCreateRuleModal = (agencyId: string, options?: { initialValues?: ScheduleRule, onSuccess?: (rule: ScheduleRule, index?: number) => void, patternId?: string, ruleIndex?: number }) => {
	openModal({
		children: (
			<MeContextProvider>
				<PeriodsContextProvider agencyId={agencyId}>
					<RuleCreateContextProvider
						initialValues={options?.initialValues}
						onSuccess={options?.onSuccess}
						patternId={options?.patternId}
						ruleIndex={options?.ruleIndex}
					>
						<RuleCreate />
					</RuleCreateContextProvider>
				</PeriodsContextProvider>
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
