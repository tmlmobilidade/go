/* * */

import { type SamAnalysis } from '@tmlmobilidade/types';

/* * */

export const LAST_TYPE_LABEL: Record<NonNullable<SamAnalysis['last_transaction_type']>, string> = {
	location: 'L',
	on_board_refund: 'R',
	on_board_sale: 'S',
	validation: 'V',
};

const TYPE_TEXT: Record<NonNullable<SamAnalysis['last_transaction_type']>, string> = {
	location: 'Location',
	on_board_refund: 'On-board refund',
	on_board_sale: 'On-board sale',
	validation: 'Validation',
};

const valueOrDash = (value: null | number | string | undefined): string => (value == null ? '-' : String(value));

const formatTs = (ts: null | number | undefined): string => {
	if (ts == null) return '-';
	const date = new Date(ts);
	if (Number.isNaN(date.getTime())) return String(ts);
	return date.toLocaleString('pt-PT', { hour12: false, timeZone: 'Europe/Lisbon' });
};

/** Same rule as day-level grouping in `organized_by_dates` (transaction ids present). */
export const analysisSquareHasValues = (a: SamAnalysis) =>
	a.last_transaction_id != null || a.first_transaction_id != null;

export const analysisSquareLabel = (a: SamAnalysis): string => {
	if (!analysisSquareHasValues(a)) return '-';
	const type = a.last_transaction_type ?? a.first_transaction_type;
	if (type && LAST_TYPE_LABEL[type]) return LAST_TYPE_LABEL[type];
	return '•';
};

export const analysisSquareTitle = (a: SamAnalysis): string | undefined => {
	if (!analysisSquareHasValues(a)) return undefined;
	return [a.last_transaction_type, a.last_transaction_id].filter(Boolean).join(' · ');
};

/** Label for day/month aggregates: how many analyses in that bucket. */
export const analysisCountTooltipLabel = (count: number): string =>
	count === 0 ? 'sem análises' : count === 1 ? '1 análise' : `${count} análises`;

