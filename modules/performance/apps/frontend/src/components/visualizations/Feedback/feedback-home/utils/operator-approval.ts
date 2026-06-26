/* * */

import { type HubLine, type PublicFeedback } from '@tmlmobilidade/types';

import { getFeedbackMetricsByEntity } from '../../feedback-metrics';
import { buildLineAgenciesById, getLineAgencyId } from '../../network-labels';

/* * */

interface OperatorApprovalTotal {
	lineCount: number
	satisfactionTotal: number
}

/* * */

function buildFeedbackLineAgenciesById(rows: PublicFeedback[]) {
	return new Map(
		rows
			.filter(row => row.entity_type === 'line')
			.map(row => [row.entity_id, row.agency_id]),
	);
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

export function buildOperatorApprovalIndexes(rows: PublicFeedback[], lines?: HubLine[]) {
	const lineAgenciesById = buildLineAgenciesById(lines);
	const feedbackLineAgenciesById = buildFeedbackLineAgenciesById(rows);
	const lineMetrics = getFeedbackMetricsByEntity(rows, 'line');
	const operatorApprovalTotals = new Map<string, OperatorApprovalTotal>();

	for (const lineMetric of lineMetrics) {
		const agencyId = feedbackLineAgenciesById.get(lineMetric.entityId) ?? getLineAgencyId(lineMetric.entityId, lineAgenciesById);
		if (!agencyId) continue;

		const current = operatorApprovalTotals.get(agencyId);

		operatorApprovalTotals.set(agencyId, {
			lineCount: (current?.lineCount ?? 0) + 1,
			satisfactionTotal: (current?.satisfactionTotal ?? 0) + lineMetric.satisfactionIndex,
		});
	}

	return toOperatorApprovalIndexes(operatorApprovalTotals);
}
