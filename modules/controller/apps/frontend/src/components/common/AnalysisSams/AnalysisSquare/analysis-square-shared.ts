/* * */

import { type SamAnalysis } from '@tmlmobilidade/types';

/* * */

/** Same rule as `buildTimelineSummary`: both transaction ids required for success. */
export const analysisSquareHasValues = (a: SamAnalysis) =>
	a.last_transaction_id != null && a.first_transaction_id != null;

export const analysisSquareTitle = (a: SamAnalysis): string | undefined => {
	if (!analysisSquareHasValues(a)) return undefined;
	return [a.last_transaction_type, a.last_transaction_id].filter(Boolean).join(' - ');
};

/** Label for day/month aggregates: how many analyses in that bucket. */
export function getAnalysisBucketCounts(analyses: SamAnalysis[]): { failed: number, successful: number, total: number } {
	const total = analyses.length;
	const successful = analyses.filter(analysisSquareHasValues).length;
	return {
		failed: total - successful,
		successful,
		total,
	};
}

/** Label for day/month aggregates: explicit totals and split counts. */
export const analysisCountTooltipLabel = (counts: { failed: number, successful: number, total: number }): string =>
	counts.total === 0
		? 'sem análises'
		: `Total: ${counts.total} | Sucesso: ${counts.successful} | Falha: ${counts.failed}`;

/** Timeline chip tooltip: period label plus aggregate counts (or “sem análises”). */
export function analysisTimelinePeriodTooltipLabel(args: {
	failed: number
	periodLabel: string
	successful: number
	total: number
}): string {
	const detail = analysisCountTooltipLabel({
		failed: args.failed,
		successful: args.successful,
		total: args.total,
	});
	return `${args.periodLabel} - ${detail}`;
}

