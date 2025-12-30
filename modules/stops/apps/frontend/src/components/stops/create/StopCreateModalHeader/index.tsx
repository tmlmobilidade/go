'use client';

/* * */

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { closeCreateStopModal } from '@/components/stops/create/StopCreate.modal';
import { CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function StopCreateModalHeader() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();
	const { t } = useTranslation('stops', { keyPrefix: 'create.header' });

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateStopModal} type="close" />
			<Label size="lg" singleLine>{t('title')}</Label>
			<Spacer />
			<Label size="md" caps singleLine>{t('stepLabel', { current: stopCreateContext.modal.current_step, total: 3 })}</Label>
		</Toolbar>
	);

	//
}
