'use client';

/* * */

import { useAlertDetailContext } from '@/components/detail/AlertDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { DeleteButton, HasPermission, keepUrlParams, LockButton, PublishStatusTag, SaveButton, useMeContext } from '@tmlmobilidade/ui';
import { CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

/* * */

export function AlertDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();
	const alertDetailContext = useAlertDetailContext();

	//
	// B. Transform data

	const hasPermissionToChangePublishStatus = useMemo(() => {
		// User can change publish status if they have permission
		// for the agency and reference type.
		return meContext.actions.hasPermissionResource([
			{
				action: PermissionCatalog.all.alerts.actions.update_publish_status,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.alerts.scope,
				value: alertDetailContext.data.alert.agency_id,
			},
			{
				action: PermissionCatalog.all.alerts.actions.update_publish_status,
				resource_key: 'reference_types',
				scope: PermissionCatalog.all.alerts.scope,
				value: alertDetailContext.data.alert.reference_type,
			},
		]);
	}, [
		meContext.data.user?.permissions,
		alertDetailContext.data.alert.agency_id,
		alertDetailContext.data.alert.reference_type,
	]);

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.alerts.ALERTS_LIST));
	};

	// const handleDuplicate = () => {
	// 	const id = alertDetailContext.data.id;
	// 	router.replace(`${PAGE_ROUTES.alerts.ALERTS_DETAIL('new')}?copy=${id}`);
	// };

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />

			<PublishStatusTag
				disabled={!hasPermissionToChangePublishStatus}
				onChange={value => alertDetailContext.data.form.setFieldValue('publish_status', value)}
				value={alertDetailContext.data.form.values.publish_status}
			/>

			<Label size="lg" caps>{alertDetailContext.data.id}</Label>

			<Spacer />

			{/* <Button
				icon={<IconCopy size={28} />}
				label="Duplicar"
				onClick={handleDuplicate}
				variant="secondary"
			/> */}

			<HasPermission
				action={PermissionCatalog.all.alerts.actions.update}
				scope={PermissionCatalog.all.alerts.scope}
			>
				<SaveButton
					isDisabled={!alertDetailContext.flags.canSave}
					isLoading={alertDetailContext.flags.isSaving}
					onClick={alertDetailContext.actions.save}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.alerts.actions.lock}
				scope={PermissionCatalog.all.alerts.scope}
			>
				<LockButton
					isDisabled={!alertDetailContext.flags.canLock}
					isLoading={alertDetailContext.flags.isLocking}
					isLocked={alertDetailContext.data.alert?.is_locked}
					onClick={alertDetailContext.actions.lock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.alerts.actions.delete}
				scope={PermissionCatalog.all.alerts.scope}
			>
				<DeleteButton
					confirmMessage="Tem a certeza que pretende eliminar este Alerta? Esta ação é irreversível."
					confirmTitle="Eliminar Alerta"
					isDisabled={!alertDetailContext.flags.canDelete}
					isLoading={alertDetailContext.flags.isDeleting}
					onDelete={alertDetailContext.actions.delete}
					showConfirmation={true}
				/>
			</HasPermission>

		</Toolbar>
	);

	//
}
