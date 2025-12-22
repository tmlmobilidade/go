'use client';

/* * */

import { useScheduledAlertCreateContext } from '@/components/scheduled/create/ScheduledAlertCreate.context';
import { closeCreateScheduledAlertModal } from '@/components/scheduled/create/ScheduledAlertCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { Button, CloseButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function ScheduledAlertCreateHeader() {
	//

	//
	// A. Setup variables

	const scheduledAlertCreateContext = useScheduledAlertCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateScheduledAlertModal} type="close" />
			<Tag label="Novo Alerta" variant="secondary" />
			<Spacer />
			<Button
				disabled={!scheduledAlertCreateContext.data.form.isValid()}
				icon={<IconPlus size={28} />}
				label="Criar como rascunho"
				loading={scheduledAlertCreateContext.flags.isCreating}
				onClick={scheduledAlertCreateContext.actions.create}
				variant="secondary"
			/>
		</Toolbar>
	);

	//
}
