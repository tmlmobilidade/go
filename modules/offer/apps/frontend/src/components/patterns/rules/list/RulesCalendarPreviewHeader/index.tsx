'use client';

import { CalendarAffectedDaysCount, CloseButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeRulesCalendarPreviewModal } from '../RulesCalendarPreview.modal';

/* * */

export function RulesCalendarPreviewHeader({ affectedDayCount, patternCode }: { affectedDayCount: number, patternCode: string }) {
	const { t } = useTranslation();

	return (
		<Toolbar>
			<CloseButton onClick={closeRulesCalendarPreviewModal} type="close" />
			<Tag label={t('default:scheduling.copy.previewCalendar')} variant="muted" />
			<Tag label={patternCode} variant="muted" />
			<Spacer />
			<CalendarAffectedDaysCount count={affectedDayCount} layout="inline" />
		</Toolbar>
	);
}
