'use client';

import { closeModal, openModal } from '@tmlmobilidade/ui';

import { PlanPostersExtract } from './PlanPostersExtract';
import { PlanPostersExtractFormContextProvider } from './PlanPostersExtract.context';

/* * */

const MODAL_ID = 'plan-posters-extract-modal';

/* * */

export const openPlanPostersExtractModal = () => {
	openModal({
		children: (
			<PlanPostersExtractFormContextProvider>
				<PlanPostersExtract />
			</PlanPostersExtractFormContextProvider>
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

export const closePlanPostersExtractModal = () => {
	closeModal(MODAL_ID);
};
