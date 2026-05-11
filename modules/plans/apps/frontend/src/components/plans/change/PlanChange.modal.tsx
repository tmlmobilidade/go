'use client';

import { PlanChange } from '@/components/plans/change/PlanChange';
import { PlanChangeContextProvider } from '@/components/plans/change/PlanChange.context';
import { DataProviders } from '@/providers/data-providers';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'plan-change-modal';

/* * */

export const openPlanChangeModal = (planId: string) => {
	openModal({
		children: (
			<DataProviders>
				<PlanChangeContextProvider planId={planId}>
					<PlanChange />
				</PlanChangeContextProvider>
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

export const closePlanChangeModal = () => {
	closeModal(MODAL_ID);
};
