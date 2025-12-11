'use client';

/* * */

import { useScheduledAlertCreateContext } from '@/components/scheduled/create/ScheduledAlertCreate.context';
import { closeCreateScheduledAlertModal } from '@/components/scheduled/create/ScheduledAlertCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { BackButton, Button, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function ScheduledAlertCreateHeader() {
	//

	//
	// A. Setup variables

	const scheduledAlertCreateContext = useScheduledAlertCreateContext();

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={closeCreateScheduledAlertModal} type="close" />
			<Tag label="Novo Alerta" variant="secondary" />
			<Spacer />
			<Button
				disabled={!scheduledAlertCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Salvar como rascunho"
				loading={scheduledAlertCreateContext.flags.isSaving}
				onClick={scheduledAlertCreateContext.actions.saveAlert}
				variant="secondary"
			/>
		</Toolbar>
	);

	//
}
