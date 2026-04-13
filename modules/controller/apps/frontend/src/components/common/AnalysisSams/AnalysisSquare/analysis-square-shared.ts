/* * */

import { type SamAnalysis } from '@tmlmobilidade/types';

/* * */

export const LAST_TYPE_LABEL: Record<NonNullable<SamAnalysis['last_transaction_type']>, string> = {
	location: 'L',
	on_board_refund: 'R',
	on_board_sale: 'S',
	validation: 'V',
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

