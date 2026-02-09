/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { buildRuleSummary } from '@/utils/rules/ruleSummary';
import { Badge } from '@mantine/core';
import { Indicator, Section, Text, Tooltip } from '@tmlmobilidade/ui';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface RuleLegendItem {
	color: string
	label: string
	long: string
	ruleId: string
	short: string
	slot: number
}

interface TimeCell {
	excludeRuleIds: Set<string>
	includeRuleIds: Set<string>
}

interface TableRow {
	cells: Map<string, TimeCell>
	minutes: number
	time: string
}

/* * */

export function RulesScheduleView() {
	const patternDetailContext = usePatternDetailContext();
	const rules = patternDetailContext.data.mergedRules || [];
	const periodsContext = usePeriodsContext();

	const [selectedRuleIds, setSelectedRuleIds] = useState<Set<string>>(new Set());
	const [hoveredRuleId, setHoveredRuleId] = useState<null | string>(null);

	const legendRef = useRef<HTMLDivElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	useLayoutEffect(() => {
		if (!legendRef.current || !containerRef.current) return;

		const el = legendRef.current;
		const host = containerRef.current;

		const set = () => {
			host.style.setProperty('--legend-h', `${el.offsetHeight}px`);
		};

		set();

		const ro = new ResizeObserver(set);
		ro.observe(el);

		return () => ro.disconnect();
	}, []);

	// Build legend items with alphabetic labels
	const legendItems = useMemo<RuleLegendItem[]>(() => {
		const periods = periodsContext.data.raw || [];
		const uniqueRules = new Map<string, RuleLegendItem>();

		for (const rule of rules) {
			if (!uniqueRules.has(rule._id)) {
				const { long, short } = buildRuleSummary(rule, { periods });
				uniqueRules.set(rule._id, {
					color: '',
					label: '',
					long,
					ruleId: rule._id,
					short,
					slot: 0,
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
	}, [rules, periodsContext.data.raw]);

	// Build table rows with matrix structure
	const tableRows = useMemo<TableRow[]>(() => {
		const byTime = new Map<string, TableRow>();

		for (const rule of rules) {
			for (const time of rule.timePoints || []) {
				const minutes = toMinutes(time);
				if (minutes === Number.POSITIVE_INFINITY) continue;

				const row = byTime.get(time) ?? {
					cells: new Map<string, TimeCell>(),
					minutes,
					time,
				};

				const cell = row.cells.get(rule._id) ?? {
					excludeRuleIds: new Set<string>(),
					includeRuleIds: new Set<string>(),
				};

				if (rule.operatingMode === 'exclude') {
					cell.excludeRuleIds.add(rule._id);
				}
				else {
					cell.includeRuleIds.add(rule._id);
				}

				row.cells.set(rule._id, cell);
				byTime.set(time, row);
			}
		}

		return [...byTime.values()].sort((a, b) => a.minutes - b.minutes);
	}, [rules]);

	// Filter visible columns based on selection
	const visibleLegendItems = useMemo(() => {
		if (selectedRuleIds.size === 0) return legendItems;
		return legendItems.filter(item => selectedRuleIds.has(item.ruleId));
	}, [legendItems, selectedRuleIds]);

	// Filter visible rows based on selection
	const visibleTableRows = useMemo(() => {
		if (selectedRuleIds.size === 0) return tableRows;
		return tableRows.filter((row) => {
			// Show row if any selected rule has a timepoint here
			return visibleLegendItems.some(item => row.cells.has(item.ruleId));
		});
	}, [tableRows, selectedRuleIds, visibleLegendItems]);

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
		<div className={styles.wrapper}>
			<div ref={containerRef} className={styles.container}>
				{/* Legend Section */}
				<div ref={legendRef} className={styles.legend}>
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
					<table className={styles.table}>
						<thead>
							<tr>
								<th className={styles.headerTime}>Hora</th>
								{visibleLegendItems.map(item => (
									<Tooltip key={item.ruleId} label={item.long}>
										<th
											className={styles.headerRule}
											style={{ ...pillStyle(item.slot), border: 'none' }}
										>
											{item.label}
										</th>
									</Tooltip>
								))}
							</tr>
						</thead>
						<tbody>
							{visibleTableRows.map(row => (
								<tr key={row.time}>
									<td className={styles.cellTime}>{row.time}</td>
									{visibleLegendItems.map((item) => {
										const cell = row.cells.get(item.ruleId);
										const hasInclude = cell?.includeRuleIds.has(item.ruleId);
										const hasExclude = cell?.excludeRuleIds.has(item.ruleId);
										const showIndicator = hasInclude || hasExclude;

										return (
											<td
												key={item.ruleId}
												className={styles.cellRule}
												data-active={isRuleActive(item.ruleId) ? 'true' : 'false'}
											>
												{showIndicator && (
													<Tooltip label={item.long}>
														<Indicator
															color={`var(--pill-${item.slot}-border)`}
															filled={hasInclude}
															size="lg"
														/>
													</Tooltip>
												)}
											</td>
										);
									})}
								</tr>
							))}
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
