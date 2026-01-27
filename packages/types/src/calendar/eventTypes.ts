// calendarEventTypes.ts
import { IconBeach, IconNote, TablerIcon } from '@tabler/icons-react';

import { CalendarEventType } from './event.js';

export const EVENT_TYPE_DEFS: Record<
  'event' | CalendarEventType,
	{ color: string, icon?: TablerIcon, label: string }
> = {
	'annotation': { color: '#f59e0b', icon: IconNote, label: 'Anotações' },
	'event': { color: 'var(--color-primary)', label: 'Dias afetados' },
	'holiday': { color: '#8b5cf6', icon: IconBeach, label: 'Feriados' },
	'period': { color: 'var(--color-primary)', label: 'Períodos' },
	'rule-impact': { color: 'var(--color-primary)', label: 'Dias afetados' },
};
