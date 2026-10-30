'use client';

import { useCalendarDayCounterContext } from '@/components/calendar/day-counter/CalendarDayCounter.context';
import { type IsoWeekday, WEEKDAYS } from '@tmlmobilidade/go-types-shared';
import { getWeekdayOptions } from '@tmlmobilidade/go-utils-dates';
import { Section, SelectChipGroup, Text, useLocaleContext, WeekdaySelector } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

const WEEKDAY_PRESETS = {
	all: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat, WEEKDAYS.Sun],
	business: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
	weekend: [WEEKDAYS.Sat, WEEKDAYS.Sun],
} as const;

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
	const { t } = useTranslation();
	const { data: { locale } } = useLocaleContext();

	//
	// B. Transform data

	const weekdayLabels = useMemo(() => {
		return Object.fromEntries(getWeekdayOptions(locale).map(({ label, value }) => [
			value,
			value === WEEKDAYS.Sun ? t('default:calendar.dayCounter.sundayAndHolidays', '', { day: label }) : label,
		]));
	}, [locale, t]);
	const selectedPresetKey = getSelectedPresetKey(dayCounterContext.filters.weekdays);

	//
	// C. Handle actions

	const handlePresetChange = (value: null | WeekdayPresetKey) => {
		dayCounterContext.actions.setWeekdays(value ? [...WEEKDAY_PRESETS[value]] : []);
	};

	//
	// D. Render components

	return (
		<Section gap="md" padding="none">
			<Text>{t('default:calendar.dayCounter.dayType')}</Text>

			<SelectChipGroup<WeekdayPresetKey>
				onChange={handlePresetChange}
				value={selectedPresetKey}
				options={[
					{ label: t('default:calendar.dayCounter.all'), value: 'all' },
					{ label: t('default:calendar.dayCounter.businessDays'), value: 'business' },
					{ label: t('default:calendar.dayCounter.weekend'), value: 'weekend' },
				]}
			/>

			<WeekdaySelector
				labels={weekdayLabels}
				onChange={dayCounterContext.actions.setWeekdays}
				value={dayCounterContext.filters.weekdays}
				wrap
			/>
		</Section>
	);

	//
}
