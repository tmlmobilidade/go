'use client';

import { GtfsExportModalBody } from '@/components/plans/exporter/GtfsExportModalBody';
import { GtfsExportModalHeader } from '@/components/plans/exporter/GtfsExportModalHeader';
import { closeModal } from '@tmlmobilidade/ui';

import { GTFS_EXPORT_MODAL_ID } from './constants';

/* * */

export function GtfsExportModal() {
	//

	//
	// A. Setup variables

	//
	// B. Render components

	return (
		<div style={{ minHeight: '200px' }}>
			<GtfsExportModalHeader onClose={() => closeModal(GTFS_EXPORT_MODAL_ID)} />
			<GtfsExportModalBody />
		</div>
	);

	//
}
