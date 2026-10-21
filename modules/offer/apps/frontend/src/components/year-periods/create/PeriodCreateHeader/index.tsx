'use client';

import { closeCreatePeriodModal } from '@/components/year-periods/create/PeriodCreate.modal';
import { usePeriodCreateContext } from '@/components/year-periods/create/PeriodsCreate.context';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function PeriodCreateHeader() {
	//

	//
	// A. Setup variables

	const periodCreateContext = usePeriodCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreatePeriodModal} type="close" />
			<Tag label="Novo Período" variant="muted" />
			<Label size="lg" singleLine>{periodCreateContext.data.form.values.name}</Label>
			<Spacer />
			<Button
				disabled={!periodCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Publicar"
				loading={periodCreateContext.flags.isSaving}
				onClick={periodCreateContext.actions.createPeriod}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
