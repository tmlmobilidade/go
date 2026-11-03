'use client';

/* * */

import { useEventsContext } from '@/contexts/Events.context';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { IconCalendarCancel, IconCalendarCheck } from '@tabler/icons-react';
import { type HHMM, type ScheduleRule } from '@tmlmobilidade/go-types-offer';
import { buildRuleSummary, DayRuleDetail } from '@tmlmobilidade/go-utils-offer';
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
	// B. Render components

	if (!rules.length) {
		return;
	}

	return (
		<Section gap="md" padding="none">
			{rules.map(({ allTimePoints, rule }) => {
				const summary = buildRuleSummary(rule, {
					events: eventsContext.data.raw,
					locale,
					periods: periodsContext.data.raw,
					t,
				});
				const isExclude = kind === 'exclude';
				const isReplacement = kind === 'replacement';
				const isEventRestriction = rule.kind === 'event_restriction';

				// For replacement rules, show summary and count of active schedules
				if (isReplacement && rule.kind === 'event_replacement') {
					// Get all timepoints from include rules that would apply
					const activeTimePoints = new Set<string>();
					if (includeRules) {
						for (const includeRule of includeRules) {
							for (const tp of includeRule.allTimePoints || []) {
								// Only add if not excluded
								if (!excludedTimePoints?.has(tp)) {
									activeTimePoints.add(tp);
								}
							}
						}
					}

					const timePointsCount = activeTimePoints.size;

					return (
						<div key={rule._id} className={styles.container}>
							<Section gap="sm" padding="none">
								<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
									<IconCalendarCheck color="var(--color-primary)" size={20} />
									<Text size="lg">{summary.short} ·</Text>
									<Text className={styles.timesCount}>
										{t('default:scheduling.copy.timepointCount', '', { count: timePointsCount })}
									</Text>
								</Section>
								<Text c="dimmed">
									{summary.tooltip}
								</Text>
							</Section>
						</div>
					);
				}

				// For event restrictions (exclude), show description instead of timepoints
				if (isEventRestriction) {
					const restrictionText = rule.all_day
						? t('default:scheduling.copy.excludedAllDay')
						: t('default:scheduling.copy.excludedWindow', '', { end: rule.end_time, start: rule.start_time });

					return (
						<div key={rule._id} className={styles.container}>
							<Section gap="sm" padding="none">
								<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
									<IconCalendarCancel color="var(--color-status-danger-primary)" size={20} />
									<Text size="lg">{summary.short}</Text>
								</Section>
								<Text c="dimmed">{restrictionText}</Text>
							</Section>
						</div>
					);
				}

				return (
					<div key={rule._id} className={styles.container}>
						<Section gap="md" justifyContent="space-between" padding="none">
							<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
								{isExclude && <IconCalendarCancel color="var(--color-status-danger-primary)" size={20} />}
								{isReplacement && <IconCalendarCheck color="var(--color-primary)" size={20} />}
								{!isExclude && !isReplacement && <IconCalendarCheck color="var(--color-status-success-primary)" size={20} />}
								<Text size="lg">{summary.short} ·</Text>
								<Text className={styles.timesCount}>
									{t('default:scheduling.copy.timepointCount', '', { count: allTimePoints?.length ?? 0 })}
								</Text>
							</Section>

							<DayPeriodsTimepoints timepoints={allTimePoints as HHMM[]} variant="compact">
								{(time) => {
									// For include rules, check if this time was excluded by another rule
									const excludedByRule = (kind === 'include' || kind === 'replacement') && excludedTimePoints?.get(time);
									const isRemoved = isExclude || !!excludedByRule;
									const tooltip = excludedByRule
										? t('default:scheduling.copy.excludedBy', '', { name: excludedByRule.name || (excludedByRule.kind === 'event_restriction' ? excludedByRule.event.title : t('default:scheduling.copy.unnamedRule')) })
										: undefined;

									return (
										<TimeChip
											key={time}
											time={time}
											tooltip={tooltip}
											variant={isRemoved ? 'removed' : 'default'}
										/>
									);
								}}
							</DayPeriodsTimepoints>
						</Section>
					</div>
				);
			})}
		</Section>
	);
}
