import type { PublicFeedback } from '@tmlmobilidade/go-types-performance';
import type { Agency } from '@tmlmobilidade/types';

import { calculateFeedbackSatisfactionIndex } from '../metrics/feedback-metrics';

/* * */

const OPERATOR_ID_COLLATOR = new Intl.Collator('pt-PT', { numeric: true, sensitivity: 'base' });

interface OperatorApprovalCounts {
	happyFeedbackCount: number
	unhappyFeedbackCount: number
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

	return new Map<string, number>(
		Array.from(operatorApprovalCounts.entries()).map(([agencyId, counts]) => [
			agencyId,
			calculateFeedbackSatisfactionIndex(counts.happyFeedbackCount, counts.unhappyFeedbackCount),
		]),
	);
}

export function compareOperatorsByCode(operatorA: Agency, operatorB: Agency) {
	return OPERATOR_ID_COLLATOR.compare(operatorA._id, operatorB._id);
}

export function getOperatorName(operator: Agency) {
	return operator.public_name || operator.name || operator.short_name || operator._id;
}

export function sortOperatorsByCode(operators: Agency[] = []) {
	return [...operators].sort(compareOperatorsByCode);
}
