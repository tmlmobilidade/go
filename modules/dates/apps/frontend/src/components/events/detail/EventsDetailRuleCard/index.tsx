'use client';

import { useYearPeriodsRawData } from '@/components/year-periods/shared/use-year-periods-raw-data';
import { IconArrowRight, IconCalendarCancel, IconCalendarRepeat } from '@tabler/icons-react';
import { Dates, FORMATS } from '@tmlmobilidade/dates';
import { type EventRule, WEEKDAY_OPTIONS } from '@tmlmobilidade/go-types-offer';
import { IconButton, Section, Text } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from './styles.module.css';

import { useEventsDetailRules } from '../use-events-detail-rules';

/* * */

interface EventsDetailRuleCardProps {
	rule: EventRule
}

/* * */

export function EventsDetailRuleCard({ rule }: EventsDetailRuleCardProps) {
	//

	//
	// A. Setup variables

	const { lines, openRuleModal } = useEventsDetailRules();

	const { data: yearPeriodsData } = useYearPeriodsRawData();

	const isRestriction = rule.kind === 'event_restriction';
	const isReplacement = rule.kind === 'event_replacement';

	//
	// B. Transform data

	const eventDates = rule.dates?.map(d => Dates.fromOperationalDate(d, 'Europe/Lisbon').toLocaleString(FORMATS.DATE_SHORT, 'pt-PT')).join(', ') ?? '';

	const eventDatesSuffix = rule.dates?.length > 1 ? `(nos dias ${eventDates})` : `(no dia ${eventDates})`;

	const linesMode = rule.lines_mode || 'all';

	const affectedLinesCount = useMemo(() => {
		if (linesMode === 'all') return lines.length;
		if (linesMode === 'include') return rule.lines_to_include?.length ?? 0;
		if (linesMode === 'exclude') return lines.length - (rule.lines_to_exclude?.length ?? 0);
		return 0;
	}, [linesMode, lines, rule.lines_to_include, rule.lines_to_exclude]);

	const linesText = affectedLinesCount > 0 ? `${affectedLinesCount} ${affectedLinesCount > 1 ? 'linhas' : 'linha'}` : 'Nenhuma linha';

	const linesDescription = useMemo(() => {
		const getLineCodes = (lineIds: string[]) => lineIds.map(lineId => lines.find(line => line._id === lineId)?.code).filter(Boolean).join(', ');
		if (linesMode === 'all') return 'Todas as linhas';
		if (linesMode === 'include' && rule.lines_to_include?.length) return `Linhas ${getLineCodes(rule.lines_to_include)}`;
		if (linesMode === 'exclude' && rule.lines_to_exclude?.length) return `Todas exceto ${getLineCodes(rule.lines_to_exclude)}`;
		return 'Nenhuma linha';
	}, [linesMode, lines, rule.lines_to_include, rule.lines_to_exclude]);

	const replacementText = useMemo(() => {
		if (rule.kind !== 'event_replacement') return '';
		const weekdayLabels = rule.weekdays?.map(wd => WEEKDAY_OPTIONS.find(opt => opt.value === wd)?.label).filter(Boolean).join(', ') ?? '';
		const periodNames = rule.year_period_ids?.map(pid => yearPeriodsData.find(p => p._id === pid)?.name).filter(Boolean).join(', ') ?? '';
		return [weekdayLabels, periodNames].filter(Boolean).join(' · ');
	}, [rule, yearPeriodsData]);

	//
	// C. Handle actions

	const handleEdit = () => {
		openRuleModal(rule);
	};

	//
	// D. Render components

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
					<Text className={styles.monospace} size="sm">
						{!rule.all_day ? `${rule.start_time} às ${rule.end_time} ${eventDatesSuffix}` : `Todo o dia ${eventDatesSuffix}`}
					</Text>
				)}

				{isReplacement && (
					<>
						<Text>Funcionará como {replacementText}</Text>
						<Text className={styles.monospace} size="sm">(nos dias {eventDates})</Text>
					</>
				)}

			</Section>

			<IconButton icon={<IconArrowRight size={20} />} onClick={handleEdit} />
		</div>
	);
}
