import { type GtfsValidationOutputMessage, type GtfsValidationOutputResult, type GtfsValidationOutputSummary } from '@tmlmobilidade/go-types-gtfs-validator';
import { type SeverityStatus } from '@tmlmobilidade/go-types-shared';

/* * */

interface LegacyValidationMessage {
	file_name: string
	message: string
	rows?: number[]
	rule_id: string
	severity: SeverityStatus
}

interface LegacyValidationGroup extends LegacyValidationMessage {
	messages?: LegacyValidationMessage[]
	total_rows?: number
}

interface LegacyValidationSummary {
	messages: LegacyValidationGroup[]
	total_errors: number
	total_warnings: number
}

export type ValidationsDetailResultSeverity = Exclude<SeverityStatus, 'ignore'>;

export interface ValidationsDetailResultsData {
	results: { id: string, result: GtfsValidationOutputResult }[]
	totals: GtfsValidationOutputSummary['totals']
}

const EMPTY_TOTALS = { errors: 0, infos: 0, warnings: 0 };
const SEVERITY_RANK = { error: 3, ignore: 0, info: 1, warning: 2 };

/* * */

export function getValidationsDetailResults(
	summary: GtfsValidationOutputSummary | LegacyValidationSummary | null | undefined,
	severity: null | ValidationsDetailResultSeverity,
): ValidationsDetailResultsData {
	if (!summary) return { results: [], totals: EMPTY_TOTALS };

	if ('results' in summary) {
		const results = summary.results
			.filter(result => result.severity !== 'ignore' && (severity === null || result.severity === severity))
			.map(result => ({ id: result.rule_id, result }));

		return { results, totals: summary.totals };
	}

	return getLegacyValidationResults(summary, severity);
}

/* * */

/** Adapts saved flat and grouped reports to the current result shape. */
function getLegacyValidationResults(
	summary: LegacyValidationSummary,
	severity: null | ValidationsDetailResultSeverity,
): ValidationsDetailResultsData {
	const resultsById = new Map<string, {
		description: string
		messages: GtfsValidationOutputMessage[]
		rows: Set<number>
		rule_id: string
		severity: SeverityStatus
		totalRows: number
	}>();
	let infos = 0;

	for (const entry of summary.messages) {
		const groupedMessages = entry.messages?.length ? entry.messages : undefined;
		const messages = groupedMessages ?? [entry];
		const id = JSON.stringify([entry.file_name, entry.rule_id]);

		for (const message of messages) {
			if (message.severity === 'info') infos++;
			if (message.severity === 'ignore' || (severity !== null && message.severity !== severity)) continue;

			let group = resultsById.get(id);
			if (!group) {
				const ruleName = entry.rule_id.replaceAll('_', ' ').trim() || entry.rule_id;
				group = {
					description: groupedMessages ? entry.message : ruleName.charAt(0).toUpperCase() + ruleName.slice(1),
					messages: [],
					rows: new Set(),
					rule_id: entry.rule_id,
					severity: message.severity,
					totalRows: 0,
				};
				resultsById.set(id, group);
			}

			const rows = message.rows ?? [];
			group.messages.push({ message: message.message, rows });
			for (const row of rows) group.rows.add(row);
			if (SEVERITY_RANK[message.severity] > SEVERITY_RANK[group.severity]) group.severity = message.severity;
		}

		const group = resultsById.get(id);
		if (group && groupedMessages && severity === null) group.totalRows = Math.max(group.totalRows, entry.total_rows ?? 0);
	}

	return {
		results: Array.from(resultsById, ([id, { rows, totalRows, ...result }]) => ({
			id,
			result: { ...result, total_rows: Math.max(rows.size, totalRows) },
		})),
		totals: { errors: summary.total_errors, infos, warnings: summary.total_warnings },
	};
}
