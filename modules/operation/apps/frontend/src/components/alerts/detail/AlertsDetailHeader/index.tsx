'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { hasPermissionResource, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, DuplicateButton, HasPermission, IdTag, keepUrlParams, LockButton, PublishStatusDisplay, Spacer, Toolbar, UpdateButton, useMeData, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { useAlertsDetailFormContext } from '../AlertsDetailForm.context';
import { useAlertsDetailAlertId } from '../use-alerts-detail-alert-id';
import { useAlertsDetailData } from '../use-alerts-detail-data';

/* * */

export function AlertsDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: meData } = useMeData();

	const { alertId } = useAlertsDetailAlertId();

	const { data: alertData } = useAlertsDetailData();

	const { actions, capabilities, form, status } = useAlertsDetailFormContext();

	const publishStatusValue = useStandardFormWatch({ control: form.control, name: 'publish_status' });

	//
	// B. Transform data

	const hasPermissionToChangePublishStatus = useMemo(() => {
		const hasPermissionForAgencyId = hasPermissionResource(meData?.permissions, {
			requiredPermission: { action: 'update', scope: 'alerts' },
			requiredValue: alertData?.agency_id,
			resourceKey: 'agency_ids',
		});
		const hasPermissionForReferenceType = hasPermissionResource(meData?.permissions, {
			requiredPermission: { action: 'update', scope: 'alerts' },
			requiredValue: alertData?.reference_type,
			resourceKey: 'reference_types',
		});
		return hasPermissionForAgencyId && hasPermissionForReferenceType;
	}, [alertData?.agency_id, alertData?.reference_type, meData?.permissions]);

	//
	// C. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.operation.ALERTS_LIST));
	};

	//
	// D. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />
			<IdTag id={alertId} copyOnClick />

			<PublishStatusDisplay
				disabled={!hasPermissionToChangePublishStatus}
				onChange={value => form.setValue('publish_status', value, { shouldDirty: true })}
				value={publishStatusValue}
			/>

			<Spacer />

			<HasPermission
				action={PermissionCatalog.all.alerts.actions.create}
				scope={PermissionCatalog.all.alerts.scope}
			>
				<DuplicateButton
					isDisabled={!capabilities.duplicateEnabled}
					isLoading={status.isDuplicating}
					onClick={actions.duplicate}
				/>
			</HasPermission>

			<UpdateButton
				isDisabled={!capabilities.updateEnabled}
				isLoading={status.isUpdating}
				onClick={actions.update}
			/>

			<HasPermission
				action={PermissionCatalog.all.alerts.actions.lock}
				scope={PermissionCatalog.all.alerts.scope}
			>
				<LockButton
					isDisabled={!capabilities.lockEnabled}
					isLoading={status.isLocking}
					isLocked={alertData?.is_locked}
					onClick={actions.lock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.alerts.actions.delete}
				scope={PermissionCatalog.all.alerts.scope}
			>
				<DeleteButton
					confirmMessage="Tem a certeza que pretende eliminar este Alerta? Esta ação é irreversível."
					confirmTitle="Eliminar Alerta"
					isDisabled={!capabilities.deleteEnabled}
					isLoading={status.isDeleting}
					onDelete={actions.delete}
					showConfirmation={true}
				/>
			</HasPermission>

		</Toolbar>
	);
}
