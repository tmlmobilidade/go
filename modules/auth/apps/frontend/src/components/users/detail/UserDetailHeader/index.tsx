'use client';

/* * */

import { useUserDetailContext } from '@/components/users/detail/UserDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { DeleteButton, HasPermission, IdTag, keepUrlParams, Label, LockButton, SaveButton } from '@tmlmobilidade/ui';
import { CloseButton, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function UserDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const userDetailContext = useUserDetailContext();

	const { t } = useTranslation();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.auth.USERS_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleClose} type="close" />
			<IdTag id={userDetailContext.data.id} copyOnClick />
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
					confirmMessage={t('default:users.detail.Header.DeleteButton.confirm.message')}
					confirmTitle={t('default:users.detail.Header.DeleteButton.confirm.title')}
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
