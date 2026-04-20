import { type Sam, type SamAnalysis, type SystemStatus } from '@tmlmobilidade/types';

type SamTxAggregate = Pick<Sam, 'transactions_expected' | 'transactions_found' | 'transactions_missing'>;

/** Expected / found / missing line up (0 expected ⇒ 0 found). */
function countsReconcile(expected: number, found: number, missing: number): boolean {
	if (missing > 0)
		return false;
	if (expected === 0)
		return found === 0;
	return found === expected;
}

/** `null` if any field missing; otherwise whether counts reconcile. */
function rootReconciliation(sam: SamTxAggregate): boolean | null {
	const { transactions_expected: e, transactions_found: f, transactions_missing: m } = sam;
	if (e == null || f == null || m == null)
		return null;
	return countsReconcile(e, f, m);
}

function rootHasNoUsableAggregate(sam: SamTxAggregate): boolean {
	const { transactions_expected: e, transactions_found: f, transactions_missing: m } = sam;
	return (e == null && f == null && m == null) || (e === 0 && f === 0 && m === 0);
}

function analysisRowIsEmpty(a: SamAnalysis): boolean {
	const values = Object.values(a);
	return values.length === 0 || values.every(v => v === null || v === undefined);
}

function analysisRowIsFullyComplete(a: SamAnalysis): boolean {
	const ids = a.first_transaction_id != null && a.last_transaction_id != null;
	return ids && countsReconcile(a.transactions_expected, a.transactions_found, a.transactions_missing);
}

export function getSamSystemStatus(sam: Omit<Sam, 'analysis'> | Sam): SystemStatus {
	const raw = 'analysis' in sam && Array.isArray(sam.analysis) ? sam.analysis : [];
	const rows = raw.filter((row): row is SamAnalysis => row != null && typeof row === 'object');
	const meaningful = rows.filter(a => !analysisRowIsEmpty(a));

	if (meaningful.length === 0) {
		if (rootHasNoUsableAggregate(sam))
			return 'error';
		const fromRoot = rootReconciliation(sam);
		if (fromRoot !== null)
			return fromRoot ? 'complete' : 'incomplete';
		return 'incomplete';
	}

	return meaningful.every(analysisRowIsFullyComplete) ? 'complete' : 'incomplete';
}
