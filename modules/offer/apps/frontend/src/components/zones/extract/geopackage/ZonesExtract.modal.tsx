'use client';

import { closeModal, openModal } from '@tmlmobilidade/ui';

import { ZonesExtract } from './ZonesExtract';
import { ZonesExtractFormContextProvider } from './ZonesExtractForm.context';

/* * */

const MODAL_ID = 'zones-extract-geopackage';

export function openZonesExtractGeopackageModal() {
	openModal({
		children: (
			<ZonesExtractFormContextProvider>
				<ZonesExtract />
			</ZonesExtractFormContextProvider>
		),
		modalId: MODAL_ID,
		padding: 0,
		size: 'lg',
		withCloseButton: false,
	});
}

export function closeZonesExtractGeopackageModal() {
	closeModal(MODAL_ID);
}
