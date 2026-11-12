'use client';

import { RuleEventEffect } from '@/components/shared/rules/RuleEventEffect';
import { usePeriodsData } from '@/components/year-periods/shared/use-periods-data';
import { IconCalendar, IconCalendarCancel, IconCalendarRepeat, IconPencil, IconRoute } from '@tabler/icons-react';
import { type EventRule, type Line } from '@tmlmobilidade/go-types-offer';
import { buildRuleSummary, formatRuleDates } from '@tmlmobilidade/go-utils-offer';
import { IconButton, Text, useLocaleContext } from '@tmlmobilidade/ui';
import { type MouseEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RuleCardProps {
	agencyIds: string[]
	disabled: boolean
	lines: Line[]
	onEdit: (rule: EventRule) => void
	rule: EventRule
}

/* * */

export function RuleCard({ agencyIds, disabled, lines, onEdit, rule }: RuleCardProps) {
	//

	//
	// A. Setup variables

	const { data: periods } = usePeriodsData();
	const { data: { locale } } = useLocaleContext();
	const { t } = useTranslation();
	const isRestriction = rule.kind === 'event_restriction';

	//
	// B. Transform data

	const eventPeriods = useMemo(() => periods.filter(period => period.agency_ids.some(id => agencyIds.includes(id))), [agencyIds, periods]);
	const summary = buildRuleSummary(rule, { locale, periods: eventPeriods, t });
	const lineIds = rule.lines_mode === 'include' ? rule.lines_to_include ?? [] : rule.lines_to_exclude ?? [];
	const lineNames = lineIds.map(id => lines.find(line => line._id === id)?.code ?? id).join(', ');
	const linesDescription = rule.lines_mode === 'all' || (rule.lines_mode === 'exclude' && !lineIds.length)
		? t('default:events.ruleCard.allLines')
		: lineNames
			? t(rule.lines_mode === 'include' ? 'default:events.ruleCard.namedLines' : 'default:events.ruleCard.exceptLines', { lines: lineNames })
			: t('default:events.ruleCard.noLines');

	//
	// C. Handle actions

	const handleEdit = () => {
		if (!disabled) onEdit(rule);
	};

	const handleEditButton = (event: MouseEvent<HTMLDivElement>) => {
		event.stopPropagation();
	};

	//
	// D. Render components

	return (
		<div className={styles.container} data-read-only={disabled || undefined} onClick={disabled ? undefined : handleEdit}>
			<div className={styles.header}>
				<div className={styles.title}>
					{isRestriction
						? <IconCalendarCancel color="var(--color-status-danger-primary)" size={20} />
						: <IconCalendarRepeat color="var(--color-primary)" size={20} />}
					<Text weight="semibold">{t(isRestriction ? 'default:events.ruleEditor.restriction' : 'default:events.ruleEditor.replacement')}</Text>
				</div>
				<div onClick={handleEditButton}>
					<IconButton icon={<IconPencil size={20} />} isDisabled={disabled} onClick={handleEdit} tooltip={t('default:events.ruleEditor.edit')} />
				</div>
			</div>

			<div className={styles.content}>
				<RuleEventEffect conditions={summary.conditions} rule={rule} />
				<div className={styles.detailRow}>
					<IconRoute size={16} />
					<Text size="sm">{linesDescription}</Text>
				</div>
				<div className={styles.detailRow}>
					<IconCalendar size={16} />
					<Text size="sm">{formatRuleDates(rule.dates, locale)}</Text>
				</div>
			</div>
		</div>
	);

	//
}
