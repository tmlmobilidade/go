'use client';

/* * */

import { ValidationStatusTag } from '@/components/common/ValidationStatusTag';
import { openApprovePlanModal } from '@/components/validations/detail/ApprovePlanModal';
import { openRequestApprovalModalModal } from '@/components/validations/detail/RequestApprovalModal';
import { useValidationsDetailContext } from '@/contexts/ValidationsDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, CloseButton, HasPermission, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function ValidationsDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const validationsDetailContext = useValidationsDetailContext();
	const { t } = useTranslation('plans');

	//
	// C. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.plans.VALIDATIONS_LIST));
	};

	const handleApprovePlan = () => {
		openApprovePlanModal(validationsDetailContext.data.validation._id);
	};

	const handleRequestApproval = () => {
		openRequestApprovalModalModal(validationsDetailContext.data.validation._id);
	};

	//
	// D. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />

			<Tag label={validationsDetailContext.data.validation?._id} variant="secondary" />
			<ValidationStatusTag status={validationsDetailContext.data.validation?.feeder_status} />
			<Tag label={validationsDetailContext.data.validation?.gtfs_agency.agency_id} variant="secondary" />

			<Spacer />

			{validationsDetailContext.data.validation.feeder_status === 'complete' && (
				<HasPermission
					action={PermissionCatalog.all.gtfs_validations.actions.request_approval}
					resourceKey="agency_ids"
					scope={PermissionCatalog.all.gtfs_validations.scope}
					value={validationsDetailContext.data.validation.gtfs_agency.agency_id}
				>
					<Button
						disabled={validationsDetailContext.flags.loading || validationsDetailContext.data.validation.notification_sent}
						label={t('validations.detail.Header.request_approval_button')}
						onClick={handleRequestApproval}
						variant="secondary"
					/>
				</HasPermission>
			)}

			{validationsDetailContext.data.validation.feeder_status === 'complete' && (
				<HasPermission
					action={PermissionCatalog.all.plans.actions.create}
					resourceKey="agency_ids"
					scope={PermissionCatalog.all.plans.scope}
					value={validationsDetailContext.data.validation.gtfs_agency.agency_id}
				>
					<Button
						disabled={validationsDetailContext.flags.loading}
						label={t('validations.detail.Header.approve_plan_button')}
						loading={validationsDetailContext.flags.loading}
						onClick={handleApprovePlan}
					/>
				</HasPermission>
			)}

		</Toolbar>
	);

	//
}
