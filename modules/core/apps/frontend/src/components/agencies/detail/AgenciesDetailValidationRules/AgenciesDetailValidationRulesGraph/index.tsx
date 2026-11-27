'use client';

import { type GtfsValidatorRuleId } from '@tmlmobilidade/go-types-gtfs-validator';
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
	const { actions, data: { configuredEntries, entriesById, selectedEntry } } = useAgenciesDetailValidationRulesContext();
	const id = useId();
	const selectedId = selectedEntry?.ruleId;

	//
	// C. Transform data

	const graph = useMemo(() => selectedEntry && layoutAgenciesDetailValidationRulesGraph(selectedEntry, configuredEntries), [configuredEntries, selectedEntry]);
	const caption = !graph
		? t('agencies:detail.AgenciesDetailValidationRulesGraph.select_rule')
		: graph.edges.length > 0
			? t('agencies:detail.AgenciesDetailValidationRulesGraph.direction')
			: t('agencies:detail.AgenciesDetailValidationRulesGraph.no_connections');

	//
	// F. Render components

	const renderRule = (ruleId: GtfsValidatorRuleId) => (
		<button
			key={ruleId}
			aria-pressed={selectedId === ruleId}
			className={styles.rule}
			onClick={() => actions.selectRule(ruleId)}
			type="button"
		>
			<span>{ruleId}</span>
			<span className={styles.severity} data-severity={entriesById.get(ruleId)?.severity ?? 'unconfigured'} />
		</button>
	);

	return (
		<Section gap="md" padding="none" width="100%">
			<Section padding="none">
				<Label>{t('agencies:detail.AgenciesDetailValidationRulesGraph.title')}</Label>
				<Label size="sm">{caption}</Label>
			</Section>
			<Section className={styles.viewport} padding="none">
				{graph ? (
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
						{graph.nodes.map(node => (
							<foreignObject key={node.ruleId} height={graph.nodeHeight} width={graph.nodeWidth} x={node.x} y={node.y}>
								{renderRule(node.ruleId)}
							</foreignObject>
						))}
					</svg>
				) : (
					<div className={styles.overview}>
						{Array.from(entriesById.keys(), renderRule)}
					</div>
				)}
			</Section>
		</Section>
	);
}
