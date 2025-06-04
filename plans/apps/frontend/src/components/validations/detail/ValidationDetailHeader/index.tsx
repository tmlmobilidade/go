'use client';

/* * */

import BackButton from '@/components/common/BackButton';
import { StatusTag } from '@/components/common/StatusTag';
import { useValidationDetailContext } from '@/contexts/ValidationDetail.context';
import { Label, Spacer } from '@tmlmobilidade/ui';
/* * */

export function ValidationDetailHeader() {
	//

	//
	// A. Setup variables

	const validationDetailContext = useValidationDetailContext();

	//
	// B. Render components

	return (
		<>
			<BackButton />
			<StatusTag status={validationDetailContext.data.form.getValues().feeder_status} />
			<Label size="lg" caps>{validationDetailContext.data.id}</Label>
			<Spacer />
		</>
	);

	//
}
