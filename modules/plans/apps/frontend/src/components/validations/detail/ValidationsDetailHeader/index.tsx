/* eslint-disable react-hooks/exhaustive-deps */
'use client';

/* * */

import { openApprovePlanModal } from '@/components/validations/detail/ApprovePlanModal';
import { openRequestApprovalModalModal } from '@/components/validations/detail/RequestApprovalModal';
import { useValidationsDetailContext } from '@/contexts/ValidationsDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog, type ProcessingStatus } from '@tmlmobilidade/types';
import { AgencyTag, Button, CloseButton, HasPermission, ProcessingStatusTag, Spacer, Tag, Toolbar, useMeContext, ValidityStatusTag } from '@tmlmobilidade/ui';
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
	const meContext = useMeContext();

	//
	// B. Transform data

	const hasPermissionToChangeProcessingStatus = useMemo(() => {
		// User can change processing status if they have permission
		// for the agency and reference type.
		return meContext.actions.hasPermissionResource([
			{
				action: PermissionCatalog.all.gtfs_validations.actions.update_processing_status,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.gtfs_validations.scope,
				value: validationsDetailContext.data.validation.gtfs_agency.agency_id,
			},
		]);
	}, [
		meContext.data.user?.permissions,
		validationsDetailContext.data.validation.gtfs_agency.agency_id,
	]);

	//
	// C. Handle actions

	const handleUpdateProcessingStatus = async (status: ProcessingStatus) => {
		await validationsDetailContext.actions.updateProcessingStatus(status);
	};

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
			<AgencyTag agencyId={validationsDetailContext.data.validation?.gtfs_agency.agency_id} />

			<ProcessingStatusTag
				disabled={!hasPermissionToChangeProcessingStatus}
				onChange={handleUpdateProcessingStatus}
				value={validationsDetailContext.data.validation?.processing_status}
			/>

			<ValidityStatusTag value={validationsDetailContext.data.validation?.validity_status} />

			<Spacer />

			{validationsDetailContext.flags.can_approve && (
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

			{validationsDetailContext.flags.can_approve && (
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
