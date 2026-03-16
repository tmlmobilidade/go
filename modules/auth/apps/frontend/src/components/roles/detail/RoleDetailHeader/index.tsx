'use client';

/* * */

import { useRoleDetailContext } from '@/components/roles/detail/RoleDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, Label, LockButton, SaveButton, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function RoleDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const roleDetailContext = useRoleDetailContext();

	const { t } = useTranslation();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.auth.ROLES_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />
			<IdTag id={roleDetailContext.data.id} copyOnClick />
			<Label size="lg" singleLine>{roleDetailContext.data.form.values.name}</Label>

			<Spacer />

			<HasPermission
				action={PermissionCatalog.all.roles.actions.update}
				scope={PermissionCatalog.all.roles.scope}
			>
				<SaveButton
					isDisabled={!roleDetailContext.flags.canSave}
					isLoading={roleDetailContext.flags.isSaving}
					onClick={roleDetailContext.actions.save}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.roles.actions.lock}
				scope={PermissionCatalog.all.roles.scope}
			>
				<LockButton
					isLoading={roleDetailContext.flags.isLocking}
					isLocked={roleDetailContext.data.role?.is_locked}
					onClick={roleDetailContext.actions.lock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.roles.actions.delete}
				scope={PermissionCatalog.all.roles.scope}
			>
				<DeleteButton
					confirmMessage={t('default:roles.detail.header.DeleteButton.confirm.message')}
					confirmTitle={t('default:roles.detail.header.DeleteButton.confirm.title')}
					isDisabled={!roleDetailContext.flags.canDelete}
					isLoading={roleDetailContext.flags.isDeleting}
					onDelete={roleDetailContext.actions.delete}
					onRestore={roleDetailContext.actions.delete}
					showConfirmation={true}
				/>
			</HasPermission>

		</Toolbar>
	);

	//
}
