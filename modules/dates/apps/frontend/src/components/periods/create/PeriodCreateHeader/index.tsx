'use client';

/* * */

import { closeCreatePeriodModal } from '@/components/periods/create/PeriodCreate.modal';
import { usePeriodCreateContext } from '@/components/periods/create/PeriodsCreate.context';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PeriodCreateHeader() {
	//

	//
	// A. Setup variables

	const periodCreateContext = usePeriodCreateContext();
	const { t } = useTranslation('dates');

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreatePeriodModal} type="close" />
			<Tag label={t('periods.create.Header.tag')} variant="muted" />
			<Label size="lg" singleLine>{periodCreateContext.data.form.values.name}</Label>
			<Spacer />
			<Button
				disabled={!periodCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label={t('periods.create.Header.PublishButton.label')}
				loading={periodCreateContext.flags.isSaving}
				onClick={periodCreateContext.actions.createPeriod}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
