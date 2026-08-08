'use client';

import { Checkbox, ColorSwatch, EVENT_TYPE_DEFS } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { type DatesScheduleEventType } from '../DatesSchedule/dates-schedule-events';

/* * */

interface DatesScheduleFiltersProps {
	counts: Record<DatesScheduleEventType, number>
	enabledTypes: Record<DatesScheduleEventType, boolean>
	onToggle: (type: DatesScheduleEventType) => void
}

const FILTER_TYPES: { label: string, type: DatesScheduleEventType }[] = [
	{ label: 'Períodos', type: 'period' },
	{ label: 'Anotações', type: 'annotation' },
	{ label: 'Feriados', type: 'holiday' },
	{ label: 'Eventos', type: 'event' },
];

/* * */

export function DatesScheduleFilters({ counts, enabledTypes, onToggle }: DatesScheduleFiltersProps) {
	return (
		<aside className={styles.root}>
			<h2 className={styles.title}>Filtrar eventos</h2>

			<div className={styles.filters}>
				{FILTER_TYPES.map(({ label, type }) => (
					<Checkbox
						key={type}
						checked={enabledTypes[type]}
						onChange={() => onToggle(type)}
						label={(
							<span className={styles.label}>
								<ColorSwatch color={EVENT_TYPE_DEFS[type].color} size={10} />
								<span>{label}</span>
								<span className={styles.count}>({counts[type]})</span>
							</span>
						)}
					/>
				))}
			</div>
		</aside>
	);
}
