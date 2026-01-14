'use client';

/* * */

import { WEEKDAYS } from '@tmlmobilidade/types';
import { Section, Tag, Text, WeekdaySelector } from '@tmlmobilidade/ui';

import { useRuleCreateContext } from '../RuleCreate.context';

/* * */

export function RuleCreateWeekdays() {
	//

	//
	// A. Setup variables

	const createRuleContext = useRuleCreateContext();

	//
	// B. Handle actions

	const handleQuickSelectDays = (type: 'all' | 'business' | 'weekend') => {
		const selections = {
			all: [WEEKDAYS.Sun, WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat],
			business: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			weekend: [WEEKDAYS.Sun, WEEKDAYS.Sat],
		};
		const currentWeekdays = createRuleContext.data.form.values.weekdays || [];
		const exactMatch = selections[type].every(day => currentWeekdays.includes(day)) && currentWeekdays.length === selections[type].length;

		if (exactMatch) {
			// Deselect all
			createRuleContext.data.form.setFieldValue('weekdays', undefined);
		}
		else {
			// Select only this type
			createRuleContext.data.form.setFieldValue('weekdays', selections[type]);
		}
	};

	//
	// C. Render components

	const currentWeekdays = createRuleContext.data.form.values.weekdays || [];
	const allDays = [WEEKDAYS.Sun, WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat];
	const businessDays = [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri];
	const weekendDays = [WEEKDAYS.Sun, WEEKDAYS.Sat];

	const allSelected = allDays.every(day => currentWeekdays.includes(day)) && currentWeekdays.length === allDays.length;
	const businessSelected = businessDays.every(day => currentWeekdays.includes(day)) && currentWeekdays.length === businessDays.length;
	const weekendSelected = weekendDays.every(day => currentWeekdays.includes(day)) && currentWeekdays.length === weekendDays.length;

	return (
		<Section gap="md">

			<Section gap="xs" padding="none">
				<Text>Dias da Semana</Text>
			</Section>

			{/* Quick Select Tags */}
			<Section flexDirection="row" gap="sm" padding="none">
				<Tag label="Todos" onClick={() => handleQuickSelectDays('all')} variant={allSelected ? 'primary' : 'muted'} />
				<Tag label="Dias úteis" onClick={() => handleQuickSelectDays('business')} variant={businessSelected ? 'primary' : 'muted'} />
				<Tag label="Fim de semana" onClick={() => handleQuickSelectDays('weekend')} variant={weekendSelected ? 'primary' : 'muted'} />
			</Section>

			<WeekdaySelector
				value={createRuleContext.data.form.values.weekdays || []}
				onChange={(selectedDays) => {
					createRuleContext.data.form.setFieldValue('weekdays', selectedDays.length > 0 ? selectedDays : undefined);
				}}
			/>

		</Section>
	);
}
