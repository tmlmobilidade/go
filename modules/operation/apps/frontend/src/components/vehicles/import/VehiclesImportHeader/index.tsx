'use client';

import { closeVehiclesImportModal } from '@/components/vehicles/import/VehiclesImport.modal';
import { CloseButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function VehiclesImportHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeVehiclesImportModal} type="close" />
			<Tag label={t('default:vehicles.import.VehiclesImportHeader.title')} variant="muted" />
			<Spacer />
		</Toolbar>
	);
}
