'use client';

/* * */

import { RuleTimepointCount } from '@/components/patterns/rules/shared/RuleTimepointCount';
import { RuleEventEffect } from '@/components/shared/rules/RuleEventEffect';
import { RuleLabelTag } from '@/components/shared/rules/RuleLabelTag';
import { useEventsContext } from '@/contexts/Events.context';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { IconCalendarCancel, IconCalendarCheck } from '@tabler/icons-react';
import { type HHMM, type ScheduleRule } from '@tmlmobilidade/go-types-offer';
import { buildRuleSummary, type DayRuleDetail, getTimepointsRemovedByEventRestriction } from '@tmlmobilidade/go-utils-offer';
import { DayPeriodsTimepoints, Section, Text, TimeChip, useLocaleContext } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

type RuleKind = 'exclude' | 'include' | 'replacement';

interface RulesGroupProps {
	excludedTimePoints?: Map<string, ScheduleRule>
	includeRules?: DayRuleDetail[]
	kind: RuleKind
	rules: DayRuleDetail[]
}

/* * */

export function RulesGroup({ excludedTimePoints, includeRules, kind, rules }: RulesGroupProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data: { locale } } = useLocaleContext();
	const periodsContext = usePeriodsContext();
	const eventsContext = useEventsContext();

	//
	// B. Transform data

	const candidateTimes = [...new Set((includeRules ?? []).flatMap(detail => detail.allTimePoints))];

	//
	// C. Render components

	if (!rules.length) return;

	return (
		<Section gap="md" padding="none">
			{rules.map(({ allTimePoints, rule }) => {
				const summary = buildRuleSummary(rule, { events: eventsContext.data.raw, locale, periods: periodsContext.data.raw, t });
				const isExclude = kind === 'exclude';
				const removedTimes = rule.kind === 'event_restriction'
					? getTimepointsRemovedByEventRestriction(rule, candidateTimes as HHMM[])
					: allTimePoints.filter(time => candidateTimes.includes(time));

				// Event rules describe the selected day's effect, without repeating event dates.
				if (rule.kind === 'event_replacement' || rule.kind === 'event_restriction') {
					const isRestriction = rule.kind === 'event_restriction';

					return (
						<div key={rule._id} className={styles.container}>
							<div className={styles.header}>
								{isRestriction
									? <IconCalendarCancel color="var(--color-status-danger-primary)" size={20} />
									: <IconCalendarCheck color="var(--color-primary)" size={20} />}
								<Text weight="semibold">{rule.event.title}</Text>
							</div>
							<div className={styles.content}>
								<RuleEventEffect conditions={summary.conditions} rule={rule} />
								{isRestriction && removedTimes.length === 0 && (
									<Text c="dimmed" size="sm">{t('default:patterns.list.RulesCalendarPreviewRulesGroup.no_schedules_removed')}</Text>
								)}
							</div>
						</div>
					);
				}

				const event = rule.event_id ? eventsContext.data.raw.find(event => event._id === rule.event_id) : undefined;

				return (
					<div key={rule._id} className={styles.container}>
						<div className={styles.header}>
							{isExclude
								? <IconCalendarCancel color="var(--color-status-danger-primary)" size={20} />
								: <IconCalendarCheck color="var(--color-status-success-primary)" size={20} />}
							{event && <Text weight="semibold">{event.title}</Text>}
							<RuleLabelTag label={event ? summary.conditions : summary.label} tooltip={false} />
							<RuleTimepointCount count={allTimePoints.length} />
						</div>
						<div className={styles.content}>
							{isExclude && removedTimes.length === 0 && (
								<Text c="dimmed" size="sm">{t('default:patterns.list.RulesCalendarPreviewRulesGroup.no_schedules_removed')}</Text>
							)}
							<DayPeriodsTimepoints timepoints={allTimePoints as HHMM[]} variant="compact">
								{(time) => {
									// Include rules retain excluded times with the responsible rule indicated.
									const excludedByRule = !isExclude && excludedTimePoints?.get(time);
									const tooltip = excludedByRule
										? t('default:scheduling.copy.excludedBy', '', { name: excludedByRule.name || (excludedByRule.kind === 'event_restriction' ? excludedByRule.event.title : t('default:scheduling.copy.unnamedRule')) })
										: undefined;

									return (
										<TimeChip key={time} time={time} tooltip={tooltip} variant={isExclude || excludedByRule ? 'removed' : 'default'} />
									);
								}}
							</DayPeriodsTimepoints>
						</div>
					</div>
				);
			})}
		</Section>
	);
}
