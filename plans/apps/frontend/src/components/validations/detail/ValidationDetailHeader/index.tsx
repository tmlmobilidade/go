'use client';

/* * */

import BackButton from '@/components/common/BackButton';
import { StatusTag } from '@/components/common/StatusTag';
import { OpenCreatePlanModal } from '@/components/plans/detail/CreatePlanModal';
import { useValidationDetailContext } from '@/contexts/ValidationDetail.context';
import { IconTransform } from '@tabler/icons-react';
import { Button, Label, Spacer } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
/* * */

export function ValidationDetailHeader() {
	//

	//
	// A. Setup variables

	const validationDetailContext = useValidationDetailContext();
	const canConvertToPlan = useMemo(() => validationDetailContext.data.validation.feeder_status === 'success', [validationDetailContext.data.validation]);

	//
	// B. Render components

	return (
		<>
			<BackButton />
			<StatusTag status={validationDetailContext.data.form.getValues().feeder_status} />
			<Label size="lg" caps>{validationDetailContext.data.id}</Label>
			<Spacer />
			{canConvertToPlan && (
				<Button icon={<IconTransform size={24} />} label="Converter para plano" onClick={() => OpenCreatePlanModal(validationDetailContext.data.validation._id)} size="lg" variant="primary" />
			)}
		</>
	);

	//
}
