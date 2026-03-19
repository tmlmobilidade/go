'use client';

/* * */

import { useEventsDetailContext } from '@/components/events/detail/EventsDetail.context';
import { usePeriodsListContext } from '@/components/year-periods/list/PeriodsList.context';
import { IconArrowRight, IconCalendarCancel, IconCalendarRepeat } from '@tabler/icons-react';
import { Dates, FORMATS } from '@tmlmobilidade/dates';
import { EventRule, WEEKDAY_OPTIONS } from '@tmlmobilidade/types';
import { IconButton, Section, Text } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

interface RuleCardProps {
	rule: EventRule
}

/* * */

export function RuleCard({ rule }: RuleCardProps) {
	//

	//
	// A. Setup variables

	const eventsDetailContext = useEventsDetailContext();
	const periodsContext = usePeriodsListContext();

	const isRestriction = rule.kind === 'event_restriction';
	const isReplacement = rule.kind === 'event_replacement';

	const eventDates = rule.dates?.map(d =>
		Dates.fromOperationalDate(d, 'Europe/Lisbon')
			.toLocaleString(FORMATS.DATE_SHORT, 'pt-PT'),
	).join(', ') ?? '';

	const eventDatesSuffix = rule.dates?.length > 1
		? `(nos dias ${eventDates})`
		: `(no dia ${eventDates})`;

	// Lines information
	const linesMode = rule.lines_mode || 'all';
	const affectedLinesCount = useMemo(() => linesMode === 'all'
		? eventsDetailContext.data.lines?.length ?? 0
		: linesMode === 'include'
			? rule.lines_to_include?.length ?? 0
			: linesMode === 'exclude'
				? (eventsDetailContext.data.lines?.length ?? 0) - (rule.lines_to_exclude?.length ?? 0)
				: 0,
	[linesMode, eventsDetailContext.data.lines, rule.lines_to_include, rule.lines_to_exclude]);

	const linesText = affectedLinesCount > 0
		? `${affectedLinesCount} ${affectedLinesCount > 1 ? 'linhas' : 'linha'}`
		: 'Nenhuma linha';

	// Build detailed lines description
	let linesDescription = '';
	if (linesMode === 'all') {
		linesDescription = 'Todas as linhas';
	} else if (linesMode === 'include' && rule.lines_to_include?.length) {
		const lineNames = rule.lines_to_include
			.map(lineId => eventsDetailContext.data.lines?.find(l => l._id === lineId)?.code)
			.filter(Boolean)
			.join(', ');
		linesDescription = `Linhas ${lineNames}`;
	} else if (linesMode === 'exclude' && rule.lines_to_exclude?.length) {
		const lineNames = rule.lines_to_exclude
			.map(lineId => eventsDetailContext.data.lines?.find(l => l._id === lineId)?.code)
			.filter(Boolean)
			.join(', ');
		linesDescription = `Todas exceto ${lineNames}`;
	} else {
		linesDescription = 'Nenhuma linha';
	}

	// For replacement rules, build the "funcionará como" text
	let replacementText = '';
	if (isReplacement && rule.kind === 'event_replacement') {
		const weekdayLabels = rule.weekdays?.map(wd =>
			WEEKDAY_OPTIONS.find(opt => opt.value === wd)?.label,
		).filter(Boolean).join(', ') ?? '';

		const periodNames = rule.year_period_ids?.map(pid =>
			periodsContext.data.raw.find(p => p._id === pid)?.name,
		).filter(Boolean).join(', ') ?? '';

		const parts = [weekdayLabels, periodNames].filter(Boolean);
		replacementText = parts.length > 0 ? `${parts.join(' · ')}` : '';
	}
	// B. Handle actions

	const handleEdit = () => {
		eventsDetailContext.actions.openRuleModal(rule);
	};

	//
	// C. Render components

	return (
		<div className={styles.container} onClick={handleEdit}>
			<Section gap="md" justifyContent="space-between" padding="none">

				<Section gap="xs" padding="none">
					<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
						{isRestriction && (
							<>
								<IconCalendarCancel color="var(--color-status-danger-primary)" size={20} />
								<Text size="lg">Restrição da oferta</Text>
							</>
						)}
						{isReplacement && (
							<>
								<IconCalendarRepeat color="var(--color-primary)" size={20} />
								<Text size="lg">Substituição da oferta</Text>
							</>
						)}
						<Text c="dimmed" className={styles.timesCount}>
							· {linesText} · {rule.dates?.length ?? 0} {(rule.dates?.length ?? 0) > 1 ? 'dias' : 'dia'}
						</Text>
					</Section>

					<Text c="dimmed" size="sm">{linesDescription}</Text>
				</Section>

				{isRestriction && (
					<Text size="sm" style={{ fontFamily: 'monospace' }}>
						{!rule.all_day
							? `${rule.start_time} às ${rule.end_time} ${eventDatesSuffix}`
							: `Todo o dia ${eventDatesSuffix}`}
					</Text>
				)}

				{isReplacement && (
					<>
						<Text>Funcionará como {replacementText}</Text>
						<Text size="sm" style={{ fontFamily: 'monospace' }}>
							(nos dias {eventDates})
						</Text>
					</>
				)}

			</Section>

			<IconButton
				icon={<IconArrowRight size={20} />}
				onClick={handleEdit}
			/>

		</div>
	);

	//
}
