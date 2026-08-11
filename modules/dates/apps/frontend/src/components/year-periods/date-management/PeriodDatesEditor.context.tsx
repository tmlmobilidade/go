'use client';

import { useCalendarScheduleData } from '@/components/calendar/schedule/useCalendarScheduleData';
import { usePeriodsDetailContext } from '@/components/year-periods/detail/PeriodsDetail.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type CalendarDate, type OperationalDate, toCalendarDate, type UpdateYearPeriodDatesDto, validateOperationalDate, type YearPeriod } from '@tmlmobilidade/types';
import { type CalendarScheduleDateRange, type CalendarScheduleSources, useTemporalSettingsContext, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { mutate } from 'swr';

/* * */

export type PeriodDatesEditorSelectionAction = 'add' | 'remove';

interface PeriodDatesEditorContextState {
	actions: {
		acknowledgeConflicts: () => void
		resetChanges: () => void
		saveChanges: () => Promise<void>
		setSelectedRange: (value: CalendarScheduleDateRange | null) => void
		setVisibleDate: (value: string) => void
	}
	data: {
		addedDates: CalendarDate[]
		conflictError: null | string
		conflicts: { dates: OperationalDate[], yearPeriod: YearPeriod }[]
		conflictWarning: null | string
		previewDates: CalendarDate[]
		removedDates: CalendarDate[]
		selectedRange: CalendarScheduleDateRange | null
		selectedRangeDayCount: number
		selectionAction: null | PeriodDatesEditorSelectionAction
		sources: CalendarScheduleSources
		visibleDate: CalendarDate
	}
	flags: {
		can_edit: boolean
		can_save: boolean
		conflict_acknowledged: boolean
		error: Error | null
		has_changes: boolean
		is_checking_conflicts: boolean
		is_loading: boolean
		is_saving: boolean
	}
}

interface DraftChanges {
	added: Set<CalendarDate>
	removed: Set<CalendarDate>
}

/* * */

const PeriodDatesEditorContext = createContext<PeriodDatesEditorContextState | undefined>(undefined);

export function usePeriodDatesEditorContext() {
	const context = useContext(PeriodDatesEditorContext);
	if (!context) throw new Error('usePeriodDatesEditorContext must be used within a PeriodDatesEditorContextProvider');
	return context;
}

/* * */

function getRangeDates(range: CalendarScheduleDateRange): CalendarDate[] {
	const end = range.end ?? range.start;
	const cursor = new Date(`${range.start}T00:00:00Z`);
	const endTimestamp = new Date(`${end}T00:00:00Z`).getTime();
	const dates: CalendarDate[] = [];

	while (cursor.getTime() <= endTimestamp) {
		dates.push(toCalendarDate(cursor.toISOString().slice(0, 10)));
		cursor.setUTCDate(cursor.getUTCDate() + 1);
	}

	return dates;
}

function toOperationalDates(dates: CalendarDate[]): OperationalDate[] {
	return dates.map(date => validateOperationalDate(date.replaceAll('-', '')));
}

function filterSourcesByAgencies(sources: CalendarScheduleSources, agencyIds: Set<string>, currentPeriodId?: string): CalendarScheduleSources {
	const isRelevant = (source: { agency_ids?: string[] }) => {
		if (!source.agency_ids?.length) return true;
		return source.agency_ids.some(agencyId => agencyIds.has(agencyId));
	};

	return {
		agencies: sources.agencies?.filter(agency => agencyIds.has(agency._id)),
		annotations: sources.annotations?.filter(isRelevant),
		events: sources.events?.filter(isRelevant),
		holidays: sources.holidays?.filter(isRelevant),
		yearPeriods: sources.yearPeriods?.filter(period => period._id !== currentPeriodId && isRelevant(period)),
	};
}

/* * */

export function PeriodDatesEditorContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const periodsDetailContext = usePeriodsDetailContext();
	const temporalSettings = useTemporalSettingsContext();
	const scheduleData = useCalendarScheduleData(null);
	const period = periodsDetailContext.data.period;
	const conflictRequestId = useRef(0);
	const [selectedRange, setSelectedRangeState] = useState<CalendarScheduleDateRange | null>(null);
	const [selectionAction, setSelectionAction] = useState<null | PeriodDatesEditorSelectionAction>(null);
	const [visibleDate, setVisibleDateState] = useState<CalendarDate>(() => Dates.now(temporalSettings.timezone).calendar_date);
	const [draftChanges, setDraftChanges] = useState<DraftChanges>(() => ({ added: new Set(), removed: new Set() }));
	const [conflicts, setConflicts] = useState<{ dates: OperationalDate[], yearPeriod: YearPeriod }[]>([]);
	const [conflictError, setConflictError] = useState<null | string>(null);
	const [conflictAcknowledged, setConflictAcknowledged] = useState(false);
	const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	//
	// B. Transform data

	const initialDates = useMemo(() => new Set((period?.dates ?? []).map(toCalendarDate)), [period?.dates]);
	const previewDates = useMemo(() => {
		const dates = new Set(initialDates);
		draftChanges.removed.forEach(date => dates.delete(date));
		draftChanges.added.forEach(date => dates.add(date));
		return Array.from(dates).sort();
	}, [draftChanges, initialDates]);
	const previewDateSet = useMemo(() => new Set(previewDates), [previewDates]);
	const sources = useMemo(
		() => filterSourcesByAgencies(scheduleData.sources, new Set(period?.agency_ids ?? []), period?._id),
		[period?._id, period?.agency_ids, scheduleData.sources],
	);
	const addedDates = useMemo(() => Array.from(draftChanges.added).sort(), [draftChanges]);
	const removedDates = useMemo(() => Array.from(draftChanges.removed).sort(), [draftChanges]);
	const selectedRangeDayCount = selectedRange ? getRangeDates(selectedRange).length : 0;
	const hasChanges = addedDates.length > 0 || removedDates.length > 0;
	const conflictWarning = useMemo(() => {
		if (conflicts.length === 0) return null;

		const conflictingDates = new Set(conflicts.flatMap(conflict => conflict.dates));
		const periodNames = conflicts.map(conflict => conflict.yearPeriod.name).join(', ');
		const dateLabel = conflictingDates.size === 1 ? 'data será transferida' : 'datas serão transferidas';

		return `${conflictingDates.size} ${dateLabel} de: ${periodNames}`;
	}, [conflicts]);
	const canSave = hasChanges && !periodsDetailContext.flags.isReadOnly && !isCheckingConflicts && !isSaving && !conflictError && (conflicts.length === 0 || conflictAcknowledged);

	//
	// C. Handle actions

	const acknowledgeConflicts = useCallback(() => {
		setConflictAcknowledged(true);
	}, []);

	const resetChanges = useCallback(() => {
		setDraftChanges({ added: new Set(), removed: new Set() });
		setSelectedRangeState(null);
		setSelectionAction(null);
		setConflicts([]);
		setConflictError(null);
		setConflictAcknowledged(false);
	}, []);

	const setSelectedRange = useCallback((value: CalendarScheduleDateRange | null) => {
		setSelectedRangeState(value);

		if (!value) {
			setSelectionAction(null);
			return;
		}

		if (!value.end) {
			setSelectionAction(previewDateSet.has(value.start) ? 'remove' : 'add');
			return;
		}

		if (periodsDetailContext.flags.isReadOnly) return;

		const action = selectionAction ?? (previewDateSet.has(value.start) ? 'remove' : 'add');
		const rangeDates = getRangeDates(value);
		setDraftChanges((current) => {
			const added = new Set(current.added);
			const removed = new Set(current.removed);

			for (const date of rangeDates) {
				if (action === 'add') {
					removed.delete(date);
					if (initialDates.has(date)) added.delete(date);
					else added.add(date);
				} else {
					added.delete(date);
					if (initialDates.has(date)) removed.add(date);
					else removed.delete(date);
				}
			}

			return { added, removed };
		});
	}, [initialDates, periodsDetailContext.flags.isReadOnly, previewDateSet, selectionAction]);

	const setVisibleDate = useCallback((value: string) => {
		setVisibleDateState(toCalendarDate(value.slice(0, 10)));
	}, []);

	const saveChanges = useCallback(async () => {
		if (!period || !canSave) return;

		setIsSaving(true);
		const toastId = useToast.loading({
			message: 'Por favor aguarde...',
			title: 'A guardar datas do período',
		});

		const payload: UpdateYearPeriodDatesDto = {
			add_dates: toOperationalDates(addedDates),
			remove_dates: toOperationalDates(removedDates),
		};
		const response = await fetchData<YearPeriod>(
			API_ROUTES.dates.YEAR_PERIODS_DETAIL_DATES(period._id),
			'PUT',
			payload,
		);

		if (response.error || !response.data) {
			useToast.update(toastId, {
				loading: false,
				message: response.error ?? 'Não foi possível guardar as datas do período.',
				title: 'Erro',
				type: 'error',
			});
			setIsSaving(false);
			return;
		}

		await Promise.all([
			mutate(API_ROUTES.dates.YEAR_PERIODS_DETAIL(period._id), response.data, false),
			mutate(API_ROUTES.dates.YEAR_PERIODS_LIST),
		]);
		resetChanges();
		useToast.update(toastId, {
			loading: false,
			message: 'As datas do período foram atualizadas.',
			title: 'Alterações guardadas',
			type: 'success',
		});
		setIsSaving(false);
	}, [addedDates, canSave, period, removedDates, resetChanges]);

	useEffect(() => {
		const requestId = ++conflictRequestId.current;
		setConflictAcknowledged(false);
		setConflictError(null);

		if (!period || addedDates.length === 0) {
			setConflicts([]);
			setIsCheckingConflicts(false);
			return;
		}

		setIsCheckingConflicts(true);

		void fetchData<{ conflicts: { dates: OperationalDate[], year_period: YearPeriod }[] }>(
			API_ROUTES.dates.YEAR_PERIODS_CHECK_CONFLICTS,
			'POST',
			{
				agency_ids: period.agency_ids,
				dates: toOperationalDates(addedDates),
				year_period_id: period._id,
			},
		).then((response) => {
			if (requestId !== conflictRequestId.current) return;

			if (response.error || !response.data) {
				setConflicts([]);
				setConflictError(response.error ?? 'Não foi possível verificar conflitos.');
				return;
			}

			setConflicts(response.data.conflicts.map(conflict => ({
				dates: conflict.dates,
				yearPeriod: conflict.year_period,
			})));
		}).finally(() => {
			if (requestId === conflictRequestId.current) setIsCheckingConflicts(false);
		});
	}, [addedDates, period]);

	useEffect(() => {
		setSelectedRangeState(null);
		setSelectionAction(null);
		setDraftChanges({ added: new Set(), removed: new Set() });
		setConflicts([]);
		setConflictError(null);
		setConflictAcknowledged(false);
		setVisibleDateState(Dates.now(temporalSettings.timezone).calendar_date);
	}, [period?._id, temporalSettings.timezone]);

	//
	// D. Define context value

	const contextValue = useMemo<PeriodDatesEditorContextState>(() => ({
		actions: {
			acknowledgeConflicts,
			resetChanges,
			saveChanges,
			setSelectedRange,
			setVisibleDate,
		},
		data: {
			addedDates,
			conflictError,
			conflicts,
			conflictWarning,
			previewDates,
			removedDates,
			selectedRange,
			selectedRangeDayCount,
			selectionAction,
			sources,
			visibleDate,
		},
		flags: {
			can_edit: !periodsDetailContext.flags.isReadOnly,
			can_save: canSave,
			conflict_acknowledged: conflictAcknowledged,
			error: scheduleData.error,
			has_changes: hasChanges,
			is_checking_conflicts: isCheckingConflicts,
			is_loading: scheduleData.isLoading,
			is_saving: isSaving,
		},
	}), [acknowledgeConflicts, addedDates, canSave, conflictAcknowledged, conflictError, conflicts, conflictWarning, hasChanges, isCheckingConflicts, isSaving, periodsDetailContext.flags.isReadOnly, previewDates, removedDates, resetChanges, saveChanges, scheduleData.error, scheduleData.isLoading, selectedRange, selectedRangeDayCount, selectionAction, setSelectedRange, setVisibleDate, sources, visibleDate]);

	//
	// E. Render components

	return (
		<PeriodDatesEditorContext.Provider value={contextValue}>
			{children}
		</PeriodDatesEditorContext.Provider>
	);

	//
}
