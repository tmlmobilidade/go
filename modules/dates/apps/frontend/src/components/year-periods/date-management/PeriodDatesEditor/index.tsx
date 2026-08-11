'use client';

import { usePeriodsDetailContext } from '@/components/year-periods/detail/PeriodsDetail.context';
import { IconInfoCircle } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CalendarDate } from '@tmlmobilidade/types';
import { buildCalendarScheduleRuleImpactEvents, CalendarSchedule, type CalendarScheduleDateRangeAction, ErrorDisplay, isCalendarSchedulePayload, LoadingOverlay, Pane, type ScheduleEventData, Surface, Text, useTemporalSettingsContext } from '@tmlmobilidade/ui';
import { useCallback, useMemo } from 'react';

import styles from './styles.module.css';

import { usePeriodDatesEditorContext } from '../PeriodDatesEditor.context';
import { PeriodDatesEditorConflict } from '../PeriodDatesEditorConflict';
import { PeriodDatesEditorHeader } from '../PeriodDatesEditorHeader';
import { PeriodDatesEditorSummary } from '../PeriodDatesEditorSummary';

/* * */

export function PeriodDatesEditor() {
	//

	//
	// A. Setup variables

	const periodsDetailContext = usePeriodsDetailContext();
	const editorContext = usePeriodDatesEditorContext();
	const temporalSettings = useTemporalSettingsContext();

	//
	// B. Transform data

	const previewEvents = useMemo(
		() => buildCalendarScheduleRuleImpactEvents(editorContext.data.previewDates, temporalSettings.timezone),
		[editorContext.data.previewDates, temporalSettings.timezone],
	);
	const previewDateSet = useMemo(() => new Set(editorContext.data.previewDates), [editorContext.data.previewDates]);
	const conflictFooter = (
		editorContext.flags.is_checking_conflicts
		|| editorContext.data.conflictError
		|| editorContext.data.conflictWarning
	) ? <PeriodDatesEditorConflict key="conflict" /> : null;
	const isDateRangeDateApplicable = useCallback((date: CalendarDate, action: CalendarScheduleDateRangeAction) => {
		return action === 'remove' ? previewDateSet.has(date) : !previewDateSet.has(date);
	}, [previewDateSet]);

	//
	// C. Handle actions

	const handleEventClick = (event: ScheduleEventData) => {
		if (!isCalendarSchedulePayload(event.payload)) return;

		let route: string | undefined;
		if (event.payload.type === 'annotation') route = PAGE_ROUTES.dates.ANNOTATIONS_DETAIL(event.payload.sourceId);
		if (event.payload.type === 'holiday') route = PAGE_ROUTES.dates.HOLIDAYS_DETAIL(event.payload.sourceId);
		if (event.payload.type === 'event') route = PAGE_ROUTES.dates.EVENTS_DETAIL(event.payload.sourceId);
		if (event.payload.type === 'period') route = PAGE_ROUTES.dates.YEAR_PERIODS_DETAIL(event.payload.sourceId);

		if (route) window.open(route, '_blank', 'noopener,noreferrer');
	};

	//
	// D. Render components

	if (periodsDetailContext.flags.isLoading || editorContext.flags.is_loading) return <LoadingOverlay />;
	if (periodsDetailContext.flags.error) return <ErrorDisplay message={periodsDetailContext.flags.error.message} />;
	if (editorContext.flags.error) return <ErrorDisplay message={editorContext.flags.error.message} />;
	if (!periodsDetailContext.data.period) return <ErrorDisplay message="Período não encontrado" />;

	return (
		<Pane
			footer={[conflictFooter, <PeriodDatesEditorSummary key="summary" />]}
			header={[<PeriodDatesEditorHeader key="header" />]}
		>
			<div className={styles.root}>
				<div className={styles.instructions}>
					<IconInfoCircle size={20} aria-hidden />
					<Text size="sm">Comece num dia atribuído para remover datas, ou num dia livre para adicionar. Depois, selecione o último dia do intervalo.</Text>
				</div>

				<div className={styles.calendarScroll}>
					<Surface className={styles.calendar} height="full" variant="plain">
						<CalendarSchedule
							date={editorContext.data.visibleDate}
							dateChanges={{ added: editorContext.data.addedDates, removed: editorContext.data.removedDates }}
							dateRangeSelectionAction={editorContext.data.selectionAction}
							events={previewEvents}
							eventTypeFilters={{ annotation: false, event: false }}
							isDateRangeDateApplicable={isDateRangeDateApplicable}
							locale={temporalSettings.locale}
							onDateChange={editorContext.actions.setVisibleDate}
							onEventClick={handleEventClick}
							onSelectedDateRangeChange={editorContext.flags.can_edit ? editorContext.actions.setSelectedRange : undefined}
							selectedDateRange={editorContext.data.selectedRange}
							sources={editorContext.data.sources}
							timezone={temporalSettings.timezone}
							view="year"
							yearViewProps={{ highlightToday: false, viewSelectProps: { views: ['year'] } }}
						/>
					</Surface>
				</div>
			</div>
		</Pane>
	);

	//
}
