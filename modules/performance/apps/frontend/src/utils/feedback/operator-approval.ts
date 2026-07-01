/* * */

import { type PublicFeedback } from '@tmlmobilidade/types';

import { calculateFeedbackSatisfactionIndex } from './feedback-metrics';

/* * */

interface OperatorApprovalCounts {
	happyFeedbackCount: number
	unhappyFeedbackCount: number
}

/* * */

function toOperatorApprovalIndexes(operatorApprovalCounts: Map<string, OperatorApprovalCounts>) {
	return new Map<string, number>(
		Array.from(operatorApprovalCounts.entries()).map(([agencyId, counts]) => [
			agencyId,
			calculateFeedbackSatisfactionIndex(counts.happyFeedbackCount, counts.unhappyFeedbackCount),
		]),
	);
}

/* * */

export function buildOperatorApprovalIndexes(rows: PublicFeedback[]) {
	const operatorApprovalCounts = new Map<string, OperatorApprovalCounts>();

	for (const row of rows) {
		const current = operatorApprovalCounts.get(row.agency_id);

		operatorApprovalCounts.set(row.agency_id, {
			happyFeedbackCount: (current?.happyFeedbackCount ?? 0) + (row.mood === 'happy' ? 1 : 0),
			unhappyFeedbackCount: (current?.unhappyFeedbackCount ?? 0) + (row.mood === 'unhappy' ? 1 : 0),
		});
	}

	return toOperatorApprovalIndexes(operatorApprovalCounts);
}
