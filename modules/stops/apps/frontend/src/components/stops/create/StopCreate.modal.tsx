'use client';

import { StopCreateContextProvider } from '@/components/stops/create/StopCreate.context';
import { StopsListContextProvider } from '@/components/stops/list/StopsList.context';
import { DataProviders } from '@/providers/data-providers';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

import { StopCreate } from './StopCreate';

/* * */

const MODAL_ID = 'create-stop-modal';

/* * */

export const openStopCreateModal = () => {
	openModal({
		children: (
			<DataProviders>
				<MeContextProvider>
					<StopsListContextProvider>
						<StopCreateContextProvider>
							<StopCreate />
						</StopCreateContextProvider>
					</StopsListContextProvider>
				</MeContextProvider>
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

export const closeStopCreateModal = () => {
	closeModal(MODAL_ID);
};
