'use client';

import { type EventReplacementRule, WEEKDAYS } from '@tmlmobilidade/go-types-offer';
import { Section, SelectChipGroup, Text, WeekdaySelector } from '@tmlmobilidade/ui';

import { useEventsRulesCreateFormContext } from '../EventsRulesCreateForm.context';

/* * */

const WEEKDAY_PRESETS = {
	all: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat, WEEKDAYS.Sun],
	business: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
	weekend: [WEEKDAYS.Sat, WEEKDAYS.Sun],
} as const;

type WeekdayPresetKey = keyof typeof WEEKDAY_PRESETS;

/* * */

function getSelectedPresetKey(currentWeekdays: number[]): null | WeekdayPresetKey {
	if (!currentWeekdays.length) return null;
	const keys = Object.keys(WEEKDAY_PRESETS) as WeekdayPresetKey[];
	for (const key of keys) {
		const preset = WEEKDAY_PRESETS[key];
		const isExactMatch = preset.every(day => currentWeekdays.includes(day)) && currentWeekdays.length === preset.length;
		if (isExactMatch) return key;
	}
	return null;
}

/* * */

export function EventsRulesCreateWeekdays() {
	//

	//
	// A. Setup variables

	const { form, values } = useEventsRulesCreateFormContext();

	const currentWeekdays = values.kind === 'event_replacement' ? values.weekdays || [] : [];

	const selectedPresetKey = getSelectedPresetKey(currentWeekdays);

	//
	// B. Handle actions

	const setWeekdays = (weekdays: EventReplacementRule['weekdays'] | undefined) => {
		// An empty selection is stored as undefined so the schema flags it as missing
		form.setValue('weekdays', weekdays as EventReplacementRule['weekdays'], { shouldDirty: true, shouldValidate: true });
	};

	const handleApplyPreset = (key: null | WeekdayPresetKey) => {
		setWeekdays(key ? [...WEEKDAY_PRESETS[key]] : undefined);
	};

	const handleChangeWeekdays = (selectedDays: EventReplacementRule['weekdays']) => {
		setWeekdays(selectedDays.length > 0 ? selectedDays : undefined);
	};

	//
	// C. Render components

	return (
		<Section gap="md">
			<Section gap="xs" padding="none">
				<Text>Tipo de dia</Text>
			</Section>
			<SelectChipGroup<WeekdayPresetKey>
				onChange={handleApplyPreset}
				value={selectedPresetKey}
				options={[
					{ label: 'Todos', value: 'all' },
					{ label: 'Dias úteis', value: 'business' },
					{ label: 'Fim de semana', value: 'weekend' },
				]}
			/>
			<WeekdaySelector
				onChange={handleChangeWeekdays}
				value={currentWeekdays}
			/>
		</Section>
	);
}
