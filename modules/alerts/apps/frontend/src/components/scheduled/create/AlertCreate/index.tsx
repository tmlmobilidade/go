'use client';

/* * */

import { AlertCreateHeader } from '@/components/scheduled/create/AlertCreateHeader';
import { AlertCreateSectionCauseEffect } from '@/components/scheduled/create/AlertCreateSectionCauseEffect';
import { AlertCreateSectionReferences } from '@/components/scheduled/create/AlertCreateSectionReferences';
import { AlertCreateSectionTitle } from '@/components/scheduled/create/AlertCreateSectionTitle';
import { AlertCreateSectionValidity } from '@/components/scheduled/create/AlertCreateSectionValidity';
import { AlertCreateSectionVisibility } from '@/components/scheduled/create/AlertCreateSectionVisibility';
import { useAlertCreateContext } from '@/contexts/AlertCreate.context';
import { FormModal } from '@tmlmobilidade/ui';

/* * */

export function AlertCreate() {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();

	//
	// B. Render components

	return (
		<FormModal
			header={[<AlertCreateHeader onClose={alertCreateContext.modal.close} />]}
			isOpen={alertCreateContext.modal.state}
			onClose={alertCreateContext.modal.close}
		>
			{/* Title & Description */}
			<AlertCreateSectionTitle />
			{/* Visibility Scheduling */}
			<AlertCreateSectionVisibility />
			{/* Validity Scheduling */}
			<AlertCreateSectionValidity />
			{/* Cause & Effect */}
			<AlertCreateSectionCauseEffect />
			{/* References */}
			<AlertCreateSectionReferences />
		</FormModal>
	);

	//
}
