'use client';

import { useCalendarDayCounterContext } from '@/components/calendar/day-counter/CalendarDayCounter.context';
import { type IsoWeekday, WEEKDAYS } from '@tmlmobilidade/types';
import { Section, SelectChipGroup, Text, WeekdaySelector } from '@tmlmobilidade/ui';

/* * */

const WEEKDAY_PRESETS = {
	all: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat, WEEKDAYS.Sun],
	business: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
	weekend: [WEEKDAYS.Sat, WEEKDAYS.Sun],
} as const;

const WEEKDAY_LABELS: Record<IsoWeekday, string> = {
	[WEEKDAYS.Fri]: '6ª',
	[WEEKDAYS.Mon]: '2ª',
	[WEEKDAYS.Sat]: 'Sáb',
	[WEEKDAYS.Sun]: 'Dom e Fer',
	[WEEKDAYS.Thu]: '5ª',
	[WEEKDAYS.Tue]: '3ª',
	[WEEKDAYS.Wed]: '4ª',
};

type WeekdayPresetKey = keyof typeof WEEKDAY_PRESETS;

function getSelectedPresetKey(currentWeekdays: IsoWeekday[]): null | WeekdayPresetKey {
	const presetKey = (Object.keys(WEEKDAY_PRESETS) as WeekdayPresetKey[]).find((key) => {
		const preset = WEEKDAY_PRESETS[key];
		return preset.length === currentWeekdays.length && preset.every(day => currentWeekdays.includes(day));
	});

	return presetKey ?? null;
}

/* * */

export function CalendarDayCounterWeekdays() {
	//

	//
	// A. Setup variables

	const dayCounterContext = useCalendarDayCounterContext();
	const selectedPresetKey = getSelectedPresetKey(dayCounterContext.filters.weekdays);

	//
	// B. Handle actions

	const handlePresetChange = (value: null | WeekdayPresetKey) => {
		dayCounterContext.actions.setWeekdays(value ? [...WEEKDAY_PRESETS[value]] : []);
	};

	//
	// C. Render components

	return (
		<Section gap="md" padding="none">
			<Text>Tipo de dia</Text>

			<SelectChipGroup<WeekdayPresetKey>
				onChange={handlePresetChange}
				value={selectedPresetKey}
				options={[
					{ label: 'Todos', value: 'all' },
					{ label: 'Dias úteis', value: 'business' },
					{ label: 'Fim de semana', value: 'weekend' },
				]}
			/>

			<WeekdaySelector
				labels={WEEKDAY_LABELS}
				onChange={dayCounterContext.actions.setWeekdays}
				value={dayCounterContext.filters.weekdays}
				wrap
			/>
		</Section>
	);

	//
}
