'use client';

/* * */

import BackButton from '@/components/common/BackButton';
import { StatusTag } from '@/components/common/StatusTag';
import { openCreatePlanModal } from '@/components/plans/detail/CreatePlanModal';
import { useValidationDetailContext } from '@/contexts/ValidationDetail.context';
import { Routes } from '@/lib/routes';
import { IconTransform } from '@tabler/icons-react';
import { Permissions } from '@tmlmobilidade/lib';
import { ProcessingStatus } from '@tmlmobilidade/types';
import { Button, HasPermission, Label, Spacer } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function ValidationDetailHeader() {
	//

	//
	// A. Setup variables

	const validationDetailContext = useValidationDetailContext();
	const canConvertToPlan = useMemo(() => validationDetailContext.data.validation.feeder_status === ProcessingStatus.Complete, [validationDetailContext.data.validation]);

	//
	// B. Render components

	return (
		<>
			<BackButton href={Routes.VALIDATION_LIST} />
			<StatusTag status={validationDetailContext.data.form.getValues().feeder_status} />
			<Label size="lg" caps>{validationDetailContext.data.id}</Label>
			<Spacer />
			{canConvertToPlan && (
				<HasPermission
					action={Permissions.validations.actions.create_plan}
					resource_key="agency_ids"
					scope={Permissions.validations.scope}
					value={validationDetailContext.data.validation.gtfs_agency.agency_id}
				>
					<Button
						icon={<IconTransform size={24} />}
						label="Converter para plano"
						onClick={() => openCreatePlanModal(validationDetailContext.data.validation._id)}
						size="lg"
						variant="primary"
					/>
				</HasPermission>
			)}
		</>
	);

	//
}
