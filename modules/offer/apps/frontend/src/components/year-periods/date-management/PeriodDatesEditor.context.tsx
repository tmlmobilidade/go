'use client';

import { usePeriodsDetailData } from '@/components/year-periods/detail/use-periods-detail-data';
import { getPeriodsPermissions } from '@/components/year-periods/shared/periods-permissions';
import { usePeriodsAssignmentReview, type UsePeriodsAssignmentReviewReturnType } from '@/components/year-periods/shared/use-periods-assignment-review';
import { usePeriodsData } from '@/components/year-periods/shared/use-periods-data';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type UpdateYearPeriodDatesDto, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type CalendarDate, type OperationalDate, toCalendarDate, validateOperationalDate } from '@tmlmobilidade/go-types-shared';
import { useCalendarScheduleData } from '@tmlmobilidade/ui';
import { type CalendarScheduleDateRange, type CalendarScheduleSources, fetchApiData, useHandleAction, useMeData, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

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
	assignmentReview: UsePeriodsAssignmentReviewReturnType
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

	const { data: period, error: periodError, isLoading: periodLoading, mutate: detailMutate } = usePeriodsDetailData();
	const { data: me, error: meError, isLoading: meLoading } = useMeData();
	const { mutate: listMutate } = usePeriodsData();
	const scheduleData = useCalendarScheduleData(null);
	const [selectedRange, setSelectedRangeState] = useState<CalendarScheduleDateRange | null>(null);
	const [selectionAction, setSelectionAction] = useState<null | PeriodDatesEditorSelectionAction>(null);
	const [visibleDate, setVisibleDateState] = useState<CalendarDate>(() => Dates.now('local').calendar_date);
	const [draftChanges, setDraftChanges] = useState<DraftChanges>(() => ({ added: new Set(), removed: new Set() }));

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
	const permissions = getPeriodsPermissions({ currentAgencyIds: period?.agency_ids, selectedAgencyIds: period?.agency_ids ?? [], userPermissions: me?.permissions });
	const reviewRequest = useMemo(() => period && addedDates.length ? {
		agency_ids: [...period.agency_ids].sort(),
		dates: toOperationalDates(addedDates),
		year_period_id: period._id,
	} : null, [addedDates, period]);
	const review = usePeriodsAssignmentReview({ request: reviewRequest, userPermissions: me?.permissions });
	const conflicts = useMemo(() => review.conflicts.map(conflict => ({ dates: conflict.dates, yearPeriod: conflict.year_period })), [review.conflicts]);
	const conflictError = review.error;
	const conflictAcknowledged = review.acknowledged;
	const isCheckingConflicts = review.isChecking;
	const conflictWarning = conflicts.length ? conflicts.map(conflict => conflict.yearPeriod.name).join(', ') : null;

	//
	// C. Handle actions

	const acknowledgeConflicts = useCallback(() => {
		review.acknowledge();
	}, [review]);

	const resetChanges = useCallback(() => {
		setDraftChanges({ added: new Set(), removed: new Set() });
		setSelectedRangeState(null);
		setSelectionAction(null);
	}, []);

	const { action: saveRequest, isLoading: isSaving } = useHandleAction({
		fetchFn: async (body: UpdateYearPeriodDatesDto) => await fetchApiData<YearPeriod>({ body, method: 'PUT', url: API_ROUTES.offer.YEAR_PERIODS_DETAIL_DATES(period?._id ?? '') }),
		onSuccess: (response) => {
			detailMutate(response, { revalidate: false });
			listMutate();
			resetChanges();
		},
	});
	const capabilities = useStandardFormCapabilities({
		form: { isDirty: hasChanges, isValid: true },
		loading: { isLoading: periodLoading || meLoading || !period || !!periodError || !!meError },
		locked: { isLocked: period?.is_locked },
		update: { hasPermission: permissions.update, isUpdating: isSaving },
	});
	const editEnabled = capabilities.editEnabled && permissions.edit && !!period && !periodLoading && !meLoading && !periodError && !meError;
	const canSave = capabilities.updateEnabled && !isCheckingConflicts && !conflictError && (!addedDates.length || review.isReady);

	const setSelectedRange = useCallback((value: CalendarScheduleDateRange | null) => {
		if (!editEnabled) return;
		setSelectedRangeState(value);

		if (!value) {
			setSelectionAction(null);
			return;
		}

		if (!value.end) {
			setSelectionAction(previewDateSet.has(value.start) ? 'remove' : 'add');
			return;
		}

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
	}, [initialDates, editEnabled, previewDateSet, selectionAction]);

	const setVisibleDate = useCallback((value: string) => {
		setVisibleDateState(toCalendarDate(value.slice(0, 10)));
	}, []);

	const saveChanges = useCallback(async () => {
		if (!period || !canSave) return;
		await saveRequest({ add_dates: toOperationalDates(addedDates), remove_dates: toOperationalDates(removedDates) });
	}, [addedDates, canSave, period, removedDates, saveRequest]);

	useEffect(() => {
		setSelectedRangeState(null);
		setSelectionAction(null);
		setDraftChanges({ added: new Set(), removed: new Set() });
		setVisibleDateState(Dates.now('local').calendar_date);
	}, [period?._id]);

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
		assignmentReview: review,
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
			can_edit: editEnabled,
			can_save: canSave,
			conflict_acknowledged: conflictAcknowledged,
			error: scheduleData.error ?? (periodError ? new Error(periodError) : null),
			has_changes: hasChanges,
			is_checking_conflicts: isCheckingConflicts,
			is_loading: scheduleData.isLoading || periodLoading || meLoading,
			is_saving: isSaving,
		},
	}), [review, acknowledgeConflicts, addedDates, canSave, conflictAcknowledged, conflictError, conflicts, conflictWarning, hasChanges, isCheckingConflicts, isSaving, editEnabled, periodError, periodLoading, meLoading, previewDates, removedDates, resetChanges, saveChanges, scheduleData.error, scheduleData.isLoading, selectedRange, selectedRangeDayCount, selectionAction, setSelectedRange, setVisibleDate, sources, visibleDate]);

	//
	// E. Render components

	return (
		<PeriodDatesEditorContext.Provider value={contextValue}>
			{children}
		</PeriodDatesEditorContext.Provider>
	);

	//
}
