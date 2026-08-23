'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, Label, LockButton, Spacer, Toolbar, UpdateButton, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useRolesDetailFormContext } from '../RolesDetailForm.context';
import { useRolesDetailRoleId } from '../use-roles-detail-role-id';

/* * */

export function RolesDetailHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const router = useRouter();

	const { roleId } = useRolesDetailRoleId();

	const { actions, capabilities, form, status } = useRolesDetailFormContext();

	const nameValue = useStandardFormWatch({ control: form.control, name: 'name' });

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.core.ROLES_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />
			<IdTag id={roleId} copyOnClick />
			<Label size="lg" singleLine>{nameValue}</Label>

			<Spacer />

			<HasPermission
				action={PermissionCatalog.all.roles.actions.update}
				scope={PermissionCatalog.all.roles.scope}
			>
				<UpdateButton
					disabled={!capabilities.updateEnabled}
					loading={status.isUpdating}
					onClick={actions.update}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.roles.actions.lock}
				scope={PermissionCatalog.all.roles.scope}
			>
				<LockButton
					isLoading={status.isLocking}
					isLocked={status.isLocked}
					onClick={actions.lock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.roles.actions.delete}
				scope={PermissionCatalog.all.roles.scope}
			>
				<DeleteButton
					confirmMessage={t('default:roles.detail.header.DeleteButton.confirm.message')}
					confirmTitle={t('default:roles.detail.header.DeleteButton.confirm.title')}
					isDisabled={!capabilities.deleteEnabled}
					isLoading={status.isDeleting}
					onDelete={actions.delete}
					showConfirmation
				/>
			</HasPermission>

		</Toolbar>
	);
}
