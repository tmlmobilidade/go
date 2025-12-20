'use client';

/* * */

import { AlertTagPublishStatus } from '@/components/common/AlertTagPublishStatus';
import { useScheduledDetailContext } from '@/components/scheduled/detail/ScheduledDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { DeleteButton, HasPermission, keepUrlParams, LockButton, SaveButton } from '@tmlmobilidade/ui';
import { CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function ScheduledDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const scheduledDetailContext = useScheduledDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.alerts.SCHEDULED_LIST));
	};

	// const handleDuplicate = () => {
	// 	const id = scheduledDetailContext.data.id;
	// 	router.replace(`${PAGE_ROUTES.alerts.SCHEDULED_DETAIL('new')}?copy=${id}`);
	// };

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />
			<AlertTagPublishStatus value={scheduledDetailContext.data.alert?.publish_status} />
			<Label size="lg" caps>{scheduledDetailContext.data.id}</Label>

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
					isDisabled={!scheduledDetailContext.flags.canSave}
					isLoading={scheduledDetailContext.flags.isSaving}
					onClick={scheduledDetailContext.actions.save}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.alerts_scheduled.actions.lock}
				scope={PermissionCatalog.all.alerts_scheduled.scope}
			>
				<LockButton
					isDisabled={!scheduledDetailContext.flags.canLock}
					isLoading={scheduledDetailContext.flags.isLocking}
					isLocked={scheduledDetailContext.data.alert?.is_locked}
					onClick={scheduledDetailContext.actions.lock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.alerts_scheduled.actions.delete}
				scope={PermissionCatalog.all.alerts_scheduled.scope}
			>
				<DeleteButton
					confirmMessage="Tem a certeza que pretende eliminar este Alerta? Esta ação é irreversível."
					confirmTitle="Eliminar Alerta"
					isDisabled={!scheduledDetailContext.flags.canDelete}
					isLoading={scheduledDetailContext.flags.isDeleting}
					onDelete={scheduledDetailContext.actions.delete}
					showConfirmation={true}
				/>
			</HasPermission>

		</Toolbar>
	);

	//
}
