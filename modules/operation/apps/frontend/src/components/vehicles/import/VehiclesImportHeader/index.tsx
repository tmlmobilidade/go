'use client';

import { useVehiclesImportContext } from '@/components/vehicles/import/VehiclesImport.context';
import { closeVehiclesImportModal } from '@/components/vehicles/import/VehiclesImport.modal';
import { Button, CloseButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function VehiclesImportHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const vehiclesImportContext = useVehiclesImportContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeVehiclesImportModal} type="close" />
			<Tag label={t('default:vehicles.import.VehiclesImportHeader.title')} variant="muted" />
			<Spacer />
			<Button
				disabled={vehiclesImportContext.flags.error != null || vehiclesImportContext.data.importPreview.length === 0}
				label={t('default:vehicles.import.VehiclesImportFile.submit')}
				loading={vehiclesImportContext.flags.isLoading || vehiclesImportContext.flags.isSaving}
				onClick={vehiclesImportContext.actions.createVehicle}
			/>
		</Toolbar>
	);
}
