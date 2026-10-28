'use client';

import { getPeriodsCalendarDays } from '@/components/year-periods/shared/periods-calendar-days';
import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type CalendarDate, toCalendarDate, validateOperationalDate } from '@tmlmobilidade/go-types-shared';
import { CalendarSchedule, type CalendarScheduleProps, type CalendarScheduleSources, isCalendarSchedulePayload, useLocaleContext } from '@tmlmobilidade/ui';
import { type CSSProperties, useMemo } from 'react';

import styles from './styles.module.css';

/* * */

interface PeriodsCalendarProps {
	agencyIds: string[]
	date: CalendarDate
	editorProps?: Pick<CalendarScheduleProps, 'dateChanges' | 'dateRangeSelectionAction' | 'isDateRangeDateApplicable' | 'onSelectedDateRangeChange' | 'selectedDateRange'>
	onDateChange: (date: string) => void
	onPeriodSelect?: (periodId: string) => void
	periods: YearPeriod[]
	previewDates?: CalendarDate[]
	selectedPeriodId?: string
	sources?: CalendarScheduleSources
}

/* * */

export function PeriodsCalendar({ agencyIds, date, editorProps, onDateChange, onPeriodSelect, periods, previewDates, selectedPeriodId, sources }: PeriodsCalendarProps) {
	//

	//
	// A. Setup variables

	const localeContext = useLocaleContext();

	//
	// B. Transform data

	const days = useMemo(() => getPeriodsCalendarDays(periods, agencyIds, selectedPeriodId, previewDates), [periods, agencyIds, selectedPeriodId, previewDates]);

	const calendarSources = useMemo(() => ({
		...sources,
		yearPeriods: periods.filter(period => period.agency_ids.some(id => agencyIds.includes(id))).map(period => ({
			...period,
			dates: [...days.entries()].filter(([, owners]) => owners.some(owner => owner._id === period._id)).map(([date]) => validateOperationalDate(date.replaceAll('-', ''))),
		})),
	}), [sources, periods, agencyIds, days]);

	const getDayProps = (value: string) => {
		const owners = days.get(toCalendarDate(value.slice(0, 10))) ?? [];
		const selected = owners.find(period => period._id === selectedPeriodId);
		const colors = [...new Set(owners.map(period => period.color || '#3b82f6'))];
		const color = selected?.color || colors[0];
		const background = colors.length > 1 ? `linear-gradient(135deg, ${colors.map((item, index) => `color-mix(in srgb, ${item}, transparent 85%) ${index * 100 / colors.length}% ${(index + 1) * 100 / colors.length}%`).join(', ')})` : undefined;
		return {
			'data-period-assigned': owners.length > 0 || undefined,
			'data-period-missing': (agencyIds.length > 0 && !owners.length) || undefined,
			'data-period-mixed': owners.length > 1 || undefined,
			'data-period-muted': (!!selectedPeriodId && !selected) || undefined,
			'data-period-selected': !!selected || undefined,
			'style': { '--period-background': background, '--period-color': color } as CSSProperties,
		};
	};

	//
	// C. Handle actions

	const handleDayClick: CalendarScheduleProps['onDayClick'] = (value) => {
		if (selectedPeriodId || editorProps?.onSelectedDateRangeChange) return;
		const owners = days.get(toCalendarDate(value.slice(0, 10))) ?? [];
		if (owners.length === 1) onPeriodSelect?.(owners[0]._id);
	};

	//
	// D. Render components

	return (
		<CalendarSchedule
			{...editorProps}
			className={styles.calendar}
			date={date}
			eventTypeFilters={{ annotation: false, event: false }}
			locale={localeContext.data.locale}
			onDateChange={onDateChange}
			onDayClick={handleDayClick}
			sources={calendarSources}
			view="year"
			withDayTooltips={!selectedPeriodId}
			yearPeriodDisplay="none"
			yearViewProps={{ className: styles.yearView, getDayProps, highlightToday: false, withHeader: false }}
			onEventClick={(event) => {
				if (selectedPeriodId || editorProps?.onSelectedDateRangeChange || !isCalendarSchedulePayload(event.payload) || event.payload.type !== 'period') return;
				onPeriodSelect?.(event.payload.sourceId);
			}}
		/>
	);
}
