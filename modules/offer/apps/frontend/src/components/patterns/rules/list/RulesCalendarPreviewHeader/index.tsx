'use client';

import { CalendarAffectedDaysCount, CloseButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

import { closeRulesCalendarPreviewModal } from '../RulesCalendarPreview.modal';

/* * */

export function RulesCalendarPreviewHeader({ affectedDayCount, patternCode }: { affectedDayCount: number, patternCode: string }) {
	return (
		<Toolbar>
			<CloseButton onClick={closeRulesCalendarPreviewModal} type="close" />
			<Tag label="Prever calendário" variant="muted" />
			<Tag label={patternCode} variant="muted" />
			<Spacer />
			<CalendarAffectedDaysCount count={affectedDayCount} layout="inline" />
		</Toolbar>
	);
}
