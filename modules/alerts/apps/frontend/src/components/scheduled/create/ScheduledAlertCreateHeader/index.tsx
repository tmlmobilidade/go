'use client';

/* * */

import { useScheduledAlertCreateContext } from '@/components/scheduled/create/ScheduledAlertCreate.context';
import { closeCreateScheduledAlertModal } from '@/components/scheduled/create/ScheduledAlertCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { Button, CloseButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ScheduledAlertCreateHeader() {
	//

	//
	// A. Setup variables

	const scheduledAlertCreateContext = useScheduledAlertCreateContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'scheduled.create.header' });
	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateScheduledAlertModal} type="close" />
			<Tag label={t('title')} variant="secondary" />
			<Spacer />
			<Button
				disabled={!scheduledAlertCreateContext.data.form.isValid()}
				icon={<IconPlus size={28} />}
				label={t('newAlertDraftButtonLabel')}
				loading={scheduledAlertCreateContext.flags.isSaving}
				onClick={scheduledAlertCreateContext.actions.saveAlert}
				variant="secondary"
			/>
		</Toolbar>
	);

	//
}
