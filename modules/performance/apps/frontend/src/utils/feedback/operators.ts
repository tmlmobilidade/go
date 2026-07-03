import type { Agency, PublicFeedback } from '@tmlmobilidade/types';

import { calculateFeedbackSatisfactionIndex } from '../metrics/feedback-metrics';

/* * */

const OPERATOR_ID_COLLATOR = new Intl.Collator('pt-PT', { numeric: true, sensitivity: 'base' });

const AGENCY_ID_TO_LOGO_SHORT_NAME: Record<string, string> = {
	1: 'ccfl',
	15: 'fertagus',
	16: 'mts',
	2: 'ml',
	21: 'mobi',
	3: 'cp',
	4: 'ttsl',
	41: 'cmet',
	42: 'cmet',
	43: 'cmet',
	44: 'cmet',
	8: 'tcb',
	CM: 'cmet',
};

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

export function getOperatorLogoSrc(operatorId: string) {
	const shortName = AGENCY_ID_TO_LOGO_SHORT_NAME[operatorId];
	if (!shortName) return;

	return `${process.env.NEXT_PUBLIC_BASE_PATH}/assets/navegante/agency-logos/180x120/navegante-agency-logo-${shortName}-180x120-light.png`;
}

export function getOperatorName(operator: Agency) {
	return operator.public_name || operator.name || operator.short_name || operator._id;
}

export function sortOperatorsByCode(operators: Agency[] = []) {
	return [...operators].sort(compareOperatorsByCode);
}
