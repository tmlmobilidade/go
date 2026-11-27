'use client';

import { closeModal, openModal } from '@tmlmobilidade/ui';

import { ZonesExport } from './ZonesExport';
import { ZonesExportFormContextProvider } from './ZonesExportForm.context';

/* * */

const MODAL_ID = 'zones-export-geopackage';

export function openZonesExportGeopackageModal() {
	openModal({
		children: (
			<ZonesExportFormContextProvider>
				<ZonesExport />
			</ZonesExportFormContextProvider>
		),
		modalId: MODAL_ID,
		padding: 0,
		size: 'lg',
		withCloseButton: false,
	});
}

export function closeZonesExportGeopackageModal() {
	closeModal(MODAL_ID);
}
