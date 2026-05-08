'use client';

import { useRuleCreateContext } from '@/components/events/rules/RuleCreate.context';
import { Dates } from '@tmlmobilidade/dates';
import { type OperationalDate } from '@tmlmobilidade/types';
import { MultiSelect, Section } from '@tmlmobilidade/ui';
import { useEffect } from 'react';

/* * */

export function RuleCreateDates() {
	//

	//
	// A. Setup variables

	const createRuleContext = useRuleCreateContext();

	// Get available dates from the event data
	const eventDates = createRuleContext.data.eventData.dates;

	const dateOptions = [...eventDates].sort().map(date => ({
		label: (() => {
			const jsDate = Dates.fromOperationalDate(date as OperationalDate, 'Europe/Lisbon').js_date;
			const dateStr = jsDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: '2-digit' });
			const weekdayShort = jsDate.toLocaleDateString('pt-PT', { weekday: 'short' }).replace('.', '');
			return `${dateStr} (${weekdayShort})`;
		})(),
		value: date,
	}));

	//
	// B. Handle auto-selection

	useEffect(() => {
		// If there are dates available and no dates are selected yet, auto-select all
		if (dateOptions.length > 0 && !createRuleContext.data.form.values.dates?.length) {
			createRuleContext.data.form.setFieldValue(
				'dates',
				dateOptions.map(option => option.value as OperationalDate),
			);
		}
	}, [createRuleContext.data.form, dateOptions, dateOptions.length]);

	//
	// C. Render components

	return (
		<Section>
			<MultiSelect
				data={dateOptions}
				placeholder="Selecione as datas afetadas por esta regra"
				value={[...(createRuleContext.data.form.values.dates ?? [])].sort()}
				w="100%"
				onChange={(selected) => {
					createRuleContext.data.form.setFieldValue(
						'dates',
						selected.length > 0 ? (selected as OperationalDate[]).sort() : undefined,
					);
				}}
			/>
		</Section>
	);

	//
}
