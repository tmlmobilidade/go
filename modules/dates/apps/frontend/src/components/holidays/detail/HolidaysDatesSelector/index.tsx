'use client';

import { useHolidaysDetailContext } from '@/components/holidays/detail/HolidaysDetail.context';
import { Pill } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { Dates, FORMATS } from '@tmlmobilidade/dates';
import { type OperationalDate } from '@tmlmobilidade/types';
import { Section, Text } from '@tmlmobilidade/ui';
import dayjs from 'dayjs';

/* * */

export function DatesSelector() {
	//

	//
	// A. Setup variables

	const holidaysDetailContext = useHolidaysDetailContext();
	const isDisabled = holidaysDetailContext.flags.isReadOnly;
	const dates = holidaysDetailContext.data.form.values.dates || [];

	//
	// B. Handle actions

	const handleSelect = (date: Date) => {
		const operationalDate = dayjs(date).format('YYYYMMDD') as OperationalDate;
		const isSelected = dates.includes(operationalDate);

		if (isSelected) {
			// Remove date from holiday
			holidaysDetailContext.data.form.setFieldValue(
				'dates',
				dates.filter(d => d !== operationalDate),
			);
		} else {
			// Add date to holiday
			holidaysDetailContext.data.form.setFieldValue(
				'dates',
				[...dates, operationalDate],
			);
		}
	};

	const handleRemove = (operationalDate: OperationalDate) => {
		holidaysDetailContext.data.form.setFieldValue(
			'dates',
			dates.filter(d => d !== operationalDate),
		);
	};

	//
	// C. Render components

	return (
		<Section gap="md" padding="none">
			<Text size="sm">Selecione as datas da ocorrência</Text>

			<Section flexDirection="row" gap="md" padding="none">
				<Calendar
					getDayProps={date => ({
						onClick: () => isDisabled ? undefined : handleSelect(new Date(date)),
						selected: (dates).includes(dayjs(date).format('YYYYMMDD') as OperationalDate),
					})}
				/>

				{dates.length > 0 && (
					<Section gap="sm" padding="none">
						{dates.map(date => (
							<Pill
								key={date.toString()}
								disabled={isDisabled}
								onRemove={() => handleRemove(date)}
								withRemoveButton
							>
								{Dates.fromOperationalDate(date, 'Europe/Lisbon').toLocaleString(FORMATS.DATE_FULL_WITH_YEAR, 'pt-PT')}
							</Pill>
						))}
					</Section>
				)}

			</Section>
		</Section>

	);

	//
}
