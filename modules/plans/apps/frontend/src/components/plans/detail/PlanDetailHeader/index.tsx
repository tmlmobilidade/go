'use client';

/* * */

import { openPlanChangeModal } from '@/components/plans/change/PlanChange.modal';
import { usePlanDetailContext } from '@/components/plans/detail/PlanDetail.context';
import { IconRefresh } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { CloseButton, DeleteButton, HasPermission, IconButton, IdTag, LockButton, SaveButton, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function PlanDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const planDetailContext = usePlanDetailContext();
	const { t } = useTranslation();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.plans.APPROVED_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />

			<IdTag id={planDetailContext.data.plan._id} copyOnClick />

			<Spacer />

			<HasPermission
				action={PermissionCatalog.all.plans.actions.update}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.plans.scope}
				value={planDetailContext.data.plan.gtfs_agency.agency_id}
			>
				<SaveButton
					isDisabled={!planDetailContext.flags.canSave}
					isLoading={planDetailContext.flags.isSaving}
					onClick={planDetailContext.actions.save}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.plans.actions.update_gtfs_plan}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.plans.scope}
				value={planDetailContext.data.plan.gtfs_agency.agency_id}
			>
				<IconButton
					disabled={!planDetailContext.flags.canChangePlan}
					icon={<IconRefresh />}
					onClick={() => openPlanChangeModal(planDetailContext.data.plan._id)}
					tooltip={t('plans:plans.detail.PlanDetailHeader.change_plan_tooltip')}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.plans.actions.lock}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.plans.scope}
				value={planDetailContext.data.plan.gtfs_agency.agency_id}
			>
				<LockButton
					isDisabled={!planDetailContext.flags.canLock}
					isLoading={planDetailContext.flags.isLocking}
					isLocked={planDetailContext.data.plan?.is_locked}
					onClick={planDetailContext.actions.lock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.plans.actions.delete}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.plans.scope}
				value={planDetailContext.data.plan.gtfs_agency.agency_id}
			>
				<DeleteButton
					confirmMessage={t('plans:plans.detail.PlanDetailHeader.actions.delete.confirm_message')}
					confirmTitle={t('plans:plans.detail.PlanDetailHeader.actions.delete.confirm_title')}
					isDisabled={!planDetailContext.flags.canDelete}
					isLoading={planDetailContext.flags.isDeleting}
					onDelete={planDetailContext.actions.delete}
					onRestore={planDetailContext.actions.delete}
					showConfirmation={true}
				/>
			</HasPermission>

		</Toolbar>
	);

	//
}
