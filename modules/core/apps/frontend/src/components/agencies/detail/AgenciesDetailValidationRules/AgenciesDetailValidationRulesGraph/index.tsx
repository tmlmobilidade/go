'use client';

import { Label, Section } from '@tmlmobilidade/ui';
import { useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useAgenciesDetailValidationRulesContext } from '../AgenciesDetailValidationRules.context';
import { layoutAgenciesDetailValidationRulesGraph } from './layout';

/* * */

export function AgenciesDetailValidationRulesGraph() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, data: { configuredEntries, selectedEntry }, filters } = useAgenciesDetailValidationRulesContext();
	const id = useId();
	const selectedId = selectedEntry?.ruleId;

	//
	// C. Transform data

	const graph = useMemo(() => selectedEntry && layoutAgenciesDetailValidationRulesGraph(selectedEntry, configuredEntries), [configuredEntries, selectedEntry]);
	const severityById = useMemo(() => {
		if (!selectedEntry) return new Map();
		const map = new Map(configuredEntries.map(entry => [entry.ruleId, entry.severity] as const));
		map.set(selectedEntry.ruleId, selectedEntry.severity);
		return map;
	}, [configuredEntries, selectedEntry]);

	//
	// F. Render components

	if (!graph) return null;

	return (
		<Section gap="md" padding="none" width="100%">
			<Section padding="none">
				<Label>{t('agencies:detail.AgenciesDetailValidationRulesGraph.title')}</Label>
				<Label size="sm">{graph.edges.length > 0 ? t('agencies:detail.AgenciesDetailValidationRulesGraph.direction') : t('agencies:detail.AgenciesDetailValidationRulesGraph.no_connections')}</Label>
			</Section>
			<Section className={styles.viewport} padding="none">
				<svg className={styles.chart} height={graph.height} width={graph.width}>
					<defs>
						<marker id={`${id}-arrow`} markerHeight={8} markerUnits="userSpaceOnUse" markerWidth={8} orient="auto" refX={8} refY={4}>
							<path className={styles.arrow} d="M 0 0 L 8 4 L 0 8 Z" />
						</marker>
					</defs>
					<g aria-hidden="true">
						{graph.edges.map(edge => (
							<path key={`${edge.from}:${edge.to}`} className={styles.edge} d={edge.path} markerEnd={`url(#${id}-arrow)`} />
						))}
					</g>
					{graph.nodes.map((node) => {
						const severity = severityById.get(node.ruleId) ?? 'unconfigured';
						return (
							<foreignObject key={node.ruleId} height={graph.nodeHeight} width={graph.nodeWidth} x={node.x} y={node.y}>
								<button
									aria-pressed={selectedId === node.ruleId}
									className={styles.rule}
									onClick={() => actions.selectRule(node.ruleId)}
									type="button"
								>
									{node.ruleId}
									&nbsp;
									<span className={styles.severity} data-severity={severity} />
								</button>
							</foreignObject>
						);
					})}
				</svg>
			</Section>
		</Section>
	);
}
