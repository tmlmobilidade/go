import { IconBeach, IconCalendarStar, IconNote, TablerIcon } from '@tabler/icons-react';
import { CalendarEventType } from '@tmlmobilidade/types/src/calendar/event.js';

export const EVENT_TYPE_DEFS: Record<'event' | CalendarEventType, { color: string, icon?: TablerIcon, label: string }> = {
	'annotation': { color: '#f59e0b', icon: IconNote, label: 'Anotações' },
	'event': { color: '#00bd72ff', icon: IconCalendarStar, label: 'Dias afetados' },
	'holiday': { color: '#8b5cf6', icon: IconBeach, label: 'Feriados' },
	'period': { color: 'var(--color-system-text-200)', label: 'Períodos' },
	'rule-impact': { color: 'var(--color-primary)', label: 'Dias afetados' },
};
