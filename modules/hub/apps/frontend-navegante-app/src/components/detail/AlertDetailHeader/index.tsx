'use client';

/* * */

import { useAlertDetailContext } from '@/components/detail/AlertDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { CloseButton, DeleteButton, DuplicateButton, HasPermission, IdTag, keepUrlParams, LockButton, PublishStatusTag, SaveButton, Spacer, Toolbar, useContextFormWatch, useMeContext } from '@tmlmobilidade/ui';
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

	const publishStatusValue = useContextFormWatch({ control: alertDetailContext.form.instance.control, name: 'publish_status' });

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
	}, [meContext.actions, alertDetailContext.data.alert.agency_id, alertDetailContext.data.alert.reference_type]);

	//
	// C. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.alerts.ALERTS_LIST));
	};

	//
	// D. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />

			<IdTag id={alertDetailContext.data.id} copyOnClick />

			<PublishStatusTag
				disabled={!hasPermissionToChangePublishStatus}
				onChange={value => alertDetailContext.form.instance.setValue('publish_status', value, { shouldDirty: true })}
				value={publishStatusValue}
			/>

			<Spacer />

			<HasPermission
				action={PermissionCatalog.all.alerts.actions.create}
				scope={PermissionCatalog.all.alerts.scope}
			>
				<DuplicateButton
					isDisabled={!alertDetailContext.flags.canDuplicate}
					isLoading={alertDetailContext.flags.isDuplicating}
					onClick={alertDetailContext.actions.duplicate}
				/>
			</HasPermission>

			<SaveButton
				isDisabled={!alertDetailContext.flags.canSave}
				isLoading={alertDetailContext.flags.isSaving}
				onClick={alertDetailContext.actions.save}
			/>

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
