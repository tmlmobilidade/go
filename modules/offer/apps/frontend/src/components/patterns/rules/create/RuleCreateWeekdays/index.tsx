'use client';

/* * */

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { WEEKDAYS } from '@tmlmobilidade/types';
import { Section, Tag, Text, WeekdaySelector } from '@tmlmobilidade/ui';

/* * */

const WEEKDAY_PRESETS = {
	all: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat, WEEKDAYS.Sun],
	business: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
	weekend: [WEEKDAYS.Sat, WEEKDAYS.Sun],
} as const;

/* * */

export function RuleCreateWeekdays() {
	//

	//
	// A. Setup variables

	const createRuleContext = useRuleCreateContext();

	//
	// B. Handle actions

	const handleQuickSelectDays = (type: keyof typeof WEEKDAY_PRESETS) => {
		const currentWeekdays = createRuleContext.data.form.values.weekdays || [];
		const preset = WEEKDAY_PRESETS[type];
		const isExactMatch = preset.every(day => currentWeekdays.includes(day)) && currentWeekdays.length === preset.length;

		createRuleContext.data.form.setFieldValue('weekdays', isExactMatch ? undefined : [...preset]);
	};

	const isPresetSelected = (type: keyof typeof WEEKDAY_PRESETS) => {
		const currentWeekdays = createRuleContext.data.form.values.weekdays || [];
		const preset = WEEKDAY_PRESETS[type];
		return preset.every(day => currentWeekdays.includes(day)) && currentWeekdays.length === preset.length;
	};

	//
	// C. Render components

	return (
		<Section gap="md">

			<Section gap="xs" padding="none">
				<Text>Dias da Semana</Text>
			</Section>

			{/* Quick Select Tags */}
			<Section flexDirection="row" gap="sm" padding="none">
				<Tag label="Todos" onClick={() => handleQuickSelectDays('all')} variant={isPresetSelected('all') ? 'primary' : 'muted'} />
				<Tag label="Dias úteis" onClick={() => handleQuickSelectDays('business')} variant={isPresetSelected('business') ? 'primary' : 'muted'} />
				<Tag label="Fim de semana" onClick={() => handleQuickSelectDays('weekend')} variant={isPresetSelected('weekend') ? 'primary' : 'muted'} />
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
