'use client';

import { AppProvider, closeModal, openModal } from '@tmlmobilidade/ui';

import { StopsCreate } from './StopsCreate';
import { StopsCreateFormContextProvider } from './StopsCreateForm.context';
import { StopsCreateFormStepsContextProvider } from './StopsCreateFormSteps.context';

/* * */

const MODAL_ID = 'stops-create-modal';

/* * */

export const openStopsCreateModal = () => {
	openModal({
		children: (
			<AppProvider>
				<StopsCreateFormContextProvider>
					<StopsCreateFormStepsContextProvider>
						<StopsCreate />
					</StopsCreateFormStepsContextProvider>
				</StopsCreateFormContextProvider>
			</AppProvider>
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

export const closeStopsCreateModal = () => {
	closeModal(MODAL_ID);
};
