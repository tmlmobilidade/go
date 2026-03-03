'use client';

/* * */

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { WEEKDAYS } from '@tmlmobilidade/types';
import { Section, SelectChipGroup, Text, WeekdaySelector } from '@tmlmobilidade/ui';

/* * */

const WEEKDAY_PRESETS = {
	all: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat, WEEKDAYS.Sun],
	business: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
	weekend: [WEEKDAYS.Sat, WEEKDAYS.Sun],
} as const;

type WeekdayPresetKey = keyof typeof WEEKDAY_PRESETS;

/* * */

function getSelectedPresetKey(currentWeekdays: number[] | undefined): null | WeekdayPresetKey {
	if (!currentWeekdays?.length) return null;

	const keys = Object.keys(WEEKDAY_PRESETS) as WeekdayPresetKey[];

	for (const key of keys) {
		const preset = WEEKDAY_PRESETS[key];
		const isExactMatch = preset.every(day => currentWeekdays.includes(day)) && currentWeekdays.length === preset.length;

		if (isExactMatch) return key;
	}

	return null;
}

/* * */

export function RuleCreateWeekdays() {
	//

	//
	// A. Setup variables

	const createRuleContext = useRuleCreateContext();

	//
	// B. Handle actions

	const currentWeekdays = createRuleContext.data.form.values.weekdays || [];
	const selectedPresetKey = getSelectedPresetKey(currentWeekdays);

	const applyPreset = (key: null | WeekdayPresetKey) => {
		if (!key) {
			createRuleContext.data.form.setFieldValue('weekdays', undefined);
			return;
		}

		createRuleContext.data.form.setFieldValue('weekdays', [...WEEKDAY_PRESETS[key]]);
	};

	//
	// C. Render components

	return (
		<Section gap="md">

			<Section gap="xs" padding="none">
				<Text>Dias da Semana</Text>
			</Section>

			{/* Quick Select Tags */}
			<SelectChipGroup<WeekdayPresetKey>
				onChange={applyPreset}
				value={selectedPresetKey}
				options={[
					{ label: 'Todos', value: 'all' },
					{ label: 'Dias úteis', value: 'business' },
					{ label: 'Fim de semana', value: 'weekend' },
				]}
			/>

			<WeekdaySelector
				value={currentWeekdays}
				onChange={(selectedDays) => {
					createRuleContext.data.form.setFieldValue('weekdays', selectedDays.length > 0 ? selectedDays : undefined);
				}}
			/>

		</Section>
	);
}
