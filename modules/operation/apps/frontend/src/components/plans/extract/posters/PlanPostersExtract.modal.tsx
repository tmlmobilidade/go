'use client';

import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

import { PlanPostersExtract } from './PlanPostersExtract';
import { PlanPostersExtractFormContextProvider } from './PlanPostersExtractForm.context';

/* * */

const MODAL_ID = 'plan-posters-extract-modal';

/* * */

export const openPlanPostersExtractModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<PlanPostersExtractFormContextProvider>
					<PlanPostersExtract />
				</PlanPostersExtractFormContextProvider>
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

export const closePlanPostersExtractModal = () => {
	closeModal(MODAL_ID);
};
