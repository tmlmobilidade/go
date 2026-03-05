'use client';

/* * */

import { useEventsDetailContext } from '@/components/events/detail/EventsDetail.context';
import { Pill } from '@mantine/core';
import { Dates, FORMATS } from '@tmlmobilidade/dates';
import { type OperationalDate } from '@tmlmobilidade/types';
import { MiniCalendar, Section, Text } from '@tmlmobilidade/ui';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

/* * */

export function DatesSelector() {
	//

	//
	// A. Setup variables

	const eventsDetailContext = useEventsDetailContext();
	const isDisabled = eventsDetailContext.flags.isReadOnly;
	const dates = eventsDetailContext.data.form.values.dates || [];
	const [displayedMonth, setDisplayedMonth] = useState<Date>();

	//
	// B. Local mini-calendar state (controlled month)

	const selectedSet = useMemo(() => new Set(dates), [dates]);

	const initialMonth = useMemo(() => {
		// Prefer showing month of the most recently selected date; fallback to current month
		if (dates.length > 0) {
			const last = dates[dates.length - 1];
			// last is YYYYMMDD
			const yyyy = Number.parseInt(last.slice(0, 4), 10);
			const mm = Number.parseInt(last.slice(4, 6), 10);
			return new Date(yyyy, mm - 1, 1);
		}
		return new Date();
	}, [dates]);

	useEffect(() => {
		setDisplayedMonth(initialMonth);
	}, [initialMonth]);

	//
	// C. Handle actions

	const handleSelect = (date: Date) => {
		const operationalDate = dayjs(date).format('YYYYMMDD') as OperationalDate;
		const isSelected = dates.includes(operationalDate);

		if (isSelected) {
			// Remove date from event
			eventsDetailContext.data.form.setFieldValue(
				'dates',
				dates.filter(d => d !== operationalDate),
			);
		} else {
			// Add date to event
			eventsDetailContext.data.form.setFieldValue(
				'dates',
				[...dates, operationalDate],
			);
		}
	};

	const handleRemove = (operationalDate: OperationalDate) => {
		eventsDetailContext.data.form.setFieldValue(
			'dates',
			dates.filter(d => d !== operationalDate),
		);
	};

	//
	// D. Render components

	return (
		<Section gap="md" padding="none">
			<Text size="sm">Selecione as datas da ocorrência</Text>

			<Section flexDirection="row" gap="md" padding="none">
				<MiniCalendar
					displayedMonth={displayedMonth}
					onDisplayedMonthChange={setDisplayedMonth}
					isDateSelected={(date) => {
						const operationalDate = dayjs(date).format('YYYYMMDD') as OperationalDate;
						return selectedSet.has(operationalDate);
					}}
					onDayClick={(date) => {
						if (isDisabled) return;
						handleSelect(date);
					}}
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
