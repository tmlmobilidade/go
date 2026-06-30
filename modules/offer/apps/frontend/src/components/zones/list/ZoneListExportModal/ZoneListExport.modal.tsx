'use client';

import { ZonesListExportContextProvider } from '@/contexts/ZonesExport.content';
import { DataProviders } from '@/providers/data-providers';
import { AgenciesContextProvider, closeModal, ExportsContextProvider, MeContextProvider, openModal } from '@tmlmobilidade/ui';

import { ZoneListExportModal } from '.';
import { ZonesListContextProvider } from '../ZonesList.context';

/* * */

const MODAL_ID = 'zone-list-export-modal';

/* * */

export const openZoneListExportModal = () => {
	openModal({
		children: (
			<DataProviders>
				<MeContextProvider>
					<AgenciesContextProvider>
						<ExportsContextProvider>
							<ZonesListContextProvider>
								<ZonesListExportContextProvider>
									<ZoneListExportModal />
								</ZonesListExportContextProvider>
							</ZonesListContextProvider>
						</ExportsContextProvider>
					</AgenciesContextProvider>
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

export const closeZoneListExportModal = () => {
	closeModal(MODAL_ID);
};

