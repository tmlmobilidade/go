'use client';

import { useSchoolDetailContext } from '@/components/schools/detail/SchoolDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, LockButton, Spacer, Toolbar, UpdateButton } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function SchoolDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const schoolDetailContext = useSchoolDetailContext();

	//
	// C. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.infrastructure.SCHOOLS_LIST));
	};

	//
	// D. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />

			<IdTag id={schoolDetailContext.data.id} copyOnClick />

			<Spacer />

			<HasPermission
				action={PermissionCatalog.all.schools.actions.update}
				scope={PermissionCatalog.all.schools.scope}
			>
				<UpdateButton
					isDisabled={!schoolDetailContext.flags.canSave}
					isLoading={schoolDetailContext.flags.isSaving}
					onClick={schoolDetailContext.actions.save}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.schools.actions.lock}
				scope={PermissionCatalog.all.schools.scope}
			>
				<LockButton
					isDisabled={!schoolDetailContext.flags.canLock}
					isLoading={schoolDetailContext.flags.isLocking}
					isLocked={schoolDetailContext.data.school?.is_locked}
					onClick={schoolDetailContext.actions.lock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.schools.actions.delete}
				scope={PermissionCatalog.all.schools.scope}
			>
				<DeleteButton
					confirmMessage="Tem a certeza que pretende eliminar esta escola? Esta ação é irreversível."
					confirmTitle="Eliminar escola"
					isDisabled={!schoolDetailContext.flags.canDelete}
					isLoading={schoolDetailContext.flags.isDeleting}
					onDelete={schoolDetailContext.actions.delete}
					showConfirmation={true}
				/>
			</HasPermission>

		</Toolbar>
	);

	//
}
