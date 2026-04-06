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

export const analysisSquareTooltipItems = (a: SamAnalysis): string[] => {
	const firstType = a.first_transaction_type ? TYPE_TEXT[a.first_transaction_type] : '-';
	const lastType = a.last_transaction_type ? TYPE_TEXT[a.last_transaction_type] : '-';
	const listItem = (label: string, value: null | number | string | undefined) => `${label}: ${valueOrDash(value)}`;

	return [
		listItem('Apex version', valueOrDash(a.apex_version)),
		listItem('Device', valueOrDash(a.device_id)),
		listItem('Vehicle', valueOrDash(a.vehicle_id)),
		listItem('Inicio', formatTs(a.start_time)),
		listItem('Fim', formatTs(a.end_time)),
		listItem('Primeira transacao tipo', firstType),
		listItem('Primeira transacao ID', valueOrDash(a.first_transaction_id)),
		listItem('Primeira transacao ASE', valueOrDash(a.first_transaction_ase_counter_value)),
		listItem('Ultima transacao tipo', lastType),
		listItem('Ultima transacao ID', valueOrDash(a.last_transaction_id)),
		listItem('Ultima transacao ASE', valueOrDash(a.last_transaction_ase_counter_value)),
		listItem('Transacoes esperadas', a.transactions_expected),
		listItem('Transacoes encontradas', a.transactions_found),
		listItem('Transacoes em falta', a.transactions_missing),
	];
};

export const analysisSquareTooltip = (a: SamAnalysis): string | undefined => {
	return analysisSquareTooltipItems(a).join('\n');
};
