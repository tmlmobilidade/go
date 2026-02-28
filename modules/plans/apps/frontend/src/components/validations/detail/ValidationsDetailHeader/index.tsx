'use client';

/* * */

import { openApprovePlanModal } from '@/components/validations/detail/ApprovePlanModal';
import { openRequestApprovalModalModal } from '@/components/validations/detail/RequestApprovalModal';
import { useValidationsDetailContext } from '@/contexts/ValidationsDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, CloseButton, HasPermission, ProcessingStatusTag, Spacer, Tag, Toolbar, ValidityStatusTag } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

/* * */

export function ValidationsDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const validationsDetailContext = useValidationsDetailContext();

	//
	// B. Transform data

	const canApproveIntoPlan = useMemo(() => {
		if (validationsDetailContext.data.validation?.processing_status !== 'complete') return false;
		if (validationsDetailContext.data.validation?.validity_status !== 'valid') return false;
		return true;
	}, [
		validationsDetailContext.data.validation?.processing_status,
		validationsDetailContext.data.validation?.validity_status,
	]);

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
			<ProcessingStatusTag value={validationsDetailContext.data.validation?.processing_status} />
			<ValidityStatusTag value={validationsDetailContext.data.validation?.validity_status} />
			<Tag label={validationsDetailContext.data.validation?.gtfs_agency.agency_id} variant="secondary" />

			<Spacer />

			{canApproveIntoPlan && (
				<HasPermission
					action={PermissionCatalog.all.gtfs_validations.actions.request_approval}
					resourceKey="agency_ids"
					scope={PermissionCatalog.all.gtfs_validations.scope}
					value={validationsDetailContext.data.validation.gtfs_agency.agency_id}
				>
					<Button
						disabled={validationsDetailContext.flags.loading || validationsDetailContext.data.validation.notification_sent}
						label="Pedir aprovação"
						onClick={handleRequestApproval}
						variant="secondary"
					/>
				</HasPermission>
			)}

			{canApproveIntoPlan && (
				<HasPermission
					action={PermissionCatalog.all.plans.actions.create}
					resourceKey="agency_ids"
					scope={PermissionCatalog.all.plans.scope}
					value={validationsDetailContext.data.validation.gtfs_agency.agency_id}
				>
					<Button
						disabled={validationsDetailContext.flags.loading}
						label="Aprovar Plano"
						loading={validationsDetailContext.flags.loading}
						onClick={handleApprovePlan}
					/>
				</HasPermission>
			)}

		</Toolbar>
	);

	//
}
