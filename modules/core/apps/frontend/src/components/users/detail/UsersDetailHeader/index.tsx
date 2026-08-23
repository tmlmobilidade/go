'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { DeleteButton, HasPermission, IdTag, keepUrlParams, Label, LockButton, UpdateButton, useStandardFormWatch } from '@tmlmobilidade/ui';
import { CloseButton, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useUsersDetailUserId } from '../use-users-detail-user-id';
import { useUsersDetailFormContext } from '../UsersDetailForm.context';

/* * */

export function UsersDetailHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const router = useRouter();

	const { userId } = useUsersDetailUserId();

	const { actions, capabilities, form, status } = useUsersDetailFormContext();

	const emailValue = useStandardFormWatch({ control: form.control, name: 'email' });

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.core.USERS_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleClose} type="close" />
			<IdTag id={userId} copyOnClick />
			<Label size="lg" singleLine>{emailValue}</Label>

			<Spacer />

			<HasPermission
				action={PermissionCatalog.all.users.actions.update}
				scope={PermissionCatalog.all.users.scope}
			>
				<UpdateButton
					isDisabled={!capabilities.updateEnabled}
					isLoading={status.isUpdating}
					onClick={actions.update}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.users.actions.lock}
				scope={PermissionCatalog.all.users.scope}
			>
				<LockButton
					isDisabled={!capabilities.lockEnabled}
					isLoading={status.isLocking}
					isLocked={false}
					onClick={actions.lock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.users.actions.delete}
				scope={PermissionCatalog.all.users.scope}
			>
				<DeleteButton
					confirmMessage={t('default:users.detail.Header.DeleteButton.confirm.message')}
					confirmTitle={t('default:users.detail.Header.DeleteButton.confirm.title')}
					isDisabled={!capabilities.deleteEnabled}
					isLoading={status.isDeleting}
					onDelete={actions.delete}
					showConfirmation={true}
				/>
			</HasPermission>

		</Toolbar>
	);
}
