/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { Badge } from '@mantine/core';
import { IconCancel, IconCheck, IconSwitchHorizontal } from '@tabler/icons-react';
import { buildRuleSummary, computeRuleTimePoints } from '@tmlmobilidade/dates';
import { Section, Text, Tooltip } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface RuleLegendItem {
	color: string
	isExclude?: boolean
	isReplacement?: boolean
	label: string
	long: string
	ruleId: string
	short: string
	slot: number
	tooltip?: string
}

/* * */

export function RulesScheduleView() {
	const patternDetailContext = usePatternDetailContext();
	const rules = patternDetailContext.data.mergedRules || [];
	const periodsContext = usePeriodsContext();

	const [selectedRuleIds, setSelectedRuleIds] = useState<Set<string>>(new Set());
	const [hoveredRuleId, setHoveredRuleId] = useState<null | string>(null);

	const allRules = patternDetailContext.data.mergedRules || [];
	const periods = periodsContext.data.raw || [];

	const timePointsByRuleId = useMemo(() => {
		const map = new Map<string, Set<string>>();

		for (const rule of allRules) {
			if (!rule._id) continue;
			const timePoints = computeRuleTimePoints(rule, allRules, periods);
			map.set(rule._id, timePoints);
		}
		return map;
	}, [allRules, periods]);

	// Build legend items with alphabetic labels
	const legendItems = useMemo<RuleLegendItem[]>(() => {
		const uniqueRules = new Map<string, RuleLegendItem>();

		for (const rule of rules) {
			if (!uniqueRules.has(rule._id)) {
				const { long, short, tooltip } = buildRuleSummary(rule, { periods });
				const isReplacement = rule.kind === 'event_replacement';
				const isExclude = (rule.kind === 'manual' && rule.operatingMode === 'exclude') || rule.kind === 'event_restriction';
				uniqueRules.set(rule._id, {
					color: '',
					isExclude,
					isReplacement,
					label: '',
					long,
					ruleId: rule._id,
					short,
					slot: 0,
					tooltip,
				});
			}
		}

		const sorted = Array.from(uniqueRules.values()).sort((a, b) => a.short.localeCompare(b.short));
		const pillCount = getPillCount(8);

		return sorted.map((item, idx) => ({
			...item,
			label: String.fromCharCode(65 + idx), // A, B, C, ...
			slot: (idx % pillCount) + 1,
		}));
	}, [rules, periods]);

	const timeColumns = useMemo(() => {
		const allTimes = new Set<string>();

		for (const timePoints of timePointsByRuleId.values()) {
			for (const tp of timePoints) allTimes.add(tp);
		}

		return Array.from(allTimes).sort((a, b) => toMinutes(a) - toMinutes(b));
	}, [timePointsByRuleId]);

	// Filter visible columns based on selection
	const visibleLegendItems = useMemo(() => {
		if (selectedRuleIds.size === 0) return legendItems;
		return legendItems.filter(item => selectedRuleIds.has(item.ruleId));
	}, [legendItems, selectedRuleIds]);

	if (!legendItems.length) {
		return (
			<Section padding="none">
				<Text className={styles.empty}>Sem horários para mostrar.</Text>
			</Section>
		);
	}

	const pillStyle = (slot: number) => ({
		backgroundColor: `var(--pill-${slot}-bg)`,
		border: `1px solid var(--pill-${slot}-border)`,
		color: `var(--pill-${slot}-text)`,
	} as React.CSSProperties);

	const handlePillClick = (ruleId: string) => {
		setSelectedRuleIds((prev) => {
			const next = new Set(prev);
			if (next.has(ruleId)) {
				next.delete(ruleId);
			}
			else {
				next.add(ruleId);
			}
			return next;
		});
	};

	const isRuleActive = (ruleId: string) => {
		if (hoveredRuleId) return hoveredRuleId === ruleId;
		return true;
	};

	return (
		<div className={styles.container}>
			{/* Legend Section */}
			<div className={styles.legend}>
				{legendItems.map(item => (
					<Tooltip key={item.ruleId} label={item.long} withArrow>
						<Badge
							className={styles.legendPill}
							data-selected={selectedRuleIds.size === 0 || selectedRuleIds.has(item.ruleId) ? 'true' : 'false'}
							onClick={() => handlePillClick(item.ruleId)}
							onMouseEnter={() => setHoveredRuleId(item.ruleId)}
							onMouseLeave={() => setHoveredRuleId(null)}
							style={pillStyle(item.slot)}
						>
							{item.label} {item.short}
						</Badge>
					</Tooltip>
				))}
			</div>

			{/* Table */}
			<div className={styles.tableWrapper}>
				<div className={styles.tableScrollX}>
					<table className={styles.table}>
						<thead>
							<tr>
								{/* sticky left header cell */}
								<th className={styles.headerRuleSticky}>Regra</th>

								{timeColumns.map(time => (
									<th key={time} className={styles.headerTimeCol}>
										{time}
									</th>
								))}
							</tr>
						</thead>

						<tbody>
							{visibleLegendItems.map((item) => {
								const timePoints = timePointsByRuleId.get(item.ruleId) ?? new Set<string>();

								return (
									<tr key={item.ruleId}>
										{/* sticky left rule cell */}
										<td className={styles.cellRuleSticky}>
											<Tooltip key={item.ruleId} label={item.long}>
												<div
													className={styles.headerRule}
													style={{ ...pillStyle(item.slot), border: 'none' }}
												>
													{item.label}
												</div>
											</Tooltip>
										</td>

										{timeColumns.map((time) => {
											const hasTimePoint = timePoints.has(time);

											return (
												<td
													key={time}
													className={styles.cellTimeCol}
													data-active={isRuleActive(item.ruleId) ? 'true' : 'false'}
												>
													{hasTimePoint && (
														<div className={styles.iconCenter}>
															<Tooltip label={`${item.tooltip || item.long}`} withArrow>
																{item.isExclude && <IconCancel color={`var(--pill-${item.slot}-text)`} size={20} />}
																{item.isReplacement && <IconSwitchHorizontal color={`var(--pill-${item.slot}-text)`} size={20} />}
																{!item.isExclude && !item.isReplacement && <IconCheck color={`var(--pill-${item.slot}-text)`} size={20} />}
															</Tooltip>
														</div>
													)}
												</td>
											);
										})}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

		</div>
	);
}

/* * */

function toMinutes(hhmm: string): number {
	const [h, m] = hhmm.split(':').map(Number);
	if (Number.isNaN(h) || Number.isNaN(m)) return Number.POSITIVE_INFINITY;
	return h * 60 + m;
}

function getPillCount(fallback = 8) {
	if (typeof window === 'undefined') return fallback;

	const raw = getComputedStyle(document.documentElement).getPropertyValue('--pill-count');
	const n = Number(raw);
	return Number.isFinite(n) && n > 0 ? n : fallback;
}
