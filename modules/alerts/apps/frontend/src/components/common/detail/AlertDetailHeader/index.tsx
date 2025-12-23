'use client';

/* * */

import { useAlertDetailContext } from '@/components/common/detail/AlertDetail.context';
import { AlertDetailPublishStatus } from '@/components/common/detail/AlertDetailPublishStatus';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { DeleteButton, HasPermission, keepUrlParams, LockButton, SaveButton } from '@tmlmobilidade/ui';
import { CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import { AlertDetailAlertType } from '../AlertDetailAlertType';

/* * */

export function AlertDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const alertDetailContext = useAlertDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.alerts.SCHEDULED_LIST));
	};

	// const handleDuplicate = () => {
	// 	const id = alertDetailContext.data.id;
	// 	router.replace(`${PAGE_ROUTES.alerts.SCHEDULED_DETAIL('new')}?copy=${id}`);
	// };

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />
			<AlertDetailPublishStatus />
			<AlertDetailAlertType />
			{/* <AlertTagPublishStatus value={alertDetailContext.data.alert?.publish_status} /> */}
			<Label size="lg" caps>{alertDetailContext.data.id}</Label>

			<Spacer />

			{/* <Button
				icon={<IconCopy size={28} />}
				label="Duplicar"
				onClick={handleDuplicate}
				variant="secondary"
			/> */}

			<HasPermission
				action={PermissionCatalog.all.alerts_scheduled.actions.update}
				scope={PermissionCatalog.all.alerts_scheduled.scope}
			>
				<SaveButton
					isDisabled={!alertDetailContext.flags.canSave}
					isLoading={alertDetailContext.flags.isSaving}
					onClick={alertDetailContext.actions.save}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.alerts_scheduled.actions.lock}
				scope={PermissionCatalog.all.alerts_scheduled.scope}
			>
				<LockButton
					isDisabled={!alertDetailContext.flags.canLock}
					isLoading={alertDetailContext.flags.isLocking}
					isLocked={alertDetailContext.data.alert?.is_locked}
					onClick={alertDetailContext.actions.lock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.alerts_scheduled.actions.delete}
				scope={PermissionCatalog.all.alerts_scheduled.scope}
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
