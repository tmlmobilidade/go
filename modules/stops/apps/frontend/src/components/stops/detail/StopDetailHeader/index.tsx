'use client';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { IconWorldShare } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { CloseButton, DeleteButton, HasPermission, IconButton, IdTag, keepUrlParams, LockButton, SaveButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import { StopDetailPatternsMenu } from '../StopDetailPatternsMenu';

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

			<IdTag id={stopDetailContext.data.stop?._id} copyOnClick />

			{stopDetailContext.data.stop?.is_deleted && <Tag label="Paragem Eliminada" variant="danger" />}

			<Spacer />

			<StopDetailPatternsMenu patterns={stopDetailContext.data.stop?.associated_patterns} />

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
