'use client';

/* * */

import { StatusTag } from '@/components/common/StatusTag';
import { openCreatePlanModal } from '@/components/validations/detail/CreatePlanModal';
import { useValidationsDetailContext } from '@/contexts/ValidationsDetail.context';
import { IconTransformFilled } from '@tabler/icons-react';
import { Permissions } from '@tmlmobilidade/lib';
import { ProcessingStatus } from '@tmlmobilidade/types';
import { BackButton, Button, HasPermission, Label, Spacer, Tag } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/utils';
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

	const canConvertToPlan = useMemo(() => {
		return validationsDetailContext.data.validation.feeder_status === ProcessingStatus.Complete;
	}, [validationsDetailContext.data.validation]);

	//
	// C. Handle actions

	const handleClose = () => {
		const destUrl = keepUrlParams('/validations', window.location.search);
		router.push(destUrl);
	};

	const handleConvertToPlan = () => {
		openCreatePlanModal(validationsDetailContext.data.validation._id);
	};

	//
	// D. Render components

	return (
		<>
			<BackButton onClick={handleClose} type="close" />
			<StatusTag status={validationsDetailContext.data.validation?.feeder_status} />
			<Tag label={validationsDetailContext.data.validation?.gtfs_agency.agency_id} variant="secondary" />
			<Label size="md" caps>{validationsDetailContext.data.validation?._id}</Label>
			<Spacer />
			{canConvertToPlan && (
				<HasPermission
					action={Permissions.validations.actions.create_plan}
					resource_key="agency_ids"
					scope={Permissions.validations.scope}
					value={validationsDetailContext.data.validation.gtfs_agency.agency_id}
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
