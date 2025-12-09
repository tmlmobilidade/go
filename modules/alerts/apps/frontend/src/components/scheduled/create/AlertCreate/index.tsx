'use client';

/* * */

import { AlertCreateHeader } from '@/components/scheduled/create/AlertCreateHeader';
import { useAlertCreateContext } from '@/contexts/AlertCreate.context';
import { FormModal } from '@tmlmobilidade/ui';

import { AlertCreateSectionCauseEffect } from '../AlertCreateSectionCauseEffect';
import { AlertCreateSectionReferences } from '../AlertCreateSectionReferences';
import { AlertCreateSectionTitle } from '../AlertCreateSectionTitle';
import { AlertCreateSectionValidity } from '../AlertCreateSectionValidity';

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
			<AlertCreateSectionTitle />
			<AlertCreateSectionValidity />
			<AlertCreateSectionCauseEffect />
			<AlertCreateSectionReferences />
			<AlertCreateSectionValidity />
		</FormModal>
	);

	//
}
