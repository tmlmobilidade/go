'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Role } from '@tmlmobilidade/go-types-core';
import { hasPermissionResource, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, fetchApiData, HasPermission, IdTag, keepUrlParams, Label, LockButton, SaveButton, Spacer, Toolbar, useStandardFormWatch, useFormFlags, useHandleUpdate, useMeData } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useRolesListData } from '../../list/use-roles-list-data';
import { useRolesDetailFormContext } from '../RolesDetailForm.context';
import { useRolesDetailData } from '../use-roles-detail-data';
import { useRolesDetailRoleId } from '../use-roles-detail-role-id';

/* * */

export function RolesDetailHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const router = useRouter();

	const { roleId } = useRolesDetailRoleId();

	const { actions, flags, form } = useRolesDetailFormContext();

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
				<SaveButton
					isDisabled={!flags.updateEnabled}
					isLoading={flags.}
					onClick={actions.save}
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
