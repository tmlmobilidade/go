'use client';

/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { CloseButton, DeleteButton, HasPermission, keepUrlParams, LockButton, SaveButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function StopDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const stopDetailContext = useStopDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.stops.STOPS_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />
			<Tag label={stopDetailContext.data.stop?._id} variant="id" />
			{stopDetailContext.data.stop?.is_deleted && <Tag label="Paragem Eliminada" variant="danger" />}

			<Spacer />

			<HasPermission
				action={PermissionCatalog.all.stops.actions.update}
				scope={PermissionCatalog.all.stops.scope}
			>
				<SaveButton
					isDisabled={!stopDetailContext.flags.canSave}
					isLoading={stopDetailContext.flags.isSaving}
					onClick={stopDetailContext.actions.save}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.stops.actions.lock}
				scope={PermissionCatalog.all.stops.scope}
			>
				<LockButton
					isDisabled={!stopDetailContext.flags.canLock}
					isLoading={stopDetailContext.flags.isLocking}
					isLocked={stopDetailContext.data.stop?.is_locked}
					onClick={stopDetailContext.actions.lock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.stops.actions.delete}
				scope={PermissionCatalog.all.stops.scope}
			>
				<DeleteButton
					confirmMessage="Tem a certeza que pretende eliminar esta paragem? A paragem ficará indisponível para utilização futura."
					confirmTitle="Eliminar Paragem"
					isDeleted={stopDetailContext.data.stop?.is_deleted}
					isDisabled={!stopDetailContext.flags.canDelete}
					isLoading={stopDetailContext.flags.isDeleting}
					onDelete={stopDetailContext.actions.delete}
					onRestore={stopDetailContext.actions.delete}
					showConfirmation={true}
				/>
			</HasPermission>

		</Toolbar>
	);

	//
}
