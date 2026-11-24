'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, LockButton, Spacer, Toolbar, UpdateButton } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useVehiclesDetailVehicleId } from '../use-vehicles-detail-vehicle-id';
import { useVehiclesDetailFormContext } from '../VehiclesDetailForm.context';

/* * */

export function VehiclesDetailHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const router = useRouter();

	const { vehicleId } = useVehiclesDetailVehicleId();

	const { actions, agencyIds, capabilities, status } = useVehiclesDetailFormContext();

	const agencyPermissionValue = agencyIds.length ? agencyIds : PermissionCatalog.ALLOW_ALL_FLAG;

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.operation.VEHICLES_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleClose} type="close" />
			<IdTag id={vehicleId} copyOnClick />

			<Spacer />

			<HasPermission
				action={PermissionCatalog.all.vehicles.actions.lock}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.vehicles.scope}
				value={agencyPermissionValue}
			>
				<LockButton
					isDisabled={!capabilities.lockEnabled}
					isLoading={status.isLocking}
					isLocked={status.isLocked}
					onClick={actions.lock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.vehicles.actions.update}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.vehicles.scope}
				value={agencyPermissionValue}
			>
				<UpdateButton
					isDisabled={!capabilities.updateEnabled}
					isLoading={status.isUpdating}
					onClick={actions.update}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.vehicles.actions.delete}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.vehicles.scope}
				value={agencyPermissionValue}
			>
				<DeleteButton
					confirmMessage={t('default:vehicles.detail.VehiclesDetailHeader.DeleteButton.confirm.message')}
					confirmTitle={t('default:vehicles.detail.VehiclesDetailHeader.DeleteButton.confirm.title')}
					isDisabled={!capabilities.deleteEnabled}
					isLoading={status.isDeleting}
					onDelete={actions.delete}
					showConfirmation
				/>
			</HasPermission>
		</Toolbar>
	);
}
