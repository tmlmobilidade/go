'use client';
import { useOrganizationsDetailContext } from '@/components/organizations/detail/OrganizationDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, Label, LockButton, SaveButton, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function OrganizationDetailHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const router = useRouter();
	const organizationDetailContext = useOrganizationsDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.auth.ORGANIZATIONS_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />
			<IdTag id={organizationDetailContext.data.id} copyOnClick />
			<Label size="lg" singleLine>{organizationDetailContext.data.form.values.long_name}</Label>

			<Spacer />

			<HasPermission
				action={PermissionCatalog.all.organizations.actions.update}
				scope={PermissionCatalog.all.organizations.scope}
			>
				<SaveButton
					isDisabled={!organizationDetailContext.flags.canSave}
					isLoading={organizationDetailContext.flags.isSaving}
					onClick={organizationDetailContext.actions.save}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.organizations.actions.lock}
				scope={PermissionCatalog.all.organizations.scope}
			>
				<LockButton
					isLoading={organizationDetailContext.flags.isLocking}
					isLocked={organizationDetailContext.data.organization?.is_locked}
					onClick={organizationDetailContext.actions.lock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.organizations.actions.delete}
				scope={PermissionCatalog.all.organizations.scope}
			>
				<DeleteButton
					confirmMessage={t('default:organizations.detail.Header.DeleteButton.Confirm.message')}
					confirmTitle={t('default:organizations.detail.Header.DeleteButton.Confirm.title')}
					isDisabled={!organizationDetailContext.flags.canDelete}
					isLoading={organizationDetailContext.flags.isDeleting}
					onDelete={organizationDetailContext.actions.delete}
					onRestore={organizationDetailContext.actions.delete}
					showConfirmation={true}
				/>
			</HasPermission>

		</Toolbar>
	);

	//
}
