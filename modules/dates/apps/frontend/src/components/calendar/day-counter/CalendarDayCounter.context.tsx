'use client';

import { useCalendarScheduleData } from '@/components/calendar/schedule/useCalendarScheduleData';
import { Dates, getManualRuleAffectedDates } from '@tmlmobilidade/dates';
import { type CalendarDate, type IsoWeekday, type ManualRule, type Month, MONTH_OPTIONS, toCalendarDate } from '@tmlmobilidade/types';
import { type CalendarScheduleSources, useTemporalSettingsContext } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

/* * */

const ALL_MONTHS = MONTH_OPTIONS.map(option => option.value);

/* * */

interface CalendarDayCounterContextState {
	actions: {
		clearCriteria: () => void
		setAgencyId: (value: null | string) => void
		setMonths: (value: Month[]) => void
		setPeriodIds: (value: string[]) => void
		setVisibleDate: (value: string) => void
		setWeekdays: (value: IsoWeekday[]) => void
	}
	data: {
		agencyOptions: { label: string, value: string }[]
		periods: { _id: string, name: string }[]
		ruleImpact: {
			count: number
			dates: CalendarDate[]
		}
		sources: CalendarScheduleSources
	}
	filters: {
		agencyId: null | string
		months: Month[]
		periodIds: string[]
		visibleDate: CalendarDate
		weekdays: IsoWeekday[]
	}
	flags: {
		can_calculate: boolean
		is_loading: boolean
	}
}

interface CalendarDayCounterContextProviderProps {
	initialAgencyId?: null | string
}

/* * */

const CalendarDayCounterContext = createContext<CalendarDayCounterContextState | undefined>(undefined);

export function useCalendarDayCounterContext() {
	const context = useContext(CalendarDayCounterContext);
	if (!context) throw new Error('useCalendarDayCounterContext must be used within a CalendarDayCounterContextProvider');
	return context;
}

/* * */

export function CalendarDayCounterContextProvider({ children, initialAgencyId = null }: PropsWithChildren<CalendarDayCounterContextProviderProps>) {
	//

	//
	// A. Setup variables

	const temporalSettings = useTemporalSettingsContext();
	const [agencyId, setAgencyId] = useState<null | string>(initialAgencyId);
	const [months, setMonths] = useState<Month[]>([...ALL_MONTHS]);
	const [periodIds, setPeriodIds] = useState<string[]>([]);
	const [visibleDate, setVisibleDate] = useState<CalendarDate>(() => Dates.now(temporalSettings.timezone).calendar_date);
	const [weekdays, setWeekdays] = useState<IsoWeekday[]>([]);
	const scheduleData = useCalendarScheduleData(agencyId);

	//
	// B. Transform data

	const periods = useMemo(() => scheduleData.sources.yearPeriods.map(period => ({
		_id: period._id,
		name: period.name,
	})), [scheduleData.sources.yearPeriods]);

	const canCalculate = Boolean(agencyId && periodIds.length && weekdays.length && months.length);
	const previewYear = Number(visibleDate.slice(0, 4));

	const ruleImpact = useMemo(() => {
		if (!canCalculate) return { count: 0, dates: [] };

		const rule: ManualRule = {
			_id: 'calendar-day-counter',
			kind: 'manual',
			months,
			operating_mode: 'include',
			timepoints: [],
			weekdays,
			year_period_ids: periodIds,
		};

		return getManualRuleAffectedDates(rule, {
			endDate: toCalendarDate(`${previewYear}-12-31`),
			holidays: scheduleData.sources.holidays,
			periods: scheduleData.sources.yearPeriods,
			startDate: toCalendarDate(`${previewYear}-01-01`),
			timezone: temporalSettings.timezone,
		});
	}, [canCalculate, months, periodIds, previewYear, scheduleData.sources.holidays, scheduleData.sources.yearPeriods, temporalSettings.timezone, weekdays]);

	//
	// C. Handle actions

	const handleAgencyChange = useCallback((value: null | string) => {
		setAgencyId(value);
		setPeriodIds([]);
	}, []);

	const handleClearCriteria = useCallback(() => {
		setMonths([...ALL_MONTHS]);
		setPeriodIds([]);
		setWeekdays([]);
	}, []);

	const handleVisibleDateChange = useCallback((value: string) => {
		setVisibleDate(toCalendarDate(value.slice(0, 10)));
	}, []);

	//
	// D. Define context value

	const contextValue = useMemo<CalendarDayCounterContextState>(() => ({
		actions: {
			clearCriteria: handleClearCriteria,
			setAgencyId: handleAgencyChange,
			setMonths,
			setPeriodIds,
			setVisibleDate: handleVisibleDateChange,
			setWeekdays,
		},
		data: {
			agencyOptions: scheduleData.agencyOptions,
			periods,
			ruleImpact,
			sources: scheduleData.sources,
		},
		filters: {
			agencyId,
			months,
			periodIds,
			visibleDate,
			weekdays,
		},
		flags: {
			can_calculate: canCalculate,
			is_loading: scheduleData.isLoading,
		},
	}), [agencyId, canCalculate, handleAgencyChange, handleClearCriteria, handleVisibleDateChange, months, periodIds, periods, ruleImpact, scheduleData.agencyOptions, scheduleData.isLoading, scheduleData.sources, visibleDate, weekdays]);

	//
	// E. Render components

	return (
		<CalendarDayCounterContext.Provider value={contextValue}>
			{children}
		</CalendarDayCounterContext.Provider>
	);

	//
}
