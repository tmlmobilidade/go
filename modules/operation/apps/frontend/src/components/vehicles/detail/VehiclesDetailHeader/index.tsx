'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, Label, LockButton, Spacer, Toolbar, UpdateButton, useStandardFormWatch } from '@tmlmobilidade/ui';
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

	const { actions, capabilities, form, status } = useVehiclesDetailFormContext();

	const licensePlateValue = useStandardFormWatch({ control: form.control, name: 'license_plate' });
	const agencyIdValue = useStandardFormWatch({ control: form.control, name: 'agency_id' });

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
			<Label size="lg" singleLine>{licensePlateValue}</Label>

			<Spacer />

			<HasPermission
				action={PermissionCatalog.all.vehicles.actions.lock}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.vehicles.scope}
				value={agencyIdValue}
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
				value={agencyIdValue}
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
				value={agencyIdValue}
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
