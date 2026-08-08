'use client';

import { Dates, getZonedCalendarDayInterval, type TimezoneIdentified } from '@tmlmobilidade/dates';
import { type CalendarDate, toCalendarDate } from '@tmlmobilidade/types';
import { type ScheduleEventData, useTemporalSettingsContext, YearView } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';

/* * */

export interface RulePreviewCalendarProps {
	affectedDates: CalendarDate[]
	onVisibleYearChange?: (year: number) => void
	timezone?: TimezoneIdentified
}

/* * */

interface RuleImpactSchedulePayload {
	sourceId: CalendarDate
	type: 'rule-impact'
}

/* * */

export function RulePreviewCalendar({ affectedDates, onVisibleYearChange, timezone }: RulePreviewCalendarProps) {
	//

	//
	// A. Setup variables

	const temporalSettings = useTemporalSettingsContext();
	const resolvedTimezone = timezone ?? temporalSettings.timezone;
	const [visibleDate, setVisibleDate] = useState<CalendarDate>(() => Dates.now(resolvedTimezone).calendar_date);

	//
	// C. Transform data

	const ruleImpactEvents = useMemo(() => {
		return affectedDates.map((date): ScheduleEventData<RuleImpactSchedulePayload> => {
			const interval = getZonedCalendarDayInterval(date, resolvedTimezone);

			return {
				color: 'var(--color-primary)',
				end: `${interval.endExclusive.calendar_date} 00:00:00`,
				id: `rule-impact:${date}`,
				payload: {
					sourceId: date,
					type: 'rule-impact',
				},
				start: `${date} 00:00:00`,
				title: 'Dia afetado pela regra',
				variant: 'filled',
			};
		});
	}, [affectedDates, resolvedTimezone]);

	//
	// D. Handle actions

	const handleVisibleDateChange = (value: string) => {
		const date = toCalendarDate(value);
		setVisibleDate(date);
		onVisibleYearChange?.(Number(date.slice(0, 4)));
	};

	//
	// F. Render components

	return (
		<YearView
			date={visibleDate}
			events={ruleImpactEvents}
			locale={temporalSettings.locale}
			mode="static"
			onDateChange={handleVisibleDateChange}
			viewSelectProps={{ views: ['year'] }}
		/>
	);

	//
}
