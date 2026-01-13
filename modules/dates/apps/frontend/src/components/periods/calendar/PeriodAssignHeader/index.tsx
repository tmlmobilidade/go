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
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeAsignPeriodModal} type="close" />
			<Tag label={t('dates:periods.calendar.PeriodAssignHeader.tag')} variant="muted" />
			<Spacer />
			<Button
				disabled={!periodAssignContext.flags.canSubmit}
				icon={<IconUpload size={28} />}
				label={t('dates:periods.calendar.PeriodAssignHeader.AssignButton.label')}
				loading={periodAssignContext.flags.isSaving}
				onClick={periodAssignContext.actions.handleAssign}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
