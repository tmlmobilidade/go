'use client';

import { Dates } from '@tmlmobilidade/dates';
import { type OperationalDate } from '@tmlmobilidade/go-types-shared';
import { MultiSelect, Section } from '@tmlmobilidade/ui';
import { useEffect, useMemo } from 'react';

import { useEventsRulesCreateFormContext } from '../EventsRulesCreateForm.context';

/* * */

export function EventsRulesCreateDates() {
	//

	//
	// A. Setup variables

	const { eventData, form, values } = useEventsRulesCreateFormContext();

	const selectedDates = useMemo(() => [...(values.dates ?? [])].sort(), [values.dates]);

	//
	// B. Transform data

	const dateOptions = useMemo(() => {
		return [...eventData.dates].sort().map((date) => {
			const jsDate = Dates.fromOperationalDate(date as OperationalDate, 'Europe/Lisbon').js_date;
			const dateStr = jsDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: '2-digit' });
			const weekdayShort = jsDate.toLocaleDateString('pt-PT', { weekday: 'short' }).replace('.', '');
			return {
				label: `${dateStr} (${weekdayShort})`,
				value: date,
			};
		});
	}, [eventData.dates]);

	//
	// C. Handle actions

	const handleChange = (selected: string[]) => {
		form.setValue('dates', [...(selected as OperationalDate[])].sort(), { shouldDirty: true, shouldValidate: true });
	};

	// If there are dates available and none are selected yet, select them all
	useEffect(() => {
		if (dateOptions.length > 0 && selectedDates.length === 0) {
			form.setValue('dates', dateOptions.map(option => option.value as OperationalDate), { shouldDirty: true, shouldValidate: true });
		}
	}, [dateOptions, form, selectedDates.length]);

	//
	// D. Render components

	return (
		<Section>
			<MultiSelect
				data={dateOptions}
				onChange={handleChange}
				placeholder="Selecione as datas afetadas por esta regra"
				value={selectedDates}
			/>
		</Section>
	);
}
