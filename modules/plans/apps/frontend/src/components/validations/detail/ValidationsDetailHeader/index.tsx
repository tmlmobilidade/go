/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { openApprovePlanModal } from '@/components/validations/detail/ApprovePlanModal';
import { openRequestApprovalModalModal } from '@/components/validations/detail/RequestApprovalModal';
import { useValidationsDetailContext } from '@/components/validations/detail/ValidationsDetailForm.context';
import { useValidationsAgencies } from '@/components/validations/shared/use-validations-agencies';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type ProcessingStatus } from '@tmlmobilidade/go-types-shared';
import { AgencyTag, Button, CloseButton, HasPermission, IdTag, ProcessingStatusDisplay, Spacer, Toolbar, useMeContext, ValidityStatusDisplay } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

/* * */

export function ValidationsDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();
	const validationsDetailContext = useValidationsDetailContext();
	const { data: agenciesData } = useValidationsAgencies({
		permissions: {
			actions: [PermissionCatalog.all.gtfs_validations.actions.read],
			scope: PermissionCatalog.all.gtfs_validations.scope,
		},
	});

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
				value: validationsDetailContext.data.validation.agency_id,
			},
		]);
	}, [
		meContext.data.user?.permissions,
		validationsDetailContext.data.validation.agency_id,
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
			<IdTag id={validationsDetailContext.data.validation?._id} copyOnClick />
			<AgencyTag
				agencyId={validationsDetailContext.data.validation?.agency_id}
				data={agenciesData}
				showShortName
			/>

			<ProcessingStatusDisplay
				disabled={!hasPermissionToChangeProcessingStatus}
				onChange={handleUpdateProcessingStatus}
				value={validationsDetailContext.data.validation?.processing_status}
			/>

			<ValidityStatusDisplay value={validationsDetailContext.data.validation?.validity_status} />

			<Spacer />

			{validationsDetailContext.flags.can_approve && (
				<HasPermission
					action={PermissionCatalog.all.gtfs_validations.actions.request_approval}
					resourceKey="agency_ids"
					scope={PermissionCatalog.all.gtfs_validations.scope}
					value={validationsDetailContext.data.validation.agency_id}
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
					value={validationsDetailContext.data.validation.agency_id}
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
