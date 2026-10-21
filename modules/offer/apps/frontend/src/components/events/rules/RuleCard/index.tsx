'use client';

import { usePeriodsData } from '@/components/year-periods/shared/use-periods-data';
import { IconArrowRight, IconCalendarCancel, IconCalendarRepeat } from '@tabler/icons-react';
import { Dates, FORMATS } from '@tmlmobilidade/dates';
import { EventRule, type Line } from '@tmlmobilidade/go-types-offer';
import { IconButton, Section, Text } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RuleCardProps {
	disabled: boolean
	lines: Line[]
	onEdit: (rule: EventRule) => void
	rule: EventRule
}

/* * */

export function RuleCard({ disabled, lines, onEdit, rule }: RuleCardProps) {
	//

	//
	// A. Setup variables

	const { data: periods } = usePeriodsData();
	const { i18n, t } = useTranslation();

	const isRestriction = rule.kind === 'event_restriction';
	const isReplacement = rule.kind === 'event_replacement';

	const eventDates = rule.dates?.map(d =>
		Dates.fromOperationalDate(d, 'Europe/Lisbon')
			.toLocaleString(FORMATS.DATE_SHORT, i18n.language),
	).join(', ') ?? '';

	const eventDatesSuffix = t('default:events.ruleCard.onDates', { dates: eventDates });

	// Lines information
	const linesMode = rule.lines_mode || 'all';
	const affectedLinesCount = useMemo(() => linesMode === 'all'
		? lines?.length ?? 0
		: linesMode === 'include'
			? rule.lines_to_include?.length ?? 0
			: linesMode === 'exclude'
				? (lines?.length ?? 0) - (rule.lines_to_exclude?.length ?? 0)
				: 0,
	[linesMode, lines, rule.lines_to_include, rule.lines_to_exclude]);

	const linesText = affectedLinesCount > 0
		? t('default:events.ruleCard.lines', { count: affectedLinesCount })
		: t('default:events.ruleCard.noLines');

	// Build detailed lines description
	let linesDescription;
	if (linesMode === 'all') {
		linesDescription = t('default:events.ruleCard.allLines');
	} else if (linesMode === 'include' && rule.lines_to_include?.length) {
		const lineNames = rule.lines_to_include
			.map(lineId => lines?.find(l => l._id === lineId)?.code)
			.filter(Boolean)
			.join(', ');
		linesDescription = t('default:events.ruleCard.namedLines', { lines: lineNames });
	} else if (linesMode === 'exclude' && rule.lines_to_exclude?.length) {
		const lineNames = rule.lines_to_exclude
			.map(lineId => lines?.find(l => l._id === lineId)?.code)
			.filter(Boolean)
			.join(', ');
		linesDescription = t('default:events.ruleCard.exceptLines', { lines: lineNames });
	} else {
		linesDescription = t('default:events.ruleCard.noLines');
	}

	// For replacement rules, build the "funcionará como" text
	let replacementText = '';
	if (isReplacement && rule.kind === 'event_replacement') {
		const weekdayLabels = rule.weekdays?.map(wd =>
			new Date(2026, 0, 4 + wd).toLocaleDateString(i18n.language, { weekday: 'long' }),
		).filter(Boolean).join(', ') ?? '';

		const periodNames = rule.year_period_ids?.map(pid =>
			periods.find(p => p._id === pid)?.name,
		).filter(Boolean).join(', ') ?? '';

		const parts = [weekdayLabels, periodNames].filter(Boolean);
		replacementText = parts.length > 0 ? `${parts.join(' · ')}` : '';
	}

	//
	// B. Handle actions

	const handleEdit = () => {
		if (!disabled) onEdit(rule);
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
								<Text size="lg">{t('default:events.ruleEditor.restriction')}</Text>
							</>
						)}
						{isReplacement && (
							<>
								<IconCalendarRepeat color="var(--color-primary)" size={20} />
								<Text size="lg">{t('default:events.ruleEditor.replacement')}</Text>
							</>
						)}
						<Text c="dimmed" className={styles.timesCount}>
							· {linesText} · {rule.dates?.length ?? 0} {t('default:events.ruleCard.days', { count: rule.dates?.length ?? 0 })}
						</Text>
					</Section>

					<Text c="dimmed" size="sm">{linesDescription}</Text>
				</Section>

				{isRestriction && (
					<Text className={styles.operationalTime} size="sm">
						{!rule.all_day
							? t('default:events.ruleCard.timeWindow', { dates: eventDatesSuffix, end: rule.end_time, start: rule.start_time })
							: t('default:events.ruleCard.allDay', { dates: eventDatesSuffix })}
					</Text>
				)}

				{isReplacement && (
					<>
						<Text>{t('default:events.ruleCard.operateAs', { replacement: replacementText })}</Text>
						<Text className={styles.operationalTime} size="sm">
							{t('default:events.ruleCard.onDates', { dates: eventDates })}
						</Text>
					</>
				)}

			</Section>

			<IconButton
				icon={<IconArrowRight size={20} />}
				isDisabled={disabled}
				onClick={handleEdit}
			/>

		</div>
	);

	//
}
