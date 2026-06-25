/* * */

import { type HubLine } from '@tmlmobilidade/types';

import { calculateFeedbackSatisfactionIndex } from '../../feedback-metrics';
import { getAgencyId, getEntityId, getFeedbackCount, LINE_FIELD_CANDIDATES } from './feedback-preview-records';

/* * */

interface LineApprovalAccumulator {
	agencyId?: string
	happyCount: number
	unhappyCount: number
}

interface OperatorApprovalTotal {
	lineCount: number
	satisfactionTotal: number
}

/* * */

function parsePrefixedLineId(lineId: string) {
	const prefixedLineId = lineId.match(/^\[(\d+)\](.+)$/);
	if (!prefixedLineId) return null;

	return {
		agencyId: prefixedLineId[1],
		rawId: prefixedLineId[2],
	};
}

function getLineLookupKeys(lineId: string) {
	const prefixedLineId = parsePrefixedLineId(lineId);
	if (!prefixedLineId) return [lineId];

	return [`${prefixedLineId.agencyId}:${prefixedLineId.rawId}`, prefixedLineId.rawId, lineId];
}

function buildLineAgenciesById(lines?: HubLine[]) {
	const agencies = new Map<string, string>();

	for (const line of lines ?? []) {
		const lineId = String(line._id);
		const prefixedLineId = parsePrefixedLineId(lineId);

		agencies.set(lineId, line.agency_id);
		agencies.set(`${line.agency_id}:${lineId}`, line.agency_id);

		for (const routeId of line.route_ids) {
			agencies.set(routeId, line.agency_id);
			agencies.set(`${line.agency_id}:${routeId}`, line.agency_id);
		}

		if (prefixedLineId) {
			agencies.set(`${prefixedLineId.agencyId}:${prefixedLineId.rawId}`, line.agency_id);
			if (!agencies.has(prefixedLineId.rawId)) agencies.set(prefixedLineId.rawId, line.agency_id);
		}
	}

	return agencies;
}

function getLineAgencyId(lineId: string, lineAgenciesById: Map<string, string>) {
	for (const lookupKey of getLineLookupKeys(lineId)) {
		const agencyId = lineAgenciesById.get(lookupKey);
		if (agencyId) return agencyId;
	}

	const prefixedLineId = parsePrefixedLineId(lineId);
	if (prefixedLineId) return prefixedLineId.agencyId;

	const agencyPrefixedLineId = lineId.match(/^(\d+):/);
	return agencyPrefixedLineId?.[1];
}

function collectLineApprovals(rows: Record<string, unknown>[]) {
	const lineApprovals = new Map<string, LineApprovalAccumulator>();

	for (const row of rows) {
		const lineId = getEntityId(row, 'line', LINE_FIELD_CANDIDATES);
		if (!lineId) continue;

		const current = lineApprovals.get(lineId);
		const agencyId = getAgencyId(row);
		const feedbackCount = getFeedbackCount(row);

		lineApprovals.set(lineId, {
			agencyId: agencyId ?? current?.agencyId,
			happyCount: (current?.happyCount ?? 0) + (row.mood === 'happy' ? feedbackCount : 0),
			unhappyCount: (current?.unhappyCount ?? 0) + (row.mood === 'unhappy' ? feedbackCount : 0),
		});
	}

	return lineApprovals;
}

function toOperatorApprovalIndexes(operatorApprovalTotals: Map<string, OperatorApprovalTotal>) {
	return new Map<string, number>(
		Array.from(operatorApprovalTotals.entries()).map(([agencyId, operatorApproval]) => [
			agencyId,
			operatorApproval.satisfactionTotal / operatorApproval.lineCount,
		]),
	);
}

/* * */

export function buildOperatorApprovalIndexes(rows: Record<string, unknown>[], lines?: HubLine[]) {
	const lineAgenciesById = buildLineAgenciesById(lines);
	const lineApprovals = collectLineApprovals(rows);
	const operatorApprovalTotals = new Map<string, OperatorApprovalTotal>();

	for (const [lineId, lineApproval] of lineApprovals.entries()) {
		const moodFeedbackCount = lineApproval.happyCount + lineApproval.unhappyCount;
		if (moodFeedbackCount === 0) continue;

		const agencyId = lineApproval.agencyId ?? getLineAgencyId(lineId, lineAgenciesById);
		if (!agencyId) continue;

		const current = operatorApprovalTotals.get(agencyId);
		const satisfactionIndex = calculateFeedbackSatisfactionIndex(lineApproval.happyCount, lineApproval.unhappyCount);

		operatorApprovalTotals.set(agencyId, {
			lineCount: (current?.lineCount ?? 0) + 1,
			satisfactionTotal: (current?.satisfactionTotal ?? 0) + satisfactionIndex,
		});
	}

	return toOperatorApprovalIndexes(operatorApprovalTotals);
}
