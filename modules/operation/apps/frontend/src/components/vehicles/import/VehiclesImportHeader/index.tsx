'use client';

import { useVehiclesImportContext } from '@/components/vehicles/import/VehiclesImport.context';
import { closeVehiclesImportModal } from '@/components/vehicles/import/VehiclesImport.modal';
import { IconPlus } from '@tabler/icons-react';
import { Button, CloseButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function VehiclesImportHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default', { keyPrefix: 'vehicles.import.VehiclesImportHeader' });

	const vehiclesImportContext = useVehiclesImportContext();
	const createCount = vehiclesImportContext.data.counters.created;
	const createLabel = createCount > 0
		? t('create', { count: createCount })
		: t('create_empty');

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeVehiclesImportModal} type="close" />
			<Tag label={t('title')} variant="muted" />
			<Spacer />
			<Button
				disabled={vehiclesImportContext.flags.error != null || createCount === 0}
				icon={<IconPlus size={16} />}
				label={createLabel}
				loading={vehiclesImportContext.flags.isLoading || vehiclesImportContext.flags.isSaving}
				onClick={vehiclesImportContext.actions.saveVehicles}
			/>
		</Toolbar>
	);
}
