'use client';

/* * */
import { useOrganizationsDetailContext } from '@/components/organizations/detail/OrganizationDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { DeleteButton, HasPermission, keepUrlParams, Label, LockButton, SaveButton } from '@tmlmobilidade/ui';
import { CloseButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function OrganizationDetailHeader() {
	//

	//
	// A. Setup variables

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
			<Tag label={organizationDetailContext.data.id || 'Nova Organização'} variant="muted" />
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
					confirmMessage="Tem a certeza que pretende eliminar este grupo de permissões? Esta ação é irreversível."
					confirmTitle="Eliminar Grupo de Permissões"
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
