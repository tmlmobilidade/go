'use client';

/* * */

import { useUserDetailContext } from '@/components/users/detail/UserDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { DeleteButton, HasPermission, keepUrlParams, Label, LockButton, SaveButton } from '@tmlmobilidade/ui';
import { CloseButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function UserDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const userDetailContext = useUserDetailContext();

	const { t: tGlobal } = useTranslation('global', { keyPrefix: 'operations' });
	const { t: tAuth } = useTranslation('auth', { keyPrefix: 'users.detail.header' });

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.auth.USERS_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={handleClose} type="close" />
			<Tag label={userDetailContext.data.id || tAuth('newUserButtonLabel')} variant="muted" />
			<Label size="lg" singleLine>{userDetailContext.data.form.values.email}</Label>

			<Spacer />

			<HasPermission
				action={PermissionCatalog.all.users.actions.update}
				scope={PermissionCatalog.all.users.scope}
			>
				<SaveButton
					isDisabled={!userDetailContext.flags.canSave}
					isLoading={userDetailContext.flags.isSaving}
					onClick={userDetailContext.actions.save}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.users.actions.lock}
				scope={PermissionCatalog.all.users.scope}
			>
				<LockButton
					isDisabled={!userDetailContext.flags.canLock}
					isLoading={userDetailContext.flags.isLocking}
					isLocked={userDetailContext.data.user?.is_locked}
					onClick={userDetailContext.actions.lock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.users.actions.delete}
				scope={PermissionCatalog.all.users.scope}
			>
				<DeleteButton
					confirmMessage="Tem a certeza que pretende eliminar este utilizador? Esta ação é irreversível."
					confirmTitle="Eliminar Utilizador"
					isDisabled={!userDetailContext.flags.canDelete}
					isLoading={userDetailContext.flags.isDeleting}
					onDelete={userDetailContext.actions.delete}
					onRestore={userDetailContext.actions.delete}
					showConfirmation={true}
				/>
			</HasPermission>

		</Toolbar>
	);

	//
}
