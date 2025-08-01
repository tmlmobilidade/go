'use client';

/* * */

import { ValidationStatusTag } from '@/components/common/ValidationStatusTag';
import { openApprovePlanModal } from '@/components/validations/detail/ApprovePlanModal';
import { openRequestApprovalModalModal } from '@/components/validations/detail/RequestApprovalModal';
import { useValidationsDetailContext } from '@/contexts/ValidationsDetail.context';
import { IconMailFast, IconRosetteDiscountCheckFilled } from '@tabler/icons-react';
import { Permissions } from '@tmlmobilidade/lib';
import { BackButton, Button, HasPermission, Label, Spacer, Tag } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/utils';
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
		<>
			<BackButton onClick={handleClose} type="close" />
			<ValidationStatusTag status={validationsDetailContext.data.validation?.feeder_status} />
			<Tag label={validationsDetailContext.data.validation?.gtfs_agency.agency_id} variant="secondary" />
			<Label size="md" caps>{validationsDetailContext.data.validation?._id}</Label>
			<Spacer />
			{validationsDetailContext.flags.can_approve && (
				<>
					<HasPermission
						action={Permissions.validations.actions.request_approval}
						resource_key="agency_ids"
						scope={Permissions.validations.scope}
						value={validationsDetailContext.data.validation.gtfs_agency.agency_id}
					>
						<Button
							disabled={validationsDetailContext.flags.loading}
							icon={<IconMailFast />}
							label="Solicitar aprovação à TML"
							onClick={handleRequestApproval}
							variant="secondary"
						/>
					</HasPermission>
					<HasPermission
						action={Permissions.plans.actions.create}
						resource_key="agency_ids"
						scope={Permissions.plans.scope}
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
				</>
			)}
		</>
	);

	//
}
