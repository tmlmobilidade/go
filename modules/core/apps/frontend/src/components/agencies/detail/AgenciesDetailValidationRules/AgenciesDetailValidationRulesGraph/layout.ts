import { type GtfsValidatorRuleId } from '@tmlmobilidade/go-types-gtfs-validator';

import { type AgenciesDetailValidationRuleEntry } from '../types';

/* * */

interface RuleNode {
	children: RuleNode[]
	depth: number
	remaining: number
	ruleId: GtfsValidatorRuleId
	x: number
	y: number
}

const NODE_HEIGHT = 36;
const ROW_HEIGHT = 52;
const COLUMN_GAP = 60;
const PADDING = 24;

/* * */

export function layoutAgenciesDetailValidationRulesGraph(selectedEntry: AgenciesDetailValidationRuleEntry, configuredEntries: AgenciesDetailValidationRuleEntry[]) {
	const nodesById = new Map<GtfsValidatorRuleId, RuleNode>();
	const getNode = (ruleId: GtfsValidatorRuleId) => {
		const existing = nodesById.get(ruleId);
		if (existing) return existing;
		const node: RuleNode = { children: [], depth: 0, remaining: 0, ruleId, x: 0, y: 0 };
		nodesById.set(ruleId, node);
		return node;
	};

	const prerequisitesById = new Map(configuredEntries.map(entry => [entry.ruleId, entry.dependsOn]));
	prerequisitesById.set(selectedEntry.ruleId, selectedEntry.dependsOn);
	const selected = getNode(selectedEntry.ruleId);

	// The map iterator visits each newly discovered prerequisite once, even if there is a cycle.
	for (const dependent of nodesById.values()) {
		for (const ruleId of prerequisitesById.get(dependent.ruleId) ?? []) {
			getNode(ruleId).children.push(dependent);
			dependent.remaining++;
		}
	}
	for (const entry of configuredEntries) {
		if (nodesById.has(entry.ruleId) || !entry.dependsOn.includes(selected.ruleId)) continue;
		const dependent = getNode(entry.ruleId);
		selected.children.push(dependent);
		dependent.remaining++;
	}

	const nodes = [...nodesById.values()];
	const queue = nodes.filter(node => node.remaining === 0);
	const ranks: RuleNode[][] = [];

	// Match the validator visualizer's left-to-right layout by topological depth.
	for (const node of queue) {
		(ranks[node.depth] ??= []).push(node);
		for (const child of node.children) {
			child.depth = Math.max(child.depth, node.depth + 1);
			child.remaining--;
			if (child.remaining === 0) queue.push(child);
		}
	}

	// While editing, keep rules blocked by a cycle visible in a final column.
	const blocked = nodes.filter(node => node.remaining > 0);
	if (blocked.length) ranks.push(blocked);

	const nodeWidth = Math.max(180, ...nodes.map(node => node.ruleId.length * 8 + 20));
	const rows = Math.max(...ranks.map(rank => rank.length));

	for (const [column, rank] of ranks.entries()) {
		for (const [row, node] of rank.entries()) {
			node.x = PADDING + column * (nodeWidth + COLUMN_GAP);
			node.y = PADDING + (row + Math.floor((rows - rank.length) / 2)) * ROW_HEIGHT;
		}
	}

	const edges = nodes.flatMap(source => source.children.map((target) => {
		const fromX = source.x + nodeWidth;
		const fromY = source.y + NODE_HEIGHT / 2;
		const toX = target.x - 4;
		const toY = target.y + NODE_HEIGHT / 2;
		const middleX = (fromX + toX) / 2;
		// Route long or cyclic edges through the gaps between rows.
		const path = target.x - source.x === nodeWidth + COLUMN_GAP
			? `M ${fromX} ${fromY} C ${middleX} ${fromY} ${middleX} ${toY} ${toX} ${toY}`
			: `M ${fromX} ${fromY} H ${fromX + 16} V ${toY - ROW_HEIGHT / 2} H ${toX - 16} V ${toY} H ${toX}`;
		return { from: source.ruleId, path, to: target.ruleId };
	}));

	return {
		edges,
		hasCycle: blocked.length > 0,
		height: PADDING * 2 + rows * ROW_HEIGHT,
		nodeHeight: NODE_HEIGHT,
		nodes: ranks.flat(),
		nodeWidth,
		width: PADDING * 2 + ranks.length * (nodeWidth + COLUMN_GAP) - COLUMN_GAP,
	};
}
