'use client';

import { PeriodsCalendar } from '@/components/year-periods/calendar/PeriodsCalendar';
import { PeriodsCalendarLegend } from '@/components/year-periods/calendar/PeriodsCalendarLegend';
import { usePeriodsDetailFormContext } from '@/components/year-periods/detail/PeriodsDetailForm.context';
import { usePeriodsDetailData } from '@/components/year-periods/detail/use-periods-detail-data';
import { usePeriodsData } from '@/components/year-periods/shared/use-periods-data';
import { IconInfoCircle } from '@tabler/icons-react';
import { type CalendarDate } from '@tmlmobilidade/go-types-shared';
import { Alert, type CalendarScheduleDateRangeAction, ErrorDisplay, LoadingOverlay, Text } from '@tmlmobilidade/ui';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { usePeriodDatesEditorContext } from '../PeriodDatesEditor.context';
import { PeriodDatesEditorCalendarHeader } from '../PeriodDatesEditorCalendarHeader';

/* * */

export function PeriodDatesEditor() {
	//

	//
	// A. Setup variables

	const { data: period, error, isLoading } = usePeriodsDetailData();
	const { data: periods } = usePeriodsData();
	const editor = usePeriodDatesEditorContext();
	const form = usePeriodsDetailFormContext();
	const { t } = useTranslation();

	//
	// B. Transform data

	const previewDateSet = useMemo(() => new Set(editor.data.previewDates), [editor.data.previewDates]);
	const visiblePeriods = useMemo(() => periods.filter(item => item.agency_ids.some(id => editor.data.calendarAgencyIds.includes(id))).map(item => item._id === period?._id ? period : item), [periods, period, editor.data.calendarAgencyIds]);
	const isDateRangeDateApplicable = useCallback((date: CalendarDate, action: CalendarScheduleDateRangeAction) => action === 'remove' ? previewDateSet.has(date) : !previewDateSet.has(date), [previewDateSet]);

	//
	// C. Render components

	if (isLoading || editor.flags.is_loading) return <LoadingOverlay />;
	if (error) return <ErrorDisplay message={error} />;
	if (editor.flags.error) return <ErrorDisplay message={editor.flags.error.message} />;
	if (!period) return null;
	return (
		<div className={styles.root}>
			{(editor.flags.is_permission_restricted || editor.flags.is_locked) && (
				<Alert title={t('default:periods.calendar.readOnly')} variant="warning">
					<Text size="sm">
						{t(editor.flags.is_permission_restricted ? 'default:periods.calendar.readOnlyPermissions' : 'default:periods.calendar.readOnlyLocked')}
					</Text>
				</Alert>
			)}
			{form.capabilities.editEnabled && (
				<div className={styles.instructions}>
					<IconInfoCircle size={20} aria-hidden />
					<Text size="sm">{t('default:periods.calendar.editHint')}</Text>
				</div>
			)}
			<PeriodDatesEditorCalendarHeader />
			<PeriodsCalendarLegend disabled={form.status.isUpdating} periods={visiblePeriods} selectedPeriodId={period._id} />
			<PeriodsCalendar
				agencyIds={editor.data.calendarAgencyIds}
				date={editor.data.visibleDate}
				editorProps={form.capabilities.editEnabled && editor.flags.can_edit ? { dateChanges: { added: editor.data.addedDates, removed: editor.data.removedDates }, dateRangeSelectionAction: editor.data.selectionAction, isDateRangeDateApplicable, onSelectedDateRangeChange: editor.actions.setSelectedRange, selectedDateRange: editor.data.selectedRange } : undefined}
				onDateChange={editor.actions.setVisibleDate}
				periods={visiblePeriods}
				previewDates={editor.data.previewDates}
				selectedPeriodId={period._id}
				sources={editor.data.sources}
			/>
		</div>
	);
}
