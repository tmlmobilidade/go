'use client';

import { usePeriodsCalendarContext } from '@/components/year-periods/calendar/PeriodsCalendar.context';
import { usePeriodsCalendarAgency } from '@/components/year-periods/calendar/use-periods-calendar-agency';
import { usePeriodsDetailData } from '@/components/year-periods/detail/use-periods-detail-data';
import { createPeriodDatesDraft, getPeriodRangeDates, reducePeriodDatesDraft } from '@/components/year-periods/shared/periods-date-draft';
import { getPeriodsPermissions } from '@/components/year-periods/shared/periods-permissions';
import { usePeriodsData } from '@/components/year-periods/shared/use-periods-data';
import { type CalendarDate, toCalendarDate } from '@tmlmobilidade/go-types-shared';
import { type CalendarScheduleDateRange, type CalendarScheduleSources, useCalendarScheduleData, useMeData } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

/* * */

interface PeriodDatesEditorContextState {
	actions: {
		cancelSelection: () => void
		resetChanges: () => void
		setSelectedRange: (range: CalendarScheduleDateRange | null) => void
		setVisibleDate: (date: string) => void
	}
	data: {
		addedDates: CalendarDate[]
		calendarAgencyIds: string[]
		previewDates: CalendarDate[]
		removedDates: CalendarDate[]
		selectedRange: CalendarScheduleDateRange | null
		selectedRangeDayCount: number
		selectionAction: 'add' | 'remove' | null
		sources: CalendarScheduleSources
		visibleDate: CalendarDate
	}
	flags: {
		can_edit: boolean
		error: Error | null
		has_changes: boolean
		is_loading: boolean
		is_locked: boolean
		is_permission_restricted: boolean
	}
}

/* * */

const PeriodDatesEditorContext = createContext<PeriodDatesEditorContextState | undefined>(undefined);

export function usePeriodDatesEditorContext() {
	const context = useContext(PeriodDatesEditorContext);
	if (!context) throw new Error('usePeriodDatesEditorContext must be used within PeriodDatesEditorContextProvider');
	return context;
}

/* * */

export function PeriodDatesEditorContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { data: period, error: periodError, isLoading: periodLoading } = usePeriodsDetailData();
	const { data: me, error: meError, isLoading: meLoading } = useMeData();
	const { data: allPeriods, error: listError, isLoading: listLoading } = usePeriodsData();
	const calendarAgency = usePeriodsCalendarAgency();
	const schedule = useCalendarScheduleData(null);
	const calendar = usePeriodsCalendarContext();
	const [draft, dispatch] = useReducer(reducePeriodDatesDraft, undefined, createPeriodDatesDraft);

	//
	// B. Transform data

	const calendarAgencyIds = useMemo(() => {
		const id = period?.agency_ids.find(id => id === calendarAgency.value) ?? period?.agency_ids.find(id => calendarAgency.options.some(option => option.value === id));
		return id ? [id] : [];
	}, [calendarAgency.value, calendarAgency.options, period?.agency_ids]);

	const initialDates = useMemo(() => new Set((period?.dates ?? []).map(toCalendarDate)), [period?.dates]);

	const previewDates = useMemo(() => {
		const dates = new Set(initialDates);
		draft.removed.forEach(date => dates.delete(date));
		draft.added.forEach(date => dates.add(date));
		return [...dates].sort();
	}, [draft.added, draft.removed, initialDates]);

	const previewDateSet = useMemo(() => new Set(previewDates), [previewDates]);
	const addedDates = useMemo(() => [...draft.added].sort(), [draft.added]);
	const removedDates = useMemo(() => [...draft.removed].sort(), [draft.removed]);

	const sources = useMemo(() => {
		const relevant = (source: { agency_ids?: string[] }) => !source.agency_ids?.length || source.agency_ids.some(id => calendarAgencyIds.includes(id));
		return {
			agencies: schedule.sources.agencies.filter(agency => calendarAgencyIds.includes(agency._id)),
			holidays: schedule.sources.holidays.filter(relevant),
			yearPeriods: allPeriods.filter(item => item._id !== period?._id && relevant(item)),
		};
	}, [allPeriods, calendarAgencyIds, period?._id, schedule.sources]);

	const permissions = getPeriodsPermissions({ currentAgencyIds: period?.agency_ids, selectedAgencyIds: period?.agency_ids ?? [], userPermissions: me?.permissions });
	const isLoading = periodLoading || listLoading || meLoading || schedule.isLoading || calendarAgency.isLoading;
	const error = periodError ?? listError ?? meError ?? calendarAgency.error ?? schedule.error?.message;
	const canEdit = !!period && !period.is_locked && permissions.edit && !isLoading && !error;

	//
	// C. Handle actions

	const resetChanges = useCallback(() => dispatch({ type: 'reset' }), []);
	const cancelSelection = useCallback(() => dispatch({ type: 'cancel' }), []);
	const setSelectedRange = useCallback((range: CalendarScheduleDateRange | null) => {
		if (!canEdit) return;
		dispatch({ initialDates, previewDates: previewDateSet, range, type: 'select' });
	}, [canEdit, initialDates, previewDateSet]);

	useEffect(() => {
		resetChanges();
	}, [period?._id, resetChanges]);

	//
	// D. Return context value

	const value = useMemo<PeriodDatesEditorContextState>(() => ({
		actions: {
			cancelSelection,
			resetChanges,
			setSelectedRange,
			setVisibleDate: calendar.actions.setDate,
		},
		data: {
			addedDates,
			calendarAgencyIds,
			previewDates,
			removedDates,
			selectedRange: draft.selectedRange,
			selectedRangeDayCount: draft.selectedRange?.end ? getPeriodRangeDates(draft.selectedRange).length : 0,
			selectionAction: draft.selectionAction,
			sources,
			visibleDate: calendar.data.date,
		},
		flags: {
			can_edit: canEdit,
			error: error ? new Error(error) : null,
			has_changes: addedDates.length > 0 || removedDates.length > 0,
			is_loading: isLoading,
			is_locked: !!period?.is_locked,
			is_permission_restricted: !!period && !meLoading && !meError && !permissions.edit,
		},
	}), [period, meLoading, meError, permissions.edit, addedDates, calendar.actions.setDate, calendar.data.date, calendarAgencyIds, canEdit, cancelSelection, draft.selectedRange, draft.selectionAction, error, isLoading, previewDates, removedDates, resetChanges, setSelectedRange, sources]);

	return (
		<PeriodDatesEditorContext.Provider value={value}>
			{children}
		</PeriodDatesEditorContext.Provider>
	);
}
