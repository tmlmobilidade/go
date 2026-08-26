import { type GtfsValidationRule, GtfsValidationRuleSchema, gtfsValidationRulesConfig } from '@tmlmobilidade/go-types-gtfs-validator';
import { type SeverityStatus, SeverityStatusSchema } from '@tmlmobilidade/go-types-shared';

/* * */

export type NestedValidationRuleConfig = GtfsValidationRule[string];
export type NestedValidationRuleGroup = Record<string, NestedValidationRuleConfig | SeverityStatus>;
export type NestedValidationRules = Record<string, NestedValidationRuleGroup>;

/* * */

const FILE_RULE_SUFFIX = '_file_required';

/* * */

export function getNestedValidationRules(value: unknown): NestedValidationRules {
	const parsedValue = parseJsonValue(value);
	const nestedRules = parseNestedValidationRules(parsedValue);
	if (nestedRules) return nestedRules;

	const flatRulesResult = GtfsValidationRuleSchema.safeParse(parsedValue);
	return buildNestedRules(flatRulesResult.success ? flatRulesResult.data : gtfsValidationRulesConfig);
}

export function getValidationRuleSeverity(rule: NestedValidationRuleConfig | SeverityStatus): SeverityStatus {
	return typeof rule === 'string' ? rule : rule.severity;
}

export function parseNestedValidationRules(value: unknown): NestedValidationRules | null {
	const parsedValue = parseJsonValue(value);
	if (!isRecord(parsedValue) || Object.keys(parsedValue).length === 0) return null;

	const result: NestedValidationRules = {};

	for (const [groupName, groupValue] of Object.entries(parsedValue)) {
		if (!isRecord(groupValue)) return null;

		const fileSeverityResult = SeverityStatusSchema.safeParse(groupValue._file);
		if (!fileSeverityResult.success) return null;

		const rulesResult = GtfsValidationRuleSchema.safeParse(Object.fromEntries(
			Object.entries(groupValue).filter(([ruleId]) => ruleId !== '_file'),
		));
		if (!rulesResult.success) return null;

		result[groupName] = {
			_file: fileSeverityResult.data,
			...rulesResult.data,
		};
	}

	return result;
}

export function updateValidationRuleSeverity(rules: NestedValidationRules, groupName: string, ruleId: string, severity: SeverityStatus): NestedValidationRules {
	const currentRule = rules[groupName]?.[ruleId];

	return {
		...rules,
		[groupName]: {
			...rules[groupName],
			[ruleId]: typeof currentRule === 'object'
				? { ...currentRule, severity }
				: severity,
		},
	};
}

/* * */

function buildNestedRules(rules: GtfsValidationRule): NestedValidationRules {
	const result: NestedValidationRules = {};
	const groupNames = Object.keys(rules)
		.filter(ruleId => ruleId.endsWith(FILE_RULE_SUFFIX))
		.map(ruleId => ruleId.slice(0, -FILE_RULE_SUFFIX.length))
		.sort((a, b) => b.length - a.length);

	for (const [ruleId, ruleConfig] of Object.entries(rules)) {
		const fileRuleId = ruleId.endsWith(FILE_RULE_SUFFIX)
			? ruleId
			: ruleConfig.depends_on?.find(dependency => dependency.endsWith(FILE_RULE_SUFFIX));
		const groupName = fileRuleId?.slice(0, -FILE_RULE_SUFFIX.length) ?? groupNames.find(name => ruleId.startsWith(`${name}_`));

		if (!groupName) continue;
		result[groupName] ??= {};

		if (ruleId.endsWith(FILE_RULE_SUFFIX)) {
			result[groupName]._file = ruleConfig.severity;
			continue;
		}

		const { compare, options, severity } = ruleConfig;
		result[groupName][ruleId] = {
			...(compare && { compare }),
			...(options && { options }),
			severity,
		};
	}

	return result;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJsonValue(value: unknown): unknown {
	if (typeof value !== 'string') return value;

	try {
		return JSON.parse(value) as unknown;
	} catch {
		return null;
	}
}
