'use client';

/* * */

import { useHolidayCreateContext } from '@/components/holidays/create/HolidayCreate.context';
import { closeCreateHolidayModal } from '@/components/holidays/create/HolidayCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function HolidayCreateHeader() {
	//

	//
	// A. Setup variables

	const holidayCreateContext = useHolidayCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateHolidayModal} type="close" />
			<Tag label="Novo Feriado" variant="muted" />
			<Label size="lg" singleLine>{holidayCreateContext.data.form.values.title}</Label>
			<Spacer />
			<Button
				disabled={!holidayCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Publicar"
				loading={holidayCreateContext.flags.isSaving}
				onClick={holidayCreateContext.actions.createHoliday}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
