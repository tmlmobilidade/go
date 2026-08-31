'use client';

import { useSchoolsDetailFormContext } from '@/components/schools/detail/SchoolsDetailForm.context';
import { useSchoolsDetailSchoolData } from '@/components/schools/detail/use-schools-detail-school-data';
import { useSchoolsDetailSchoolId } from '@/components/schools/detail/use-schools-detail-school-id';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { AgencyTag, CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, Label, LockButton, PublishStatusDisplay, Spacer, Toolbar, UpdateButton, useAgenciesContext, useMeContext, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function SchoolDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { t } = useTranslation();

	const meContext = useMeContext();

	const agenciesContext = useAgenciesContext();

	const { schoolId } = useSchoolsDetailSchoolId();

	const { data: schoolData } = useSchoolsDetailSchoolData();

	const { actions, capabilities, form, status } = useSchoolsDetailFormContext();

	const nameValue = useStandardFormWatch({ control: form.control, name: 'name' });

	const publishStatusValue = useStandardFormWatch({ control: form.control, name: 'publish_status' });

	//
	// B. Transform data

	const hasPermissionToChangePublishStatus = useMemo(() => {
		return meContext.actions.hasPermissionResource([{
			action: PermissionCatalog.all.schools.actions.update_publish_status,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.schools.scope,
			value: schoolData?.agency_id,
		}]);
	}, [meContext.actions, schoolData?.agency_id]);

	//
	// C. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.infrastructure.SCHOOLS_LIST));
	};

	//
	// D. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />
			<IdTag id={schoolId} copyOnClick />
			<AgencyTag
				agencyId={schoolData?.agency_id ?? ''}
				data={agenciesContext.data.raw}
				showName
			/>
			<Label size="lg" singleLine>{nameValue}</Label>

			<PublishStatusDisplay
				disabled={!hasPermissionToChangePublishStatus || !capabilities?.editEnabled}
				onChange={value => form.setValue('publish_status', value, { shouldDirty: true })}
				value={publishStatusValue}
			/>

			<Spacer />

			<HasPermission
				action={PermissionCatalog.all.schools.actions.update}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.schools.scope}
				value={schoolData?.agency_id}
			>
				<UpdateButton
					isDisabled={!capabilities?.updateEnabled}
					isLoading={status.isUpdating}
					onClick={actions.update}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.schools.actions.lock}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.schools.scope}
				value={schoolData?.agency_id}
			>
				<LockButton
					isDisabled={!capabilities?.lockEnabled}
					isLoading={status.isLocking}
					isLocked={status.isLocked}
					onClick={actions.lock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.schools.actions.delete}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.schools.scope}
				value={schoolData?.agency_id}
			>
				<DeleteButton
					confirmMessage={t('schools:detail.SchoolDetailHeader.delete.confirm_message')}
					confirmTitle={t('schools:detail.SchoolDetailHeader.delete.confirm_title')}
					isDisabled={!capabilities?.deleteEnabled}
					isLoading={status.isDeleting}
					onDelete={actions.delete}
					showConfirmation
				/>
			</HasPermission>

		</Toolbar>
	);
}
