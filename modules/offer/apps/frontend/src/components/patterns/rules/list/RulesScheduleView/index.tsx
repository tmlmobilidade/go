/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { buildRuleSummary } from '@/utils/rules/ruleSummary';
import { Badge } from '@mantine/core';
import { IconCancel, IconForbid } from '@tabler/icons-react';
import { Section, Text, Tooltip } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

interface RulePill {
	key: string
	long: string
	ruleId: string
	short: string
}

interface TimeRow {
	excludes: RulePill[]
	includes: RulePill[]
	minutes: number
	time: string
}

/* * */

export function RulesScheduleView() {
	const patternDetailContext = usePatternDetailContext();
	const rules = patternDetailContext.data.form.values.rules || [];
	const periodsContext = usePeriodsContext();

	const rows = useMemo<TimeRow[]>(() => {
		const byTime = new Map<string, TimeRow>();
		const periods = periodsContext.data.periods || [];

		for (const rule of rules) {
			const { long, short } = buildRuleSummary(rule, {
				eventNames: {},
				holidayNames: {},
				periods,
			});

			for (const time of rule.timePoints || []) {
				const minutes = toMinutes(time);
				if (minutes === Number.POSITIVE_INFINITY) continue;

				const row = byTime.get(time) ?? {
					excludes: [],
					includes: [],
					minutes,
					time,
				};

				const pill: RulePill = {
					key: `${rule._id}:${time}`,
					long,
					ruleId: rule._id,
					short,
				};

				(rule.operatingMode === 'exclude' ? row.excludes : row.includes).push(pill);
				byTime.set(time, row);
			}
		}

		return [...byTime.values()].sort((a, b) => a.minutes - b.minutes);
	}, [rules, periodsContext.data.periods]);

	const colorMap = useMemo(() => {
		const count = getPillCount(8);
		return buildRuleColorMap(rules.map(r => r._id), count);
	}, [rules]);

	if (!rows.length) {
		return (
			<Section padding="none">
				<Text className={styles.empty}>Sem horários para mostrar.</Text>
			</Section>
		);
	}

	const pillStyle = (ruleId: string) => {
		const slot = colorMap.get(ruleId) ?? 1;

		return {
			backgroundColor: `var(--pill-${slot}-bg)`,
			border: `1px solid var(--pill-${slot}-border)`,
			color: `var(--pill-${slot}-text)`,
		} as React.CSSProperties;
	};

	const renderPills = (pills: RulePill[]) => (
		<div className={styles.pills}>
			{pills.map(p => (
				<Tooltip key={p.key} label={p.long} withArrow>
					<Badge className={styles.pill} style={pillStyle(p.ruleId)}>
						{p.short}
					</Badge>
				</Tooltip>
			))}
		</div>
	);

	return (
		<div className={styles.container}>
			{rows.map((row, idx) => (
				<div
					key={row.time}
					className={styles.row}
					data-first={idx === 0 ? 'true' : 'false'}
				>
					<div className={styles.time}>{row.time}</div>

					<div className={styles.content}>
						{/* Inclui é implícito: só pills */}
						{row.includes.length > 0 && renderPills(row.includes)}

						{/* Exceto só quando existe */}
						{row.excludes.length > 0 && (
							<div className={styles.exceptLine}>
								<div style={{ display: 'flex', gap: '5px' }}>
									<IconCancel size={14} />
									<Text className={styles.exceptLabel}>Excepto</Text>
								</div>
								{renderPills(row.excludes)}
							</div>
						)}
					</div>
				</div>
			))}
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

function buildRuleColorMap(ruleIds: string[], count: number) {
	const unique = Array.from(new Set(ruleIds)).sort();
	const map = new Map<string, number>();

	unique.forEach((id, idx) => {
		map.set(id, (idx % count) + 1);
	});

	return map;
}
