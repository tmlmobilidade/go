/* * */

import type { FeedbackEntityType } from '../../feedback-metrics';

/* * */

export const LINE_FIELD_CANDIDATES = ['line_id', 'lineId', 'linha', 'route_id', 'routeId'];
export const STOP_FIELD_CANDIDATES = ['stop_id', 'stopId', 'stop_code', 'stopCode', 'stop_name', 'stopName', 'paragem_id', 'paragem'];

const AGENCY_FIELD_CANDIDATES = ['agency_id', 'agencyId', 'operator_id', 'operatorId'];
const FEEDBACK_COUNT_FIELD_CANDIDATES = ['feedback_count', 'feedbacks', 'count', 'qty', 'total'];

/* * */

function getPreviewId(value: unknown) {
	if (typeof value === 'string') return value;
	if (typeof value === 'number') return String(value);
	return null;
}

function getCandidateValue(row: Record<string, unknown>, candidates: string[]) {
	const field = candidates.find(candidate => row[candidate] !== null && row[candidate] !== undefined && row[candidate] !== '');
	if (!field) return null;

	return row[field];
}

/* * */

export function getFeedbackCount(row: Record<string, unknown>) {
	const feedbackCount = getCandidateValue(row, FEEDBACK_COUNT_FIELD_CANDIDATES);
	if (typeof feedbackCount !== 'number') return 1;
	return feedbackCount;
}

export function getEntityId(row: Record<string, unknown>, entityType: FeedbackEntityType, fieldCandidates: string[]) {
	if (row.entity_type && row.entity_type !== entityType) return null;
	if (row.entity_type === entityType) return getPreviewId(row.entity_id);

	return getPreviewId(getCandidateValue(row, fieldCandidates));
}

export function getAgencyId(row: Record<string, unknown>) {
	return getPreviewId(getCandidateValue(row, AGENCY_FIELD_CANDIDATES));
}
