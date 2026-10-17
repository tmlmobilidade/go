/* * */

import { type GtfsValidationOutputMessage, type GtfsValidationOutputRuleMessage } from '@tmlmobilidade/go-types-gtfs-validator';
import { type SeverityStatus } from '@tmlmobilidade/go-types-shared';

/* * */

/**
 * Ranks severities so a group can report the most serious one it contains.
 * A rule that reported both errors and warnings should read as an error.
 */
const SEVERITY_RANK: Record<SeverityStatus, number> = {
	error: 4,
	forbidden: 3,
	ignore: 0,
	info: 1,
	warning: 2,
};

/* * */

/**
 * Normalizes a summary's messages into one entry per rule.
 *
 * The validator already groups them and supplies each rule's generic sentence, so new
 * validations pass straight through. Validations stored before the summary was grouped
 * carry flat messages, which are grouped here so older records still render.
 */
export function normalizeValidationMessageGroups(messages: (GtfsValidationOutputMessage | GtfsValidationOutputRuleMessage)[]): GtfsValidationOutputRuleMessage[] {
	const grouped = messages.filter((message): message is GtfsValidationOutputRuleMessage => 'messages' in message && (message.messages?.length ?? 0) > 0);
	if (grouped.length === messages.length) {
		return grouped;
	}

	const legacy = messages
		.filter(message => !('messages' in message) || !message.messages?.length)
		.map(message => ({ ...message, rows: message.rows ?? [] }));

	return [...grouped, ...groupLegacyMessages(legacy)];
}

/**
 * Filters a grouped summary by severity, keeping only the messages that match and
 * dropping the rules left with nothing, so the counts stay honest while filtering.
 */
export function filterGroupsBySeverity(groups: GtfsValidationOutputRuleMessage[], severity: null | SeverityStatus): GtfsValidationOutputRuleMessage[] {
	if (!severity) {
		return groups;
	}

	return groups
		.map(group => ({ ...group, messages: group.messages.filter(message => message.severity === severity) }))
		.filter(group => group.messages.length > 0);
}

/**
 * Rebuilds the grouped shape from a flat list of messages, for summaries produced
 * before the validator grouped them. The generic sentence is not available for these,
 * so the rule id stands in, humanized the same way the validator does.
 */
function groupLegacyMessages(messages: GtfsValidationOutputMessage[]): GtfsValidationOutputRuleMessage[] {
	const groupsByKey = new Map<string, GtfsValidationOutputRuleMessage>();
	const fieldsByKey = new Map<string, Set<string>>();
	const rowsByKey = new Map<string, Set<number>>();

	for (const message of messages) {
		const key = `${message.file_name}::${message.rule_id}`;

		let group = groupsByKey.get(key);
		if (!group) {
			group = {
				field: message.field,
				file_name: message.file_name,
				message: humanizeRuleId(message.rule_id),
				messages: [],
				rule_id: message.rule_id,
				severity: message.severity,
				total_rows: 0,
			};
			groupsByKey.set(key, group);
			fieldsByKey.set(key, new Set());
			rowsByKey.set(key, new Set());
		}

		group.messages.push(message);
		fieldsByKey.get(key)?.add(message.field);
		for (const row of message.rows ?? []) {
			rowsByKey.get(key)?.add(row);
		}

		if (SEVERITY_RANK[message.severity] > SEVERITY_RANK[group.severity]) {
			group.severity = message.severity;
		}
	}

	for (const [key, group] of groupsByKey) {
		group.field = [...(fieldsByKey.get(key) ?? [])].join(', ');
		group.total_rows = rowsByKey.get(key)?.size ?? 0;
	}

	return [...groupsByKey.values()];
}

/**
 * Turns a rule id into a readable title, matching the validator's own fallback.
 */
function humanizeRuleId(ruleId: string): string {
	const humanized = ruleId.replaceAll('_', ' ').trim();
	if (!humanized) {
		return ruleId;
	}

	return humanized.charAt(0).toUpperCase() + humanized.slice(1);
}
