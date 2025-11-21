'use client';

/* * */

import { ValidationStatusTag } from '@/components/common/ValidationStatusTag';
import { openApprovePlanModal } from '@/components/validations/detail/ApprovePlanModal';
import { openRequestApprovalModalModal } from '@/components/validations/detail/RequestApprovalModal';
import { useValidationsDetailContext } from '@/contexts/ValidationsDetail.context';
import { IconMailFast, IconRosetteDiscountCheckFilled } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { BackButton, Button, HasPermission, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function ValidationsDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const validationsDetailContext = useValidationsDetailContext();

	//
	// C. Handle actions

	const handleClose = () => {
		const destUrl = keepUrlParams('/validations', window.location.search);
		router.push(destUrl);
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

			<BackButton onClick={handleClose} type="close" />
			<ValidationStatusTag status={validationsDetailContext.data.validation?.feeder_status} />
			<Tag label={validationsDetailContext.data.validation?.gtfs_agency.agency_id} variant="secondary" />
			<Label size="md" caps>{validationsDetailContext.data.validation?._id}</Label>
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
						icon={<IconMailFast />}
						label="Solicitar aprovação à TML"
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
						icon={<IconRosetteDiscountCheckFilled />}
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
