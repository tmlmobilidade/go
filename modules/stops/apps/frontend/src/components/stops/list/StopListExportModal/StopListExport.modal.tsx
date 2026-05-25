'use client';

import { StopListExportModal } from '@/components/stops/list/StopListExportModal';
import { StopsListContextProvider } from '@/components/stops/list/StopsList.context';
import { StopListExportContextProvider } from '@/contexts/StopListExport.contex';
import { DataProviders } from '@/providers/data-providers';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'stop-list-export-modal';

/* * */

export const openStopListExportModal = () => {
	openModal({
		children: (
			<DataProviders>
				<StopsListContextProvider>
					<StopListExportContextProvider>
						<StopListExportModal />
					</StopListExportContextProvider>
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

export const closeStopListExportModal = () => {
	closeModal(MODAL_ID);
};
