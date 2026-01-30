'use client';

/* * */

import { CalendarKey } from '@tmlmobilidade/dates';
import { CalendarEvent } from '@tmlmobilidade/types';
import { EventsCalendar, Pane } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { RulesCalendarPreviewHeader } from '../RulesCalendarPreviewHeader';

/* * */

export function RulesCalendarPreview({ rulesPreview }) {
	//

	//
	// A. Setup variables

	const ruleImpactEvents = useMemo(() => {
		const events: CalendarEvent[] = rulesPreview?.dates
			.filter((k): k is CalendarKey => typeof k === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(k))
			.map(key => ({
				color: 'var(--color-primary)',
				display: 'cell' as const,
				endDate: key,
				id: `rule-impact:${key}`,
				metadata: {
					timePoints: Array.from(rulesPreview.byDate?.get(key) ?? []).sort(),
				},
				startDate: key,
				title: 'Dia afetado pela regra',
				type: 'rule-impact' as const,
			}));

		return events;
	}, [rulesPreview]);

	//
	// B. Render components

	return (
		<Pane header={[<RulesCalendarPreviewHeader />]}>
			<EventsCalendar
				additionalEvents={ruleImpactEvents}
				initialView="year"
				showSidebar={false}
			/>
		</Pane>
	);
}
