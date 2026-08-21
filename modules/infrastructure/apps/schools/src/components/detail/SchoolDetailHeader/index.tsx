'use client';

import { useSchoolDetailContext } from '@/components/detail/SchoolDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, DuplicateButton, HasPermission, IdTag, keepUrlParams, LockButton, PublishStatusDisplay, SaveButton, Spacer, Toolbar, useContextFormWatch, useMeContext } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

/* * */

export function SchoolDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();
	const schoolDetailContext = useSchoolDetailContext();

	const publishStatusValue = useContextFormWatch({ control: schoolDetailContext.form.instance.control, name: 'publish_status' });

	//
	// B. Transform data

	const hasPermissionToChangePublishStatus = useMemo(() => {
		// User can change publish status if they have permission
		// for the agency and reference type.
		return meContext.actions.hasPermissionResource([
			{
				action: PermissionCatalog.all.alerts.actions.update_publish_status,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.alerts.scope,
				value: schoolDetailContext.data.school.agency_id,
			},
			{
				action: PermissionCatalog.all.alerts.actions.update_publish_status,
				resource_key: 'reference_types',
				scope: PermissionCatalog.all.alerts.scope,
				value: schoolDetailContext.data.school.reference_type,
			},
		]);
	}, [meContext.actions, schoolDetailContext.data.school.agency_id, schoolDetailContext.data.school.reference_type]);

	//
	// C. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.alerts.ALERTS_LIST));
	};

	//
	// D. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />

			<IdTag id={schoolDetailContext.data.id} copyOnClick />

			<PublishStatusDisplay
				disabled={!hasPermissionToChangePublishStatus}
				onChange={value => schoolDetailContext.form.instance.setValue('publish_status', value, { shouldDirty: true })}
				value={publishStatusValue}
			/>

			<Spacer />

			<HasPermission
				action={PermissionCatalog.all.alerts.actions.create}
				scope={PermissionCatalog.all.alerts.scope}
			>
				<DuplicateButton
					isDisabled={!schoolDetailContext.flags.canDuplicate}
					isLoading={schoolDetailContext.flags.isDuplicating}
					onClick={schoolDetailContext.actions.duplicate}
				/>
			</HasPermission>

			<SaveButton
				isDisabled={!schoolDetailContext.flags.canSave}
				isLoading={schoolDetailContext.flags.isSaving}
				onClick={schoolDetailContext.actions.save}
			/>

			<HasPermission
				action={PermissionCatalog.all.alerts.actions.lock}
				scope={PermissionCatalog.all.alerts.scope}
			>
				<LockButton
					isDisabled={!schoolDetailContext.flags.canLock}
					isLoading={schoolDetailContext.flags.isLocking}
					isLocked={schoolDetailContext.data.school?.is_locked}
					onClick={schoolDetailContext.actions.lock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.alerts.actions.delete}
				scope={PermissionCatalog.all.alerts.scope}
			>
				<DeleteButton
					confirmMessage="Tem a certeza que pretende eliminar este Alerta? Esta ação é irreversível."
					confirmTitle="Eliminar Alerta"
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
