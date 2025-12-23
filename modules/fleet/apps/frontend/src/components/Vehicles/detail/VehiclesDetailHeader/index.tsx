'use client';

/* * */

import { useVehiclesDetailContext } from '@/contexts/VehiclesDetail.context';
import { IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, CloseButton, DeleteButton, HasPermission, LockButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function VehiclesDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const vehiclesDetailContext = useVehiclesDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.dates.ANNOTATIONS_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />

			<Tag label={vehiclesDetailContext.data.vehicle._id} variant="secondary" />

			<Spacer />

			<HasPermission
				action={PermissionCatalog.all.plans.actions.lock}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.plans.scope}
				value={vehiclesDetailContext.data.vehicle.agency_ids}
			>
				<LockButton
					isLocked={vehiclesDetailContext.data.vehicle.is_locked}
					onClick={vehiclesDetailContext.actions.toggleLock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.dates.actions.update_vehicles}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.dates.scope}
				value={vehiclesDetailContext.data.vehicle.agency_ids}
			>
				<Button
					disabled={vehiclesDetailContext.flags.read_only || vehiclesDetailContext.flags.saving || !vehiclesDetailContext.data.form.isDirty()}
					icon={<IconUpload size={28} />}
					label="Guardar"
					loading={vehiclesDetailContext.flags.saving}
					onClick={vehiclesDetailContext.actions.saveVehicle}
					variant="primary"
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.dates.actions.delete_vehicles}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.dates.scope}
				value={vehiclesDetailContext.data.vehicle.agency_ids}
			>
				<DeleteButton
					confirmMessage="Tem a certeza que deseja apagar esta ocorrência? Esta ação não pode ser revertida."
					confirmTitle="Apagar Anotação"
					onDelete={vehiclesDetailContext.actions.deleteVehicle}
					showConfirmation
				/>
			</HasPermission>

		</Toolbar>
	);

	//
}
