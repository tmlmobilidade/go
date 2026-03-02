'use client';

/* * */

import { usePeriodAssignContext } from '@/components/year-periods/calendar/PeriodAssign.context';
import { closeAsignPeriodModal } from '@/components/year-periods/calendar/PeriodAssign.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function PeriodAssignHeader() {
	//

	//
	// A. Setup variables

	const periodAssignContext = usePeriodAssignContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeAsignPeriodModal} type="close" />
			<Tag label="Atribuir datas" variant="muted" />
			<Spacer />
			<Button
				disabled={!periodAssignContext.flags.canSubmit}
				icon={<IconUpload size={28} />}
				label="Atribuir Período"
				loading={periodAssignContext.flags.isSaving}
				onClick={periodAssignContext.actions.handleAssign}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
