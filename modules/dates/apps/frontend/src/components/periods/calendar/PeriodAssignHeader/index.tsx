'use client';

/* * */

import { usePeriodAssignContext } from '@/components/periods/calendar/PeriodAssign.context';
import { closeAsignPeriodModal } from '@/components/periods/calendar/PeriodAssign.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PeriodAssignHeader() {
	//

	//
	// A. Setup variables

	const periodAssignContext = usePeriodAssignContext();
	const { t } = useTranslation('dates');

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeAsignPeriodModal} type="close" />
			<Tag label={t('periods.calendar.AssignHeader.tag')} variant="muted" />
			<Spacer />
			<Button
				disabled={!periodAssignContext.flags.canSubmit}
				icon={<IconUpload size={28} />}
				label={t('periods.calendar.AssignHeader.AssignButton.label')}
				loading={periodAssignContext.flags.isSaving}
				onClick={periodAssignContext.actions.handleAssign}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
