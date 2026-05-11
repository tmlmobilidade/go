'use client';

import { StopDetailContextProvider } from '@/components/stops/detail/StopDetail.context';
import { StopDetailCoordinatesModal } from '@/components/stops/detail/StopDetailCoordinatesModal';
import { DataProviders } from '@/providers/data-providers';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'stop-detail-coordinates-modal';

/* * */

export const openStopDetailCoordinatesModal = (stopId: string) => {
	openModal({
		children: (
			<DataProviders>
				<StopDetailContextProvider stopId={stopId}>
					<StopDetailCoordinatesModal />
				</StopDetailContextProvider>
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

export const closeStopDetailCoordinatesModal = () => {
	closeModal(MODAL_ID);
};
