'use client';

import { StopCreate } from '@/components/stops/create/StopCreate';
import { StopCreateContextProvider } from '@/components/stops/create/StopCreate.context';
import { StopsListContextProvider } from '@/components/stops/list/StopsList.context';
import { DataProviders } from '@/providers/data-providers';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-stop-modal';

/* * */

export const openCreateStopModal = () => {
	openModal({
		children: (
			<DataProviders>
				<StopsListContextProvider>
					<StopCreateContextProvider>
						<StopCreate />
					</StopCreateContextProvider>
				</StopsListContextProvider>
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

export const closeCreateStopModal = () => {
	closeModal(MODAL_ID);
};
