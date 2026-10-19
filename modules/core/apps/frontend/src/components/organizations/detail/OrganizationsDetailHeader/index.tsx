'use client';

import { useOrganizationsDetailFormContext } from '@/components/organizations/detail/OrganizationsDetailForm.context';
import { useOrganizationsDetailOrganizationId } from '@/components/organizations/detail/use-organizations-detail-organization-id';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, Label, LockButton, Spacer, Toolbar, UpdateButton, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useOrganizationsDetailData } from '../use-organizations-detail-data';

/* * */

export function OrganizationsDetailHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const router = useRouter();

	const { organizationId } = useOrganizationsDetailOrganizationId();

	const { data: organizationData } = useOrganizationsDetailData();

	const { actions, capabilities, form, status } = useOrganizationsDetailFormContext();

	const longNameValue = useStandardFormWatch({ control: form.control, name: 'long_name' });

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.core.ORGANIZATIONS_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />
			<IdTag id={organizationId} copyOnClick />
			<Label size="lg" singleLine>{longNameValue}</Label>

			<Spacer />

			<HasPermission
				action={PermissionCatalog.all.organizations.actions.update}
				scope={PermissionCatalog.all.organizations.scope}
			>
				<UpdateButton
					isDisabled={!capabilities.updateEnabled}
					isLoading={status.isUpdating}
					onClick={actions.update}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.organizations.actions.lock}
				scope={PermissionCatalog.all.organizations.scope}
			>
				<LockButton
					isLoading={status.isLocking}
					isLocked={organizationData?.is_locked}
					onClick={actions.lock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.organizations.actions.delete}
				scope={PermissionCatalog.all.organizations.scope}
			>
				<DeleteButton
					confirmMessage={t('default:organizations.detail.Header.DeleteButton.Confirm.message')}
					confirmTitle={t('default:organizations.detail.Header.DeleteButton.Confirm.title')}
					isDisabled={!capabilities.deleteEnabled}
					isLoading={status.isDeleting}
					onDelete={actions.delete}
					showConfirmation
				/>
			</HasPermission>

		</Toolbar>
	);
}
