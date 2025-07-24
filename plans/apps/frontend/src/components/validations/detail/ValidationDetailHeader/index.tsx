'use client';

/* * */

import { StatusTag } from '@/components/common/StatusTag';
import { openCreatePlanModal } from '@/components/validations/detail/CreatePlanModal';
import { useValidationDetailContext } from '@/contexts/ValidationDetail.context';
import { IconTransformFilled } from '@tabler/icons-react';
import { Permissions } from '@tmlmobilidade/lib';
import { ProcessingStatus } from '@tmlmobilidade/types';
import { BackButton, Button, HasPermission, Label, Spacer } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

/* * */

export function ValidationDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const validationDetailContext = useValidationDetailContext();

	//
	// B. Transform data

	const canConvertToPlan = useMemo(() => {
		return validationDetailContext.data.validation.feeder_status === ProcessingStatus.Complete;
	}, [validationDetailContext.data.validation]);

	//
	// C. Handle actions

	const handleClose = () => {
		const destUrl = keepUrlParams('/validations', window.location.search);
		router.push(destUrl);
	};

	const handleConvertToPlan = () => {
		openCreatePlanModal(validationDetailContext.data.validation._id);
	};

	//
	// D. Render components

	return (
		<>
			<BackButton onClick={handleClose} type="close" />
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
						icon={<IconTransformFilled />}
						label="Converter para Plano"
						onClick={handleConvertToPlan}
					/>
				</HasPermission>
			)}
		</>
	);

	//
}
