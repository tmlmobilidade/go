'use client';

import { closeVehiclesCreateModal } from '@/components/vehicles/create/VehiclesCreate.modal';
import { CloseButton, CreateButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useVehiclesCreateFormContext } from '../VehiclesCreateForm.context';

/* * */

export function VehiclesCreateHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { actions, capabilities, status } = useVehiclesCreateFormContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeVehiclesCreateModal} type="close" />
			<Tag label={t('default:vehicles.create.VehiclesCreateHeader.title')} variant="secondary" />
			<Spacer />
			<CreateButton
				isDisabled={!capabilities.createEnabled}
				isLoading={status.isCreating}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
