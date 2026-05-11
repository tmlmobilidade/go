'use client';

import { useAnnotationsDetailContext } from '@/components/annotations/detail/AnnotationsDetail.context';
import { Calendar } from '@mantine/dates';
import { type OperationalDate } from '@tmlmobilidade/types';
import { Section, Text } from '@tmlmobilidade/ui';
import dayjs from 'dayjs';

/* * */

export function DatesSelector() {
	//

	//
	// A. Setup variables

	const annotationsDetailContext = useAnnotationsDetailContext();
	const isDisabled = !annotationsDetailContext.flags.canSave;

	//
	// B. Handle actions

	const handleSelect = (date: Date) => {
		const operationalDate = dayjs(date).format('YYYYMMDD') as OperationalDate;
		const currentDates = annotationsDetailContext.data.form.values.dates || [];
		const isSelected = currentDates.includes(operationalDate);

		if (isSelected) {
			// Remove date from annotation
			annotationsDetailContext.data.form.setFieldValue(
				'dates',
				currentDates.filter(d => d !== operationalDate),
			);
		}
		else {
			// Add date to annotation
			annotationsDetailContext.data.form.setFieldValue(
				'dates',
				[...currentDates, operationalDate],
			);
		}
	};

	//
	// C. Render components

	return (
		<Section gap="md">
			<Text>Selecione as datas da ocorrência</Text>

			<Calendar
				getDayProps={date => ({
					onClick: () => isDisabled ? undefined : handleSelect(new Date(date)),
					selected: (annotationsDetailContext.data.form.values.dates || []).includes(dayjs(date).format('YYYYMMDD') as OperationalDate),
				})}
			/>
		</Section>

	);

	//
}
