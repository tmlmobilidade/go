'use client';

import { closeYearPeriodsAssignModal } from '@/components/year-periods/calendar/YearPeriodsAssign.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

import { useYearPeriodsAssignFormContext } from '../YearPeriodsAssignForm.context';

/* * */

export function YearPeriodsAssignHeader() {
	//

	//
	// A. Setup variables

	const { actions, capabilities, isSubmitReady, status } = useYearPeriodsAssignFormContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeYearPeriodsAssignModal} type="close" />
			<Tag label="Atribuir datas" variant="muted" />
			<Spacer />
			<Button
				disabled={!capabilities.createEnabled || !isSubmitReady}
				icon={<IconUpload size={28} />}
				label="Atribuir Período"
				loading={status.isCreating}
				onClick={actions.create}
				variant="primary"
			/>
		</Toolbar>
	);
}
